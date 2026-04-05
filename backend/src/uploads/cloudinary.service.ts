import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import type { Express } from 'express';

@Injectable()
export class CloudinaryService {
  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME') ?? '',
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY') ?? '',
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET') ?? '',
      secure: true,
    });
  }

  private ensureConfigured() {
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME') ?? '';
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY') ?? '';
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET') ?? '';

    if (!cloudName || !apiKey || !apiSecret) {
      throw new InternalServerErrorException('Cloudinary is not configured');
    }
  }

  async uploadPostImage(file: Express.Multer.File) {
    this.ensureConfigured();

    const dataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    const baseName = file.originalname.replace(/\.[^.]+$/, '');

    try {
      const uploaded = await cloudinary.uploader.upload(dataUri, {
        folder: 'devlog/posts',
        resource_type: 'image',
        use_filename: true,
        unique_filename: true,
        filename_override: baseName,
      });

      return {
        url: uploaded.secure_url,
        publicId: uploaded.public_id,
        width: uploaded.width,
        height: uploaded.height,
        format: uploaded.format,
        bytes: uploaded.bytes,
      };
    } catch {
      throw new InternalServerErrorException('Failed to upload image');
    }
  }
}

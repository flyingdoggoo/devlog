import { ConflictException, Injectable } from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { PrismaService } from '@prisma/prisma.service';
@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  async createTag(createTagDto: CreateTagDto) {
    const { name } = createTagDto;
    const existing = await this.prisma.tag.findUnique({ where: { name } });
    if (existing) throw new ConflictException(`Tag "${name}" already exists`);
    return this.prisma.tag.create({
      data: {
        name,
      },
    });    
  }

  async findAllTags() {
    return this.prisma.tag.findMany();
  }

  async findTagsById(id: string) {
    return this.prisma.tag.findUnique({ where: { id } });
  }

  async updateTag(id: string, updateTagDto: UpdateTagDto) {
    const { name } = updateTagDto;
    const existing = await this.prisma.tag.findUnique({ where: { name } });
    if (existing && existing.id !== id) {
      throw new ConflictException(`Tag "${name}" already exists`);
    }
    return this.prisma.tag.update({
      where: { id },
      data: { name },
    });
  }

  async removeTag(id: string) {
    return this.prisma.tag.delete({ where: { id } });
  }
}

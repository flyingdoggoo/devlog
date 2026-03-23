import { MinLength, IsString, IsEnum, IsOptional, IsArray } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { PostStatus } from "@prisma/client";
export class CreatePostDto {
    @IsString({ message: 'Title must be a string' })
    @MinLength(3, { message: 'Title should be at least 3 characters long' })
    @Transform(({ value }) => value.trim())
    title: string;

    @IsString({ message: 'Content must be a string' })
    @MinLength(10, { message: 'Content should be at least 10 characters long' })
    @Transform(({ value }) => value.trim())
    content: string;

    @ApiPropertyOptional({enum: PostStatus, default: 'DRAFT'})
    @IsEnum(PostStatus, { message: 'Status must be either DRAFT or PUBLISHED' })
    @IsOptional()
    status?: PostStatus;

    @ApiProperty({
        description: 'List of tag names to associate with the post',
        example: ['nestjs', 'prisma', 'typescript'],
    })
    @IsArray({ message: 'Tags must be an array of strings' })
    @IsString({ each: true, message: 'Each tag must be a string' })
    tags?: string[];

    @ApiPropertyOptional({
        description: 'URL of the cover image for the post',
        example: 'https://example.com/images/cover.jpg',
        required: false
    })
    coverImageUrl?: string;

    @ApiProperty({
        description: 'The date and time when the post should be published (ISO 8601 format)',
        example: '2024-12-31T23:59:59Z',
        required: false
    })
    publishedAt?: string;


    @ApiProperty({
        description: 'A short excerpt or summary of the post content',
        example: 'This post explores the integration of NestJS with Prisma for building robust APIs.',
        required: false
    })
    @IsOptional()
    @IsString({ message: 'Excerpt must be a string' })
    @MinLength(10, { message: 'Excerpt should be at least 10 characters long' })
    excerpt?: string;
}
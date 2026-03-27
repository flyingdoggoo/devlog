import { MinLength, IsString, IsEnum, IsOptional, IsArray, IsUUID } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { PostStatus } from "@prisma/client";
export class CreatePostDto {
    @IsString({ message: 'Title must be a string' })
    @MinLength(3, { message: 'Title should be at least 3 characters long' })
    @Transform(({ value }) => value.trim())
    @ApiProperty({ example: 'My First Blog Post' })
    title: string;

    @IsString({ message: 'Content must be a string' })
    @MinLength(10, { message: 'Content should be at least 10 characters long' })
    @Transform(({ value }) => value.trim())
    @ApiProperty({ example: 'This is the content of my first blog post.' })
    content: string;

    @ApiPropertyOptional({ enum: PostStatus, default: 'PUBLISHED' })
    @IsEnum(PostStatus, { message: 'Status must be either DRAFT or PUBLISHED' })
    @IsOptional()
    status?: PostStatus;

    @ApiProperty({
        description: 'List of tag names to associate with the post',
        example: ["c7957d3e-4d1f-49f5-98ca-82f78851d91f",
            "23382f0e-f1f0-4695-b01a-96ce70cc9ad8",
            "7b3aba1d-b829-41da-9925-e8aba75d252a"],
    })
    @IsArray({ message: 'Tag IDs must be an array of strings' })
    @IsString({ each: true, message: 'Each tag ID must be a string' })
    @IsUUID('4', { each: true, message: 'Each tag ID must be a valid UUID' })
    tagIds?: string[];

    @ApiPropertyOptional({
        description: 'URL of the cover image for the post',
        example: 'https://example.com/images/cover.jpg',
        required: false
    })
    @IsOptional()
    @IsString({ message: 'Cover image URL must be a string' })
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
import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsOptional, IsString, IsUUID, MinLength } from "class-validator";

export class CreateCommentDto {
    @IsString({ message: 'Content must be a string' })
    @MinLength(1, { message: 'Content should be at least 1 character long' })
    @Transform(({ value }) => value.trim())
    @ApiProperty({ example: 'This is a comment' })
    content: string;

    @IsOptional()
    @IsString({ message: 'Parent ID must be a string' })
    @IsUUID('4', { message: 'Parent ID must be a valid UUID' })
    parentId?: string;
}


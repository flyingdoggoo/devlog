import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateUserDto {
    @ApiPropertyOptional({ example: 'Nguyen Van A' })
    @IsString({ message: 'Name must be a string' })
    @IsOptional()
    name?: string;

    @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
    @IsString({ message: 'Avatar must be a string' })
    @IsOptional()
    avatar?: string;

    @ApiPropertyOptional({ example: 'john_doe' })
    @IsString({ message: 'Username must be a string' })
    @MinLength(3, { message: 'Username should be at least 3 characters long' })
    @MaxLength(30, { message: 'Username should be at most 30 characters long' })
    @Transform(({ value }) => value.trim().toLowerCase())
    @IsOptional()
    username?: string;

}

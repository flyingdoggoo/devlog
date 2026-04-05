import { IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
export class CreateTagDto {
    @ApiProperty({ example: 'nestjs' })
    @IsString({ message: 'Tag name must be a string' })
    @MaxLength(10, { message: 'Tag name must be at most 10 characters long' })
    @Transform(({ value }) => value.trim().toLowerCase())
    name: string;
}

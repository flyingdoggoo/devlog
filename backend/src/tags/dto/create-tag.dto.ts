import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
export class CreateTagDto {
    @ApiProperty({ example: 'nestjs' })
    @IsString({ message: 'Tag name must be a string' })
    @Transform(({ value }) => value.trim().toLowerCase())
    name: string;
}

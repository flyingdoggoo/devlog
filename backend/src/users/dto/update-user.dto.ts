import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    @ApiPropertyOptional({ example: 'Nguyen Van A' })
    @IsString({ message: 'Name must be a string' })
    @IsOptional()
    name?: string;
}

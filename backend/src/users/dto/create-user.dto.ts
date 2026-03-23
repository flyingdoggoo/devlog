import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Min, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
export class CreateUserDto {
    @ApiProperty({ example: 'john.doe@example.com' })
    @IsEmail({}, { message: 'Email must be a valid email address' })
    @IsNotEmpty({ message: 'Email is required' })
    @Transform(({ value }) => value.trim().toLowerCase())
    email: string;

    @ApiProperty({ example: 'john_doe' })
    @IsNotEmpty({ message: 'Username is required' })
    @Transform(({ value }) => value.trim())
    @MinLength(6, { message: 'Username should be at least 6 characters long' })
    username: string;

    @ApiProperty({ example: 'password123' })
    @IsNotEmpty({ message: 'Password is required' })
    @MinLength(8, { message: 'Password should be at least 8 characters long' })
    password: string;
}

import { IsEmail, IsNotEmpty, Min, MinLength } from "class-validator";
import { Transform } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
export class LoginDto {
    @ApiProperty({
        description: 'The email of the user',
        example: 'test@gmail.com',
    })
    @IsEmail({}, { message: 'Please enter a valid email address' })
    @Transform(({ value }) => value.trim().toLowerCase())
    email: string;

    @ApiProperty({
        description: 'The password of the user',
        example: 'password123',
    })
    @IsNotEmpty({ message: 'Password should not be empty' })
    @MinLength(6, { message: 'Password should be at least 6 characters long' })
    @Transform(({ value }) => value.trim())
    password: string;

    @ApiProperty({
        description: 'Remember me option',
        example: true,
    })
    remember: boolean;
}
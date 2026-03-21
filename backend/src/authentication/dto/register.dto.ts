import { IsEmail, IsNotEmpty, MinLength } from "class-validator";
import { Transform } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
export class RegisterDto {
    @IsEmail({}, { message: 'Please enter a valid email address' })
    @Transform(({ value }) => value.trim().toLowerCase())
    @ApiProperty({
        description: 'The email of the user',
        example: 'test@gmail.com',
    })
    email: string;

    @IsNotEmpty({ message: 'Username should not be empty' })
    @MinLength(3, { message: 'Username should be at least 3 characters long' })
    @Transform(({ value }) => value.trim())
    @ApiProperty({
        description: 'The username of the user',
        example: 'testuser',
    })
    username: string;

    @IsNotEmpty({ message: 'Password should not be empty' })
    @MinLength(6, { message: 'Password should be at least 6 characters long' })
    @Transform(({ value }) => value.trim())
    @ApiProperty({
        description: 'The password of the user',
        example: 'password123',
    })
    password: string;

    @IsNotEmpty({ message: 'Please confirm your password' })
    @MinLength(6, { message: 'Confirm password should be at least 6 characters long' })
    @Transform(({ value }) => value.trim())
    @ApiProperty({
        description: 'Please confirm your password',
        example: 'password123',
    })
    confirmPassword: string;

}

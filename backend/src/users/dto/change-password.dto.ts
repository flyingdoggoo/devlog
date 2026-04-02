import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiPropertyOptional({ example: 'old_password_123' })
  @IsOptional()
  @IsString({ message: 'Current password must be a string' })
  currentPassword?: string;

  @ApiProperty({ example: 'new_password_123' })
  @IsNotEmpty({ message: 'New password is required' })
  @IsString({ message: 'New password must be a string' })
  @MinLength(6, { message: 'New password should be at least 6 characters long' })
  newPassword: string;

  @ApiProperty({ example: 'new_password_123' })
  @IsNotEmpty({ message: 'Confirm password is required' })
  @IsString({ message: 'Confirm password must be a string' })
  confirmPassword: string;
}

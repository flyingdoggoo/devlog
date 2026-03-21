import { AuthService } from './auth.service';
import { Controller, Post, Body, UseGuards, Req, Res } from '@nestjs/common';
import { RegisterDto, LoginDto } from '@authentication/dto';
import { LocalAuthGuard } from '@authentication/guard/local.guard';
import type { Request, Response } from 'express';
import { CredentialAfterGuard } from './interface/credential-after-guard.interface';
import { RequestWithCredential } from './interface/request-with-credential.interface';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
@Controller('auth')
@ApiTags('auth')
export class AuthController {
    constructor(private authService: AuthService){}

    @Post('login')
    @ApiOperation({ summary: 'Login user and set JWT token in HttpOnly cookie' })
    @ApiBody({ type: LoginDto, description: 'User login credentials (email and password)' })
    @UseGuards(LocalAuthGuard)
    async login(
        @Body() loginDto: LoginDto,
        @Req() userRequest: RequestWithCredential,
        @Res() response: Response){
        const credential = userRequest.user;
        if(!credential){
            return response.status(401).send({ message: 'Invalid credentials' });
        }
        const newCredential: CredentialAfterGuard = {
            id: credential.id,
            email: credential.email,
            username: credential.username,
            userId: credential.userId,
            createdAt: credential.createdAt
        };
        const cookie = await this.authService.login(newCredential);
        response.setHeader('Set-Cookie', cookie);
        return response.status(200).send();
    }

    @Post('register')
    @ApiOperation({ summary: 'Register a new user' })
    async register(@Body() registerDto: RegisterDto){
        return this.authService.register(registerDto);
    }
}   
import { AuthService } from './auth.service';
import { Controller, Post, Body, UseGuards, Req, Res, Get } from '@nestjs/common';
import { RegisterDto, LoginDto } from '@authentication/dto';
import { LocalAuthGuard } from '@authentication/guard/local.guard';
import { RequestWithCredential } from './interface/request-with-credential.interface';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { GoogleAuthGuard } from './guard/google.guard';
import { RequestWithGoogleUser } from './interface/request-with-google-user-interface';
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
        const cookies = await this.authService.loginByUserId(credential.userId);
        response.setHeader('Set-Cookie', cookies);
        return response.status(200).send();
    }

    @Get('google')
    @UseGuards(GoogleAuthGuard)
    async googleLogin() {
        //Không cần xử lý gì ở đây
        //GoogleAuthGuard sẽ tự động chuyển hướng người dùng đến trang đăng nhập của Google
    }

    @Get('google/callback')
    @UseGuards(GoogleAuthGuard)
    async googleLoginCallback(@Req() req: RequestWithGoogleUser, @Res() response: Response) {
        const googleUser = req.user;
        if(!googleUser){
            return response.status(401).send({ message: 'Google authentication failed' });
        }
        const cookies = await this.authService.loginWithGoogle(googleUser);
        const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173';
        response.setHeader('Set-Cookie', cookies);
        return response.redirect(frontendUrl);
    }

    @Post('refresh')
    async refresh(@Req() request: Request, @Res() response: Response) {
        const refreshToken = request.cookies?.RefreshToken;
        const sessionId = request.cookies?.SessionId;

        if (!refreshToken || !sessionId) {
            return response.status(401).send({ message: 'Refresh token or session ID is missing' });
        }    
        const cookies = await this.authService.refreshSession(refreshToken, sessionId);
        response.setHeader('Set-Cookie', cookies);
        return response.status(200).send();
    }

    @Post('logout')
    async logout(@Req() request: Request, @Res() response: Response) {
        const sessionId = request.cookies?.SessionId;
        const cookies = await this.authService.logout(sessionId);
        response.setHeader('Set-Cookie', cookies);
        return response.status(200).send();
    }

    @Post('register')
    @ApiOperation({ summary: 'Register a new user' })
    async register(@Body() registerDto: RegisterDto){
        return this.authService.register(registerDto);
    }
}   

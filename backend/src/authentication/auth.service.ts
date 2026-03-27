import { UsersService } from '@users/users.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { RegisterDto } from '@authentication/dto/register.dto';
import { Payload } from '@authentication/interface/payload.interface';
import { GoogleUser } from './interface/request-with-google-user-interface';
import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class AuthService {
    constructor(
        private userService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService,
        private prisma: PrismaService,
    ){}
    async validateUserLocal(email: string, password: string){
        const credential = await this.userService.findByEmail(email);
        if(!credential){
            throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
        }
        const hashPasswordVerify = await bcrypt.compare(password, credential.passwordHash);
        if(!hashPasswordVerify){
            throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
        }

        return credential;
    }
    async validateUserJwt(userId: string){
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId,
                active: true,
            },
        });
        if(!user){
            throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
        }
        return {
            userId: user.id,
            name: user.name,
        };
    }

    // Tao bo cookie Authentication + RefreshToken + SessionId cho user.
    // Neu co sessionId hop le thi rotate token tren session do, khong thi tao session moi.
    private async issueSessionCookies(userId: string, sessionId?: string) {
        const accessTokenTTL = Number(this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME')) || 900;
        const refreshTokenTTL = Number(this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME')) || 604800;
        const accessToken = this.jwtService.sign({ userId } as Payload);
        const isProduction = this.configService.get('NODE_ENV') === 'production';
        const sameSite = isProduction ? 'None' : 'Lax';
        const secureFlag = isProduction ? '; Secure' : '';

        const refreshToken = randomBytes(64).toString('hex');
        const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
        const expires = new Date(Date.now() + refreshTokenTTL * 1000);

        const session = await this.prisma.session.upsert({
            where:{
                id: sessionId || 'non-existent-session-id',
            },
            update: {
                refreshTokenHash,
                expires,
            },
            create: {
                userId,
                refreshTokenHash,
                expires,
            },
        });
        const effectiveSessionId = session.id;
        const authCookie = `Authentication=${accessToken}; HttpOnly; Path=/; Max-Age=${accessTokenTTL}; SameSite=${sameSite}${secureFlag}`;
        const refreshCookie = `RefreshToken=${refreshToken}; HttpOnly; Path=/auth; Max-Age=${refreshTokenTTL}; SameSite=${sameSite}${secureFlag}`;
        const sessionCookie = `SessionId=${effectiveSessionId}; HttpOnly; Path=/auth; Max-Age=${refreshTokenTTL}; SameSite=${sameSite}${secureFlag}`;
        return [authCookie, refreshCookie, sessionCookie];
    }

    // Local login thanh cong se cap session theo userId.
    async loginByUserId(userId: string){
        return this.issueSessionCookies(userId);
    }

    // Google login:
    // 1) Da co account Google -> dang nhap
    // 2) Da co email local -> link account Google vao user cu
    // 3) Chua co gi -> tao user moi voi username/password random
    async loginWithGoogle(googleUser: GoogleUser) {
        if (!googleUser.email) {
            throw new HttpException('Google account does not provide an email', HttpStatus.BAD_REQUEST);
        }

        const existingAccount = await this.prisma.account.findFirst({
            where: {
                provider: 'google',
                providerAccountId: googleUser.id,
            },
        });

        if (existingAccount) {
            return this.issueSessionCookies(existingAccount.userId);
        }

        const existingCredential = await this.userService.findByEmail(googleUser.email);
        if (existingCredential) {
            await this.prisma.account.create({
                data: {
                    userId: existingCredential.userId,
                    provider: 'google',
                    providerAccountId: googleUser.id,
                },
            });

            const user = await this.prisma.user.findUnique({
                where: { id: existingCredential.userId },
            });
            if (user && !user.name && googleUser.name) {
                await this.prisma.user.update({
                    where: { id: existingCredential.userId },
                    data: { name: googleUser.name },
                });
            }

            return this.issueSessionCookies(existingCredential.userId);
        }

        let username = `user-${randomBytes(4).toString('hex')}`;
        while (await this.userService.findByUsername(username)) {
            username = `user-${randomBytes(4).toString('hex')}`;
        }
        const randomPassword = randomBytes(32).toString('hex');
        const passwordHash = await bcrypt.hash(randomPassword, 10);

        const createdUser = await this.prisma.user.create({
            data: {
                name: googleUser.name,
                credentials: {
                    create: {
                        email: googleUser.email,
                        username,
                        passwordHash,
                    },
                },
                accounts: {
                    create: {
                        provider: 'google',
                        providerAccountId: googleUser.id,
                    },
                },
            },
        });

        return this.issueSessionCookies(createdUser.id);
    }

    // Refresh token:
    // - Kiem tra session ton tai va chua het han
    // - So sanh refresh token (plain) voi hash trong DB
    // - Hop le thi rotate token va cap lai cookie
    async refreshSession(refreshToken: string, sessionId: string) {
        const session = await this.prisma.session.findUnique({
            where: {
                id: sessionId,
            },
        });

        if (!session || session.expires.getTime() <= Date.now()) {
            throw new HttpException('Refresh session expired', HttpStatus.UNAUTHORIZED);
        }

        const isRefreshTokenValid = await bcrypt.compare(refreshToken, session.refreshTokenHash);
        if (!isRefreshTokenValid) {
            throw new HttpException('Invalid refresh token', HttpStatus.UNAUTHORIZED);
        }

        return this.issueSessionCookies(session.userId, session.id);
    }

    async register(registerDto: RegisterDto){
        const { email, password, confirmPassword, username } = registerDto;
        if (password !== confirmPassword) {
            throw new HttpException('Passwords do not match', HttpStatus.BAD_REQUEST);
        }
        const existingUser = await this.userService.findByEmail(email) || await this.userService.findByUsername(username);
        if(existingUser){
            throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
        }
        return this.userService.createUser(registerDto);
    }
}

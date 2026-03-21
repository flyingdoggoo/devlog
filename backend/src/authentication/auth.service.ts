import { UsersService } from '@users/users.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RegisterDto } from '@authentication/dto/register.dto';
import { Payload } from '@authentication/interface/payload.interface';
import { CredentialAfterGuard } from './interface/credential-after-guard.interface';
@Injectable()
export class AuthService {
    constructor(
        private userService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService
    ){}
    async validateUserLocal(email: string, password: string){
        const credential = await this.userService.findByEmail(email);
        if(!credential){
            throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
        }
        const hashPasswordVerify = bcrypt.compareSync(password, credential.passwordHash);
        if(!hashPasswordVerify){
            throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
        }

        return credential;
    }
    async validateUserJwt(credentialId: string){
        const credential = await this.userService.findCredentialById(credentialId);
        if(!credential){
            throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
        }
        return credential;
    }
    async login(credential: CredentialAfterGuard){
        const payload: Payload = {
            credentialId: credential.id,
        };
        const token = this.jwtService.sign(payload);
        const cookie = `Authentication=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME')}`;
        return cookie;
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
        return this.userService.create(registerDto);
    }
}

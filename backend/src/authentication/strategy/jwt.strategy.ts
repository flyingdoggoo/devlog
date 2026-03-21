import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt } from 'passport-jwt';
import { Payload } from '@authentication/interface/payload.interface';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(private authService: AuthService, private configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req) => {
                    let token = null;
                    if (req && req.cookies) {
                        token = req.cookies.Authentication;
                    }
                    return token;
                }
            ]),
            secretOrKey: configService.get('JWT_SECRET') as string,
        });
    }
    async validate(payload: Payload) {
        return this.authService.validateUserJwt(payload.credentialId);
    }
}
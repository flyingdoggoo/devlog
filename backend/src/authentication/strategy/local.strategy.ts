import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { CredentialAfterGuard } from '@authentication/interface/credential-after-guard.interface';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService){
        super({ usernameField: 'email' });
    }
    async validate(email: string, password: string): Promise<CredentialAfterGuard | null> {
        try{
            return this.authService.validateUserLocal(email, password);
        } catch (err) {
            console.error('Error validating user in LocalStrategy:', err);
            return null;
        }
    }
}
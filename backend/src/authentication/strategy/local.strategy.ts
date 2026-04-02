import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { CredentialAfterGuard } from '@authentication/interface/credential-after-guard.interface';
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    private readonly logger = new Logger(LocalStrategy.name);
    constructor(private authService: AuthService){
        super({ usernameField: 'email' });
    }
    async validate(email: string, password: string): Promise<CredentialAfterGuard | null> {
        return await this.authService.validateUserLocal(email, password);
    }
}
import { AuthService } from "@authentication/auth.service";
import { AuthController } from "@authentication/auth.controller";
import { Module } from "@nestjs/common";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { UsersModule } from "@users/users.module";
import { LocalStrategy } from "./strategy/local.strategy";
import { JwtStrategy } from "./strategy/jwt.strategy";
import { PassportModule } from "@nestjs/passport";
import { GoogleStrategy } from "./strategy/google.strategy";
@Module({
    imports: [UsersModule,
        PassportModule,
        JwtModule.registerAsync({
            useFactory: (configService: ConfigService) => ({
                secret: configService.get('JWT_SECRET') as string,
                signOptions: {
                    // ConfigService returns strings; number is interpreted as seconds.
                    // If we pass string "900", jsonwebtoken treats it as 900ms.
                    // This fixes immediately-expired access tokens.
                    expiresIn: configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME'),
                },
            }),
            inject: [ConfigService],
        })
    ],
    providers: [AuthService, LocalStrategy, JwtStrategy, GoogleStrategy],
    controllers: [AuthController],
})

export class AuthModule {}

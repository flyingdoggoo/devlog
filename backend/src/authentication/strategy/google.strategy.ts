import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, Profile } from "passport-google-oauth20";
import { ConfigService } from "@nestjs/config";
import { RequestWithGoogleUser } from "@authentication/interface/request-with-google-user-interface";
import { GoogleUser } from "@authentication/interface/request-with-google-user-interface";
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
    constructor(configService: ConfigService) {
        super({
            clientID: configService.getOrThrow<string>("GOOGLE_CLIENT_ID"),
            clientSecret: configService.getOrThrow<string>("GOOGLE_CLIENT_SECRET"),
            callbackURL: configService.getOrThrow<string>("GOOGLE_REDIRECT_URI"),
            scope: ["email", "profile"],
        });
    }
    validate(accessToken: string, refreshToken: string, profile: Profile): GoogleUser {
        return {
            provider: 'google',
            profileUrl: profile._json?.picture,
            id: profile.id,
            email: profile.emails?.[0]?.value,
            name: profile.displayName,
            accessToken,
            refreshToken,
        };
    }
}
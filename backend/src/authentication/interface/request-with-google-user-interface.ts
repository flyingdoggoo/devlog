import type { Request } from 'express';

export interface GoogleUser {
	provider: 'google';
	profileUrl?: string;
	id: string;
	email?: string;
	name: string;
	accessToken: string;
	refreshToken?: string;
}

export interface RequestWithGoogleUser extends Request {
	user: GoogleUser;
}
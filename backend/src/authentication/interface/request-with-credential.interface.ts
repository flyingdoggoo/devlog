import { Request } from 'express';
import { CredentialAfterGuard } from './credential-after-guard.interface';
export interface RequestWithCredential extends Request {
  user: CredentialAfterGuard;
}
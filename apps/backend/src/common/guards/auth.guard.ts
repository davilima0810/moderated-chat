import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../../auth/auth.service';
import { PublicUser } from '../types/user.types';

export interface AuthenticatedRequest extends Request {
  user: PublicUser;
  headers: Request['headers'] & {
    authorization?: string;
  };
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorization = request.headers.authorization;
    const token = authorization?.startsWith('Bearer ')
      ? authorization.slice('Bearer '.length)
      : undefined;

    if (!token) {
      throw new UnauthorizedException('Missing bearer token');
    }

    request.user = await this.authService.verifyAccessToken(token);
    return true;
  }
}

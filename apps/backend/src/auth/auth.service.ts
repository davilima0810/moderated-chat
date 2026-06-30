import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { JWT_REFRESH_SECRET } from '../common/jwt.constants';
import { JwtUserPayload, PublicUser } from '../common/types/user.types';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async register(dto: RegisterDto) {
    if (dto.passwordConfirmation && dto.passwordConfirmation !== dto.password) {
      throw new BadRequestException('Password confirmation does not match');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
    });
    return this.createAuthResponse(user);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.createAuthResponse(this.usersService.toPublicUser(user));
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify<JwtUserPayload>(refreshToken, {
        secret: JWT_REFRESH_SECRET,
      });
      const user = await this.usersService.findById(payload.sub);

      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.createAuthResponse(this.usersService.toPublicUser(user));
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async verifyAccessToken(token: string): Promise<PublicUser> {
    try {
      const payload = this.jwtService.verify<JwtUserPayload>(token);
      const user = await this.usersService.findById(payload.sub);

      if (!user) {
        throw new UnauthorizedException('Invalid token');
      }

      return this.usersService.toPublicUser(user);
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private createAuthResponse(user: PublicUser) {
    const payload: JwtUserPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
    };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      token: accessToken,
      user,
    };
  }
}

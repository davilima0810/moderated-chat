import { ConflictException, Injectable } from '@nestjs/common';
import { User as PrismaUser } from '@prisma/client';
import { PublicUser, User } from '../common/types/user.types';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: Pick<User, 'name' | 'email' | 'passwordHash'>): Promise<PublicUser> {
    const normalizedEmail = input.email.toLowerCase();

    const existingUser = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw new ConflictException('E-mail already registered');
    }

    const user = await this.prisma.user.create({
      data: {
      name: input.name,
      email: normalizedEmail,
        passwordHash: input.passwordHash,
      },
    });

    return this.toPublicUser(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  toPublicUser(user: PrismaUser): PublicUser {
    const { passwordHash: _passwordHash, createdAt: _createdAt, ...publicUser } = user;
    return publicUser;
  }
}

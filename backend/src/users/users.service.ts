import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from '@users/dto/create-user.dto';
import { UpdateUserDto } from '@users/dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { PrismaService } from '@prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { PostStatus } from '@prisma/client';


@Injectable()
export class UsersService {

  constructor(private prisma: PrismaService) { }

  private buildProfileSelect(includeCredentials = false) {
    return {
      id: true,
      name: true,
      username: true,
      avatarUrl: true,
      createdAt: true,
      credentials: includeCredentials
        ? {
            select: {
              email: true,
            },
          }
        : false,
      _count: {
        select: {
          followers: { where: { active: true } },
          following: { where: { active: true } },
          posts: { where: { status: PostStatus.PUBLISHED } },
          comments: { where: { active: true } },
        },
      },
      posts: {
        where: { status: PostStatus.PUBLISHED },
        orderBy: { createdAt: 'desc' as const },
        take: 20,
        select: {
          id: true,
          title: true,
          content: true,
          createdAt: true,
          _count: {
            select: {
              likes: { where: { active: true } },
              comments: { where: { active: true } },
            },
          },
          tags: {
            select: {
              tag: {
                select: { name: true },
              },
            },
          },
        },
      },
    };
  }

  async findByUserName(username: string) {
    const normalized = username.trim().toLowerCase();
    return this.prisma.user.findUnique({
      where: { username: normalized, active: true },
    });
  }


  async getMe(userId: string) {
    const me = await this.prisma.user.findUnique({
      where: { id: userId, active: true },
      select: this.buildProfileSelect(true),
    });

    if (!me) {
      throw new NotFoundException('User not found');
    }

    return me;
  }

  async getProfileByUsername(username: string) {
    const normalized = username.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { username: normalized, active: true },
      select: this.buildProfileSelect(false),
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const credential = await this.prisma.credential.findUnique({
      where: {
        email: normalizedEmail
      }
    });
    return credential;
  }
  async findCredentialById(id: string) {
    const credential = await this.prisma.credential.findUnique({
      where: {
        id
      }
    });
    return credential;
  }

  async createUser(createUserDto: CreateUserDto) {
    const { email, password, username } = createUserDto;
    const normalizedUsername = username.trim().toLowerCase();
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.prisma.user.create({
      data: {
        name: username,
        username: normalizedUsername,
        credentials: {
          create: {
            email: normalizedEmail,
            passwordHash: await bcrypt.hash(password, 10)
          }
        }
      }
    });
    return user;
  }

  async getAllUsers() {
    return this.prisma.user.findMany({
      where: {
        active: true
      }
    });
  }

  async findOneUserById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId, active: true },
    });
  }

  async updateUserById(userId: string, updateUserDto: UpdateUserDto) {
    const { name, avatar, username } = updateUserDto;
    const existUserToBeUpdated = await this.prisma.user.findUnique({
      where: { id: userId, active: true },
    });
    if (!existUserToBeUpdated) {
      throw new Error('User not found');
    }

    const existUserWithSameUsername = await this.prisma.user.findUnique({
      where: { username },
    });

    if(existUserWithSameUsername && existUserWithSameUsername.id !== userId) {
      throw new Error('Username already taken');
    }

    return this.prisma.user.update({
      where: { id: userId, active: true },
      data: {
        name,
        avatarUrl: avatar ? null : existUserToBeUpdated.avatarUrl,
        username: existUserToBeUpdated.username,
      } 
    })
  }

  async updateMyUsername(userId: string, username: string | undefined) {
    if(!username) {
      throw new Error('Username is required');
    }

    const normalizedUsername = username.trim().toLowerCase();

    const existed = await this.prisma.user.findUnique({
      where: { username: normalizedUsername },
      select: { id: true },
    });

    if (existed && existed.id !== userId) {
      throw new ConflictException('Username already exists');
    }

    return this.prisma.user.update({
      where: { id: userId, active: true },
      data: { username: normalizedUsername },
      select: { id: true, username: true, name: true, avatarUrl: true },
    });
  }

  async updateMyPassword(userId: string, dto: ChangePasswordDto) {
    const { currentPassword, newPassword, confirmPassword } = dto;

    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const credential = await this.prisma.credential.findFirst({
      where: { userId },
    });

    if (!credential) {
      throw new NotFoundException('Credential not found');
    }

    if (currentPassword) {
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, credential.passwordHash);
      if (!isCurrentPasswordValid) {
        throw new UnauthorizedException('Current password is incorrect');
      }
    } else {
      const hasGoogleAccount = await this.prisma.account.findFirst({
        where: { userId, provider: 'google' },
        select: { id: true },
      });

      if (!hasGoogleAccount) {
        throw new BadRequestException('Current password is required');
      }
    }

    await this.prisma.credential.update({
      where: { id: credential.id },
      data: { passwordHash: await bcrypt.hash(newPassword, 10) },
    });

    return { success: true };
  }

  async removeUserById(userId: string, userPerformingActionId: string) {
    if (userId !== userPerformingActionId) {
      throw new Error('You can only deactivate your own account');
    }
    return this.prisma.user.update({
      where: { id: userId, active: true },
      data: { active: false },
    });
  }
}

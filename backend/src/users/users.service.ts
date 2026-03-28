import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '@users/dto/create-user.dto';
import { UpdateUserDto } from '@users/dto/update-user.dto';
import { PrismaService } from '@prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { PostStatus } from '@prisma/client';
@Injectable()
export class UsersService {

  constructor(private prisma: PrismaService) { }

  async getMe(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId, active: true },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        credentials: {
          select: {
            email: true,
            username: true
          }
        },
        _count: {
          select: {
            followers: { where: { active: true } },
            following: { where: { active: true } },
            posts: { where: { status: PostStatus.PUBLISHED } },
            comments: { where: { active: true } }
          }
        },
        followers: {
          where: {
            active: true
          },
          select: {
            id: true,
          }
        },
        following: {
          where: {
            active: true
          },
          select: {
            id: true,
          }
        },
        comments: { where: { active: true } },
        posts: { where: { status: PostStatus.PUBLISHED } }
      }
    });
  }

  async findByEmail(email: string) {
    const credential = await this.prisma.credential.findUnique({
      where: {
        email
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
  async findByUsername(username: string) {
    const credential = await this.prisma.credential.findUnique({
      where: {
        username,
      }
    });
    return credential;
  }
  async createUser(createUserDto: CreateUserDto) {
    const { email, password, username } = createUserDto;
    const user = await this.prisma.user.create({
      data: {
        name: username,
        credentials: {
          create: {
            email,
            username,
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
    const { name, email } = updateUserDto;

    return this.prisma.user.update({
      where: { id: userId, active: true },
      data: {
        name: name,
        credentials: email ? {
          updateMany: {
            where: { userId },
            data: { email }
          }
        } : undefined
      },
    });
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

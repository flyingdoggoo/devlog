import { Injectable, UseGuards } from '@nestjs/common';
import { CreateUserDto } from '@users/dto/create-user.dto';
import { UpdateUserDto } from '@users/dto/update-user.dto';
import { PrismaService } from '@prisma/prisma.service';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UsersService {

  constructor(private prisma: PrismaService) { }

  async getMe(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId, active: true },
      select: {
        id: true,
        name: true,
        credentials: {
          select: {
            email: true,
            username: true
          }
        },
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true,
            comments: true
          }
        },
        followers: {
          select: {
            id: true,
          }
        },
        following: {
          select: {
            id: true,
          }
        },
        comments: true,
        posts: true
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

  async removeUserById(userId: string) {
    return this.prisma.user.update({
      where: { id: userId, active: true },
      data: { active: false },
    });
  }
}

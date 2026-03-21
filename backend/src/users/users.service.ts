import { Injectable, UseGuards } from '@nestjs/common';
import { CreateUserDto } from '@users/dto/create-user.dto';
import { UpdateUserDto } from '@users/dto/update-user.dto';
import { PrismaService } from '@prisma/prisma.service';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UsersService {

  constructor(private prisma: PrismaService) { }

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
        username
      }
    });
    return credential;
  }
  async create(createUserDto: CreateUserDto) {
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
    return this.prisma.user.findMany();
  }

  async findAll() {
    return this.prisma.user.findMany();
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}

import { Injectable } from '@nestjs/common';
import { CreateFollowDto } from './dto/create-follow.dto';
import { UpdateFollowDto } from './dto/update-follow.dto';
import { PrismaService } from '@prisma/prisma.service';
import { NotFoundException, HttpException, HttpStatus, ConflictException } from '@nestjs/common';
@Injectable()
export class FollowsService {
  constructor(private prisma: PrismaService) { }
  async follow(createFollowDto: CreateFollowDto, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, active: true }
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const targetUser = await this.prisma.user.findUnique({
      where: { id: createFollowDto.toUserId, active: true }
    });
    if (!targetUser) {
      throw new NotFoundException('Target user not found');
    }
    if (userId === createFollowDto.toUserId) {
      throw new ConflictException('Cannot follow yourself');
    }
    const existingFollow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: createFollowDto.toUserId
        }
      }
    });
    if (existingFollow?.active) {
      throw new ConflictException('Already following');
    }
    return this.prisma.follow.upsert({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: createFollowDto.toUserId
        }
      },
      update: {
        active: true
      },
      create: {
        followerId: userId,
        followingId: createFollowDto.toUserId,
        active: true
      }
    });  }

  async unfollow(followingId: string, userId: string) {
    if (userId === followingId) {
      throw new ConflictException('Cannot unfollow yourself');
    }
    const isFollow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: followingId
        },
        active: true
      }
    });
    if (!isFollow) {
      throw new NotFoundException('Not following');
    }
    return this.prisma.follow.update({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: followingId
        }
      },
      data: {
        active: false
      }
    });
  }

  async getAllFollowers(userId: string) {
    return this.prisma.follow.findMany({
      where: {
        followingId: userId,
        active: true
      },
      include: {
        follower: {
          select: {
            id: true,
            name: true
          },
        },
      }
    });
  }

  async getFollowings(userId: string) {
    return this.prisma.follow.findMany({
      where: {
        followerId: userId,
        active: true
      },
      include: {
        following: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
  }
}

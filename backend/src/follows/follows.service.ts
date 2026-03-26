import { Injectable } from '@nestjs/common';
import { CreateFollowDto } from './dto/create-follow.dto';
import { UpdateFollowDto } from './dto/update-follow.dto';
import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class FollowsService {
  constructor(private prisma: PrismaService) { }
  async follow(createFollowDto: CreateFollowDto, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, active: true }
    });
    if (!user) {
      throw new Error('User not found');
    }
    if (userId === createFollowDto.toUserId) {
      throw new Error('Cannot follow yourself');
    }
    const isFollow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: createFollowDto.toUserId
        },
        active: true
      }
    });
    if (isFollow) {
      throw new Error('Already following');
    }
    return this.prisma.follow.create({
      data: {
        followerId: userId,
        followingId: createFollowDto.toUserId
      }
    });
  }

  async unfollow(dto: CreateFollowDto, userId: string) {
    if (userId === dto.toUserId) {
      throw new Error('Cannot unfollow yourself');
    }
    const isFollow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: dto.toUserId
        },
        active: true
      }
    });
    if (!isFollow) {
      throw new Error('Not following');
    }
    return this.prisma.follow.update({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: dto.toUserId
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

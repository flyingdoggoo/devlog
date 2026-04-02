import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SLUG_PREFIX = 'seed-post-';
const EMAIL_DOMAIN = 'seed.devlog.local';

async function main() {
  // 1) Remove posts first (cascades postTags, likes, comments by postId)
  const deletedPosts = await prisma.post.deleteMany({
    where: {
      slug: {
        startsWith: SLUG_PREFIX,
      },
    },
  });

  // 2) Find seed users via credentials domain
  const seedCredentials = await prisma.credential.findMany({
    where: {
      email: { endsWith: `@${EMAIL_DOMAIN}` },
    },
    select: { userId: true },
  });
  const seedUserIds = [...new Set(seedCredentials.map((c) => c.userId))];

  if (seedUserIds.length > 0) {
    await prisma.like.deleteMany({
      where: { userId: { in: seedUserIds } },
    });

    await prisma.follow.deleteMany({
      where: {
        OR: [{ followerId: { in: seedUserIds } }, { followingId: { in: seedUserIds } }],
      },
    });

    await prisma.notification.deleteMany({
      where: {
        OR: [{ userId: { in: seedUserIds } }, { actorId: { in: seedUserIds } }],
      },
    });

    await prisma.account.deleteMany({
      where: { userId: { in: seedUserIds } },
    });

    await prisma.session.deleteMany({
      where: { userId: { in: seedUserIds } },
    });

    await prisma.credential.deleteMany({
      where: { userId: { in: seedUserIds } },
    });

    await prisma.user.deleteMany({
      where: { id: { in: seedUserIds } },
    });
  }

  console.log('Cleanup complete');
  console.log(`- Deleted posts: ${deletedPosts.count}`);
  console.log(`- Deleted users: ${seedUserIds.length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

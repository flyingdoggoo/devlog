import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TAG_NAMES = [
  'typescript',
  'nestjs',
  'react',
  'redux',
  'prisma',
  'postgresql',
  'architecture',
  'refactoring',
  'testing',
  'performance',
  'uiux',
  'devlog',
];

async function main() {
  const deletedPosts = await prisma.post.deleteMany({
    where: {
      slug: {
        startsWith: 'seed-post-',
      },
    },
  });

  // Only remove seed tags when they are not linked to any post.
  const deletedTags = await prisma.tag.deleteMany({
    where: {
      name: { in: TAG_NAMES },
      posts: { none: {} },
    },
  });

  const seedUsers = await prisma.user.findMany({
    where: {
      credentials: {
        some: {
          email: { startsWith: 'seed-author-' },
        },
      },
      posts: { none: {} },
      comments: { none: {} },
      likes: { none: {} },
      followers: { none: {} },
      following: { none: {} },
      sessions: { none: {} },
      accounts: { none: {} },
    },
    select: { id: true },
  });

  if (seedUsers.length > 0) {
    const seedUserIds = seedUsers.map((u) => u.id);

    await prisma.credential.deleteMany({
      where: {
        userId: { in: seedUserIds },
        email: { startsWith: 'seed-author-' },
      },
    });

    await prisma.user.deleteMany({
      where: { id: { in: seedUserIds } },
    });
  }

  console.log(`Deleted posts: ${deletedPosts.count}`);
  console.log(`Deleted tags: ${deletedTags.count}`);
  console.log(`Deleted seed users: ${seedUsers.length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

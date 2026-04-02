import { PrismaClient, PostStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const DEFAULT_POST_COUNT = 120;
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

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandomTagIds(tagIds: string[]) {
  const count = randomInt(1, Math.min(3, tagIds.length));
  const pool = [...tagIds];
  const picked: string[] = [];

  for (let i = 0; i < count; i++) {
    const idx = randomInt(0, pool.length - 1);
    const [id] = pool.splice(idx, 1);
    picked.push(id);
  }

  return picked;
}

async function ensureSeedAuthor() {
  const existingUser = await prisma.user.findFirst({
    where: { active: true },
    select: { id: true },
  });

  if (existingUser) return existingUser.id;

  const email = `seed-author-${Date.now()}@devlog.local`;
  const username = `seed_author_${Date.now()}`;
  const passwordHash = await bcrypt.hash('SeedPassword@123', 10);

  const createdUser = await prisma.user.create({
    data: {
      username,
      name: 'Seed Author',
      active: true,
      credentials: {
        create: {
          email,
          passwordHash,
        },
      },
    },
    select: { id: true },
  });

  return createdUser.id;
}

async function seedTags() {
  const tags: Array<{ id: string; name: string }> = [];
  for (const name of TAG_NAMES) {
    const tag = await prisma.tag.upsert({
      where: { name },
      update: {},
      create: { name },
      select: { id: true, name: true },
    });
    tags.push(tag);
  }
  return tags;
}

async function seedPosts(authorId: string, tagIds: string[], count: number) {
  for (let i = 0; i < count; i++) {
    const seq = i + 1;
    const seed = Date.now() + i;
    const title = `Seed Post #${seq}`;
    const content = `This is seed content for post #${seq}. `.repeat(randomInt(18, 36));
    const excerpt = `Seed excerpt for post #${seq}`;
    const pickedTagIds = pickRandomTagIds(tagIds);

    await prisma.post.create({
      data: {
        authorId,
        title,
        slug: `seed-post-${seq}-${seed}`,
        content,
        excerpt,
        status: PostStatus.PUBLISHED,
        tags: {
          create: pickedTagIds.map((tagId) => ({
            tag: { connect: { id: tagId } },
          })),
        },
      },
    });
  }
}

async function main() {
  const arg = process.argv[2];
  const postCount = arg ? Number(arg) : DEFAULT_POST_COUNT;

  if (!Number.isInteger(postCount) || postCount <= 0) {
    throw new Error('Post count must be a positive integer');
  }

  const authorId = await ensureSeedAuthor();
  const tags = await seedTags();
  await seedPosts(
    authorId,
    tags.map((t) => t.id),
    postCount,
  );

  console.log(`Seeded ${tags.length} tags and ${postCount} posts`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

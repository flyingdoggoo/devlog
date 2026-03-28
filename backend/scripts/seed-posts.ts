import { PrismaClient, PostStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const author = await prisma.user.findFirst({ where: { active: true } });
  if (!author) throw new Error('No active user found');

  const rows = Array.from({ length: 120 }).map((_, i) => ({
    authorId: author.id,
    title: `Seed Post #${i + 1}`,
    slug: `seed-post-${i + 1}-${Date.now()}`,
    content: `This is seed content for post #${i + 1}. `.repeat(20),
    excerpt: `Excerpt for seed post #${i + 1}`,
    status: PostStatus.PUBLISHED,
  }));

  await prisma.post.createMany({ data: rows });
  console.log(`Inserted ${rows.length} posts`);
}

main()
  .finally(async () => prisma.$disconnect());

//Muốn xóa seed để test lại:
// DELETE FROM "Post" WHERE slug LIKE 'seed-post-%';
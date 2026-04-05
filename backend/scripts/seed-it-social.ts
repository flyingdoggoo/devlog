import { PrismaClient, PostStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

type SeedUser = {
  id: string;
  fullName: string;
  username: string;
  email: string;
  avatarUrl: string;
  bio: string;
};

type SeedPost = {
  id: string;
  authorId: string;
  title: string;
  content: string;
  createdAt: string;
};

type SeedComment = {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
};

const ROLE_BIOS = [
  'Backend Developer focused on Node.js, Prisma, and scalable API design.',
  'AI Engineer building LLM-powered features and RAG pipelines.',
  'DevOps Engineer working with Docker, Kubernetes, and observability.',
  'ML Engineer tuning embeddings, vector search, and evaluation flows.',
  'Frontend Developer shipping React apps with performance-first mindset.',
  'Fullstack Engineer who enjoys clean architecture and product thinking.',
  'SRE tracking reliability, latency budgets, and incident response.',
  'CS Student learning system design, distributed systems, and MLOps.',
  'Cloud Engineer building infra on AWS and automating CI/CD pipelines.',
  'Data Engineer handling ETL, warehouses, and streaming workloads.',
];

const VN_LAST_NAMES = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Phan', 'Võ', 'Đặng', 'Bùi', 'Đỗ'];
const VN_MIDDLE_NAMES = ['Thanh', 'Minh', 'Quỳnh', 'Đức', 'Gia', 'Ngọc', 'Việt', 'Tuấn', 'Hải', 'Khánh'];
const VN_FIRST_NAMES = ['Hiếu', 'Khang', 'Anh', 'Long', 'Hân', 'Đạt', 'Linh', 'Dũng', 'Phúc', 'Thảo', 'My', 'Nam'];

const GLOBAL_FIRST_NAMES = [
  'Chloe', 'Ethan', 'Sofia', 'Daniel', 'Aisha', 'Lucas', 'Yuki', 'Arjun', 'Maria', 'Kenji',
  'Olivia', 'Noah', 'Emma', 'Liam', 'Nora', 'Mateo', 'Elena', 'Leo', 'Hana', 'Ryan',
];
const GLOBAL_LAST_NAMES = [
  'Martin', 'Walker', 'Ramirez', 'Kim', 'Khan', 'Schneider', 'Tanaka', 'Patel', 'Petrova', 'Sato',
  'Chen', 'Johnson', 'Brown', 'Wilson', 'Garcia', 'Miller', 'Rossi', 'Kowalski', 'Anderson', 'Ng',
];

const USERNAME_SUFFIX = ['.dev', '_ai', '.ops', '_ml', '.cloud', '.io', '_backend', '.sre', '_fe', '.data'];
const EMAIL_DOMAINS = ['gmail.com', 'outlook.com', 'proton.me'];

const POST_TOPICS = [
  'Prisma migration fail on production with shadow DB, anyone fixed this?',
  'Cache-aside with Redis for timeline API: huge win but invalidation is pain',
  'System design interview question: news feed with 10M users',
  'Deploy NestJS + Postgres + Redis on Render, lessons learned',
  'React Query cache invalidation strategy for social app',
  'Kubernetes HPA based on CPU vs custom queue length metrics',
  'RAG pipeline for internal docs: pgvector or dedicated vector DB?',
  'How we reduced p95 API latency from 320ms to 110ms',
  'Opinion: AI will not replace devs, but replace repetitive workflow',
  'Debugging OAuth redirect and cookie race condition after login',
  'Should we split comments service into microservice yet?',
  'Docker multi-stage build made image smaller by 60%',
  'Full-text search with Postgres FTS + pg_trgm in real product',
  'Monolith first, microservices later: agree or disagree?',
  'Feature flag rollout strategy without breaking user experience',
  'Building a robust webhook handler with idempotency keys',
  'Incident report: connection pool exhaustion at 2AM',
  'Frontend performance: virtualized list vs pagination for feed',
  'MLOps note: model drift monitoring in production',
  'Prompt engineering pitfalls when building internal support bot',
];

const POST_INTRO = [
  'Mình vừa gặp case này ở production, share lại để anh em đỡ mất thời gian.',
  'Quick note from this week sprint, tụi mình vừa triển khai và rút ra vài điểm.',
  'Team mình debate topic này khá nhiều, đây là góc nhìn sau khi thử thật.',
  'Posting this để xin thêm ý kiến, vì current approach chưa thật sự yên tâm.',
  'Sau vài lần fail và rollback, mình tổng hợp lại cách đang chạy ổn.',
];

const POST_BODY = [
  'Current stack: NestJS + Prisma + Postgres + Redis, deploy bằng Docker trên cloud.',
  'Bottleneck chính xuất hiện khi traffic tăng đột biến sau release, đặc biệt ở read-heavy endpoint.',
  'Mình thêm tracing và log tookMs theo endpoint để nhìn rõ pattern thay vì đoán cảm tính.',
  'Phần khó nhất không phải code, mà là thống nhất trade-off giữa tốc độ và độ ổn định.',
  'Khi thêm cache thì throughput tốt hơn, nhưng consistency trở thành bài toán phải giải kỹ.',
  'Mình ưu tiên approach incremental: ship nhỏ, đo metrics, rồi mới mở rộng.',
];

const POST_QUESTION = [
  'Anh em có pattern nào clean hơn cho case này không?',
  'Có ai đã benchmark kiểu tương tự trên workload lớn chưa?',
  'Nếu làm lại từ đầu, mọi người sẽ đổi kiến trúc chỗ nào?',
  'Mình nên ưu tiên scale dọc hay tách service trước?',
  'Mọi người có recommendation về tooling để debug nhanh hơn không?',
];

const COMMENT_POOL = [
  'Case này mình gặp rồi, thường mình thêm retry + idempotency để tránh race condition.',
  'Chuẩn, nhưng nhớ đo lại p95 sau khi bật cache, nhiều khi miss pattern làm lệch kết quả.',
  'Nếu dùng Redis, mình hay set short TTL + explicit invalidation cho write path.',
  'Bạn thử thêm observability bằng OpenTelemetry, trace flow sẽ rõ hơn nhiều.',
  'Mình hơi disagree chỗ tách microservice sớm, team nhỏ thì monolith vẫn hiệu quả.',
  'Về OAuth thì check SameSite=None + Secure trước, cross-domain rất dễ fail.',
  'Prisma query này nên include có chọn lọc, không là N+1 rất đau.',
  'Kubernetes autoscale theo custom metric sẽ sát thực tế hơn CPU-only.',
  'RAG multilingual thì nhớ đánh giá embedding theo tiếng Việt riêng, đừng chỉ nhìn English benchmark.',
  'Bạn có thử cursor pagination chưa? feed data thường ổn định hơn offset.',
  'Mình từng bị incident tương tự, root cause là pool size + long transaction.',
  'Ý hay đó, nhưng thêm circuit breaker ở external dependency sẽ an toàn hơn.',
  'Hot take hợp lý, AI giúp tăng tốc chứ chưa thay thế được tư duy system.',
  'Mình áp dụng pattern này 3 tháng rồi, release ổn định hơn hẳn.',
  'Cho mình hỏi thêm: bạn invalidate cache theo user key hay theo entity key?',
  'Nếu endpoint read-heavy, cân nhắc materialized view cho report cũng khá ổn.',
  'Phần webhook mình luôn lưu eventId để dedupe, đỡ duplicate side-effect.',
  'Đồng ý, trước khi scale service nên optimize query plan và index đã.',
  'Bạn có thể share dashboard metrics không, nhìn SLO sẽ dễ góp ý hơn.',
  'Mình thấy cách bạn viết khá practical, không over-engineering.',
];

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickOne<T>(arr: T[]) {
  return arr[randomInt(0, arr.length - 1)];
}

function toAsciiSlug(input: string) {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function randomRecentDate(maxDaysAgo = 40) {
  const now = Date.now();
  const offsetMinutes = randomInt(5, maxDaysAgo * 24 * 60);
  return new Date(now - offsetMinutes * 60_000);
}

function parseUsersCount() {
  const raw = process.argv.find((arg) => arg.startsWith('--users='))?.split('=')[1];
  const parsed = raw ? Number(raw) : 30;
  if (!Number.isFinite(parsed)) return 30;
  return Math.min(50, Math.max(20, Math.floor(parsed)));
}

function buildFullName(index: number) {
  if (index % 2 === 0) {
    return `${pickOne(VN_LAST_NAMES)} ${pickOne(VN_MIDDLE_NAMES)} ${pickOne(VN_FIRST_NAMES)}`;
  }
  return `${pickOne(GLOBAL_FIRST_NAMES)} ${pickOne(GLOBAL_LAST_NAMES)}`;
}

function buildUsername(fullName: string, used: Set<string>, index: number) {
  const base = toAsciiSlug(fullName).replace(/-/g, '');
  const candidateBase = `${base}${pickOne(USERNAME_SUFFIX)}`;
  let username = candidateBase;
  let cursor = 1;

  while (used.has(username)) {
    username = `${candidateBase}${index}${cursor}`;
    cursor += 1;
  }
  used.add(username);
  return username;
}

function buildEmail(username: string, used: Set<string>) {
  const compact = username.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  let email = `${compact}@${pickOne(EMAIL_DOMAINS)}`;
  let cursor = 1;

  while (used.has(email)) {
    email = `${compact}${cursor}@${pickOne(EMAIL_DOMAINS)}`;
    cursor += 1;
  }
  used.add(email);
  return email;
}

function buildPostContent(title: string) {
  return [
    pickOne(POST_INTRO),
    `${pickOne(POST_BODY)} ${pickOne(POST_BODY)}`,
    `Context: ${title}`,
    pickOne(POST_QUESTION),
  ].join('\n\n');
}

async function main() {
  const usersCount = parseUsersCount();
  const passwordHash = await bcrypt.hash('SeedPassword@123', 10);

  const usernameSet = new Set<string>();
  const emailSet = new Set<string>();

  const usersOutput: SeedUser[] = [];
  const postsOutput: SeedPost[] = [];
  const commentsOutput: SeedComment[] = [];

  const createdUsers: Array<{ id: string; username: string }> = [];

  // Users
  for (let i = 0; i < usersCount; i += 1) {
    const fullName = buildFullName(i);
    const username = buildUsername(fullName, usernameSet, i + 1);
    const email = buildEmail(username, emailSet);
    const avatarUrl = `https://i.pravatar.cc/240?u=${encodeURIComponent(username)}`;
    const bio = pickOne(ROLE_BIOS);
    const id = randomUUID();

    await prisma.user.create({
      data: {
        id,
        username,
        name: fullName,
        avatarUrl,
        active: true,
        createdAt: randomRecentDate(180),
        credentials: {
          create: {
            email,
            passwordHash,
          },
        },
      },
    });

    usersOutput.push({ id, fullName, username, email, avatarUrl, bio });
    createdUsers.push({ id, username });
  }

  // Prepare tags
  const tagNames = [
    'backend', 'frontend', 'ai', 'ml', 'devops', 'cloud', 'system-design',
    'nestjs', 'react', 'prisma', 'postgres', 'redis', 'kubernetes', 'docker', 'llm',
  ];

  const tags: Array<{ id: string; name: string }> = [];
  for (const name of tagNames) {
    const tag = await prisma.tag.upsert({
      where: { name },
      create: { name },
      update: {},
      select: { id: true, name: true },
    });
    tags.push(tag);
  }

  // Posts + comments
  for (const user of createdUsers) {
    const postsCount = randomInt(2, 5);

    for (let p = 0; p < postsCount; p += 1) {
      const id = randomUUID();
      const title = pickOne(POST_TOPICS);
      const content = buildPostContent(title);
      const createdAt = randomRecentDate(35);
      const slug = `${toAsciiSlug(title)}-${id.slice(0, 8)}`;

      const selectedTags = Array.from({ length: randomInt(1, 3) }).map(() => pickOne(tags));
      const uniqueTagIds = [...new Set(selectedTags.map((t) => t.id))];

      await prisma.post.create({
        data: {
          id,
          authorId: user.id,
          title,
          slug,
          content,
          excerpt: content.slice(0, 180),
          status: PostStatus.PUBLISHED,
          publishedAt: createdAt,
          createdAt,
          tags: {
            create: uniqueTagIds.map((tagId) => ({
              tag: { connect: { id: tagId } },
            })),
          },
        },
      });

      postsOutput.push({
        id,
        authorId: user.id,
        title,
        content,
        createdAt: createdAt.toISOString(),
      });

      const commentsCount = randomInt(2, 10);
      const commentersPool = createdUsers.filter((u) => u.id !== user.id);

      for (let c = 0; c < commentsCount; c += 1) {
        const commenter = pickOne(commentersPool);
        const commentId = randomUUID();
        const afterMinutes = randomInt(15, 72 * 60);
        const commentTime = new Date(Math.min(createdAt.getTime() + afterMinutes * 60_000, Date.now() - 60_000));
        const commentContent = pickOne(COMMENT_POOL);

        await prisma.comment.create({
          data: {
            id: commentId,
            postId: id,
            authorId: commenter.id,
            content: commentContent,
            createdAt: commentTime,
            active: true,
          },
        });

        commentsOutput.push({
          id: commentId,
          postId: id,
          authorId: commenter.id,
          content: commentContent,
          createdAt: commentTime.toISOString(),
        });
      }
    }
  }

  const output = {
    users: usersOutput,
    posts: postsOutput,
    comments: commentsOutput,
  };

  const outputDir = join(process.cwd(), 'scripts', 'output');
  mkdirSync(outputDir, { recursive: true });
  writeFileSync(join(outputDir, 'seed-it-social.json'), JSON.stringify(output, null, 2), 'utf8');

  console.log(`Seeded ${usersOutput.length} users, ${postsOutput.length} posts, ${commentsOutput.length} comments.`);
  console.log(`Snapshot JSON written to scripts/output/seed-it-social.json`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

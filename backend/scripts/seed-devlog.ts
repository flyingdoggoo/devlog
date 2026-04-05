import { PrismaClient, PostStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

const WORDS_PER_MINUTE = 220;
const DEFAULT_USER_COUNT = 72;
const DEFAULT_POST_COUNT = 84;
const DEFAULT_PASSWORD = 'Devlog@123';

type SeedOptions = {
  users: number;
  posts: number;
  password: string;
  reset: boolean;
};

type UserProfileSeed = {
  name: string;
  username: string;
  bio: string;
  avatarImage: number;
};

type SeedUser = {
  id: string;
  username: string;
  name: string;
  bio: string;
  email: string;
  avatarUrl: string;
  createdAt: Date;
};

type PostTemplate = {
  title: string;
  topic: string;
  intro: string;
  context: string;
  codeLang: 'js' | 'ts';
  code: string;
  explanation: string;
  takeaways: string[];
  tagNames: string[];
};

type SeedPost = {
  id: string;
  title: string;
  slug: string;
  authorId: string;
  createdAt: Date;
};

const TAG_POOL = [
  'backend',
  'nestjs',
  'prisma',
  'docker',
  'system-design',
  'javascript',
  'java',
  'nodejs',
  'microservices',
  'devops',
  'database',
  'postgresql',
  'redis',
  'kafka',
  'observability',
  'testing',
  'api-design',
  'performance',
  'security',
];

const DEV_BIOS = [
  'Backend engineer building high-throughput APIs with NestJS, Prisma, and PostgreSQL.',
  'Java and Node.js developer focused on clean architecture and production reliability.',
  'DevOps-minded software engineer working on Docker, CI/CD, and observability.',
  'Full-stack developer with a strong backend mindset and database-first design.',
  'Tối ưu API và database cho hệ thống nhiều traffic, ưu tiên rõ ràng và dễ bảo trì.',
  'System design enthusiast, especially around caching, message queues, and scaling patterns.',
  'Pragmatic engineer who prefers measurable performance wins over premature complexity.',
  'Engineer who documents decisions, writes tests, and keeps delivery predictable.',
];

const BASE_USER_PROFILES: UserProfileSeed[] = [
  {
    name: 'Nguyễn Minh Anh',
    username: 'nguyenminhanh',
    bio: 'Backend developer chuyên NestJS và PostgreSQL, thích tối ưu truy vấn và DX cho team.',
    avatarImage: 1,
  },
  {
    name: 'Trần Quốc Bảo',
    username: 'tranquocbao',
    bio: 'Node.js engineer tập trung vào kiến trúc event-driven và thiết kế API rõ ràng.',
    avatarImage: 2,
  },
  {
    name: 'Lê Thu Hà',
    username: 'lethuha',
    bio: 'Prisma user lâu năm, ưu tiên migration an toàn và data model dễ evolve.',
    avatarImage: 3,
  },
  {
    name: 'Phạm Hoàng Long',
    username: 'phamhoanglong',
    bio: 'Làm backend cho sản phẩm SaaS, quan tâm nhiều đến latency và khả năng mở rộng.',
    avatarImage: 4,
  },
  {
    name: 'Vũ Khánh Linh',
    username: 'vukhanhlinh',
    bio: 'DevOps engineer thích Docker, GitHub Actions và quan sát hệ thống bằng metrics.',
    avatarImage: 5,
  },
  {
    name: 'Đặng Gia Huy',
    username: 'danggiahuy',
    bio: 'Xây backend bằng NestJS + Redis, chuyên xử lý bài toán cache invalidation.',
    avatarImage: 6,
  },
  {
    name: 'Bùi Ngọc Thảo',
    username: 'buingocthao',
    bio: 'Java/NestJS developer, thích viết tài liệu kỹ thuật dễ đọc và có thể thực thi ngay.',
    avatarImage: 7,
  },
  {
    name: 'Phan Thanh Tùng',
    username: 'phanthanhtung',
    bio: 'System design learner, quan tâm domain modeling và consistency trong distributed systems.',
    avatarImage: 8,
  },
  {
    name: 'Đỗ Quỳnh Chi',
    username: 'doquynhchi',
    bio: 'Kỹ sư backend thiên về performance tuning cho PostgreSQL và API gateway.',
    avatarImage: 9,
  },
  {
    name: 'Hoàng Nhật Nam',
    username: 'hoangnhatnam',
    bio: 'Tập trung vào reliability engineering, incident response và quy trình release.',
    avatarImage: 10,
  },
  {
    name: 'Ngô Đức Anh',
    username: 'ngoducanh',
    bio: 'Backend developer làm việc với microservices, queue, và tracing end-to-end.',
    avatarImage: 11,
  },
  {
    name: 'Trịnh Mai Lan',
    username: 'trinhmailan',
    bio: 'Ưu tiên code dễ maintain, test đủ sâu và migration không downtime.',
    avatarImage: 12,
  },
  {
    name: 'Dương Tuấn Kiệt',
    username: 'duongtuankiet',
    bio: 'Node.js architect, thích tối giản tầng service và làm rõ contract giữa các module.',
    avatarImage: 13,
  },
  {
    name: 'Võ Hải Yến',
    username: 'vohaiyen',
    bio: 'Backend engineer với trải nghiệm thực tế về thiết kế data-intensive applications.',
    avatarImage: 14,
  },
  {
    name: 'Lâm Gia Bảo',
    username: 'lamgiabao',
    bio: 'Developer chuyên xây hệ thống nội bộ với yêu cầu audit và security cao.',
    avatarImage: 15,
  },
  {
    name: 'Tạ Minh Châu',
    username: 'taminhchau',
    bio: 'Hướng đến kiến trúc backend linh hoạt, dễ vận hành và ít phụ thuộc vào cá nhân.',
    avatarImage: 16,
  },
  {
    name: 'Emma Rodriguez',
    username: 'emmarodriguez',
    bio: 'Backend engineer shipping Node.js services with strict SLAs and clean telemetry.',
    avatarImage: 17,
  },
  {
    name: 'Lucas Martin',
    username: 'lucasmartin',
    bio: 'Building NestJS APIs and production-ready deployment pipelines for cloud workloads.',
    avatarImage: 18,
  },
  {
    name: 'Aisha Khan',
    username: 'aishakhan',
    bio: 'Database-focused engineer with a strong interest in query tuning and schema design.',
    avatarImage: 19,
  },
  {
    name: 'Noah Kim',
    username: 'noahkim',
    bio: 'Java + Node.js developer, working on payment flows and resilient job processing.',
    avatarImage: 20,
  },
  {
    name: 'Sofia Chen',
    username: 'sofiachen',
    bio: 'Designing APIs that are easy to consume, test, and evolve over multiple versions.',
    avatarImage: 21,
  },
  {
    name: 'Arjun Patel',
    username: 'arjunpatel',
    bio: 'Focuses on service reliability, idempotency, and failure isolation in microservices.',
    avatarImage: 22,
  },
  {
    name: 'Mia Walker',
    username: 'miawalker',
    bio: 'DevOps-driven engineer automating infrastructure and release confidence checks.',
    avatarImage: 23,
  },
  {
    name: 'Daniel Garcia',
    username: 'danielgarcia',
    bio: 'Works on distributed systems, asynchronous messaging, and capacity planning.',
    avatarImage: 24,
  },
  {
    name: 'Chloe Anderson',
    username: 'chloeanderson',
    bio: 'Backend engineer who values observability-first development and reliable rollbacks.',
    avatarImage: 25,
  },
  {
    name: 'Kenji Sato',
    username: 'kenjisato',
    bio: 'Builds high-quality APIs with pragmatic architecture and strong runtime diagnostics.',
    avatarImage: 26,
  },
  {
    name: 'Yuki Tanaka',
    username: 'yukitanaka',
    bio: 'System design practitioner focusing on throughput, consistency, and operability.',
    avatarImage: 27,
  },
  {
    name: 'Olivia Wilson',
    username: 'oliviawilson',
    bio: 'Leads backend initiatives around data integrity, testing strategy, and deployment risk.',
    avatarImage: 28,
  },
  {
    name: 'Ethan Brown',
    username: 'ethanbrown',
    bio: 'Node.js engineer optimizing APIs for lower p95 latency and stable resource usage.',
    avatarImage: 29,
  },
  {
    name: 'Hana Lopez',
    username: 'hanalopez',
    bio: 'Prisma and PostgreSQL user building reliable data workflows in product teams.',
    avatarImage: 30,
  },
  {
    name: 'Elena Novak',
    username: 'elenanovak',
    bio: 'Engineering manager with a coding habit, still reviewing migration plans and query costs.',
    avatarImage: 31,
  },
  {
    name: 'Luca Bianchi',
    username: 'lucabianchi',
    bio: 'Java backend engineer working on service boundaries, contracts, and fault-tolerance.',
    avatarImage: 32,
  },
];

const POST_TEMPLATES: PostTemplate[] = [
  {
    title: 'NestJS interceptor pattern for consistent API responses',
    topic: 'Backend + NestJS',
    intro: 'Response envelope nhất quán giúp frontend xử lý lỗi và success đơn giản hơn.',
    context: 'Team mình bị lệch format response giữa các module. Sau một thời gian, debug phía client tốn nhiều thời gian vì mỗi endpoint trả shape khác nhau.',
    codeLang: 'js',
    code: `import { Injectable } from '@nestjs/common';
import { map } from 'rxjs/operators';

@Injectable()
export class SuccessResponseInterceptor {
  intercept(context, next) {
    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
      }))
    );
  }
}`,
    explanation: 'Interceptor bọc dữ liệu trả về từ controller, giữ contract ổn định cho toàn bộ API mà không phải lặp code ở từng endpoint.',
    takeaways: [
      'Giữ response contract ổn định ngay từ đầu dự án.',
      'Giảm lỗi phía frontend khi parse dữ liệu.',
      'Dễ log và dễ theo dõi khi sự cố xảy ra.',
    ],
    tagNames: ['backend', 'nestjs', 'api-design'],
  },
  {
    title: 'Prisma query patterns for avoiding N+1 in feed APIs',
    topic: 'Prisma + Database',
    intro: 'N+1 query thường xuất hiện khi load feed có author, tags, comments count.',
    context: 'API feed từng gọi thêm query cho từng post để lấy metadata. Khi số lượng post tăng thì latency nhảy mạnh và database connection pool nhanh đầy.',
    codeLang: 'ts',
    code: `const users = await prisma.user.findMany({
  include: { posts: true }
});`,
    explanation: 'Dùng include để lấy relation theo batch, tránh loop query trong application layer.',
    takeaways: [
      'Đo query count trước và sau khi tối ưu.',
      'Ưu tiên include/select rõ ràng theo use-case.',
      'Đừng lấy dư cột không cần thiết.',
    ],
    tagNames: ['prisma', 'database', 'backend'],
  },
  {
    title: 'Designing idempotent webhook handlers with PostgreSQL locks',
    topic: 'System Design + Database',
    intro: 'Webhook retry là chuyện bình thường, nên handler cần idempotent.',
    context: 'Đối tác thanh toán có thể gửi lại cùng event nhiều lần. Nếu xử lý không idempotent sẽ dẫn đến duplicate order hoặc duplicate notification.',
    codeLang: 'js',
    code: `await prisma.$transaction(async (tx) => {
  const existed = await tx.processedEvent.findUnique({
    where: { eventId },
  });

  if (existed) return;

  await tx.order.update({
    where: { id: orderId },
    data: { status: 'PAID' },
  });

  await tx.processedEvent.create({
    data: { eventId },
  });
});`,
    explanation: 'Event được đánh dấu processed trong cùng transaction với business update để tránh race condition.',
    takeaways: [
      'Idempotency key nên có unique index.',
      'Update dữ liệu và mark processed trong cùng transaction.',
      'Log rõ duplicate event để theo dõi đối tác.',
    ],
    tagNames: ['system-design', 'database', 'postgresql'],
  },
  {
    title: 'Docker multi-stage build for production Node.js services',
    topic: 'Docker + DevOps',
    intro: 'Multi-stage build giúp image nhỏ, pull nhanh, deploy ổn định hơn.',
    context: 'Image cũ của team gần 1GB vì mang theo toàn bộ dev dependencies và source không cần thiết cho runtime.',
    codeLang: 'js',
    code: `FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev
CMD ["node", "dist/main.js"]`,
    explanation: 'Builder stage compile source, runtime stage chỉ giữ artifact cần thiết để chạy app.',
    takeaways: [
      'Giảm kích thước image sẽ giảm thời gian deploy.',
      'Tách build và runtime rõ ràng.',
      'Luôn pin version base image để tránh drift.',
    ],
    tagNames: ['docker', 'devops', 'nodejs'],
  },
  {
    title: 'Zero-downtime Prisma migration checklist for release day',
    topic: 'Prisma + DevOps',
    intro: 'Migration cần được chuẩn bị theo từng bước để không khóa bảng quá lâu.',
    context: 'Team từng gặp downtime do migration vừa add cột vừa backfill trên bảng lớn trong giờ cao điểm.',
    codeLang: 'js',
    code: `# Step 1: add nullable column
ALTER TABLE "Post" ADD COLUMN "summary" TEXT;

# Step 2: deploy app writing both columns
# Step 3: backfill in batches
# Step 4: make column required in next release`,
    explanation: 'Phân tách migration thành nhiều release giúp rủi ro thấp hơn và rollback rõ ràng.',
    takeaways: [
      'Không làm migration nặng trong một bước duy nhất.',
      'Backfill dữ liệu nên chạy theo batch.',
      'Giữ rollback plan trước khi bấm deploy.',
    ],
    tagNames: ['prisma', 'devops', 'database'],
  },
  {
    title: 'Practical system design notes for splitting a monolith safely',
    topic: 'System Design + Microservices',
    intro: 'Tách service quá sớm thường tạo thêm complexity thay vì giải quyết vấn đề.',
    context: 'Monolith của team vẫn ổn về throughput nhưng release chậm do coupling ở vài module lõi.',
    codeLang: 'js',
    code: `const candidateServices = boundedContexts
  .filter((ctx) => ctx.changeFrequency > 0.6)
  .filter((ctx) => ctx.hasClearOwnership)
  .filter((ctx) => ctx.integrationRisk < 0.5);`,
    explanation: 'Chỉ tách service khi domain boundary rõ và team có ownership đủ mạnh.',
    takeaways: [
      'Bắt đầu bằng boundary mapping, không bắt đầu bằng tooling.',
      'Tách theo business capability, không tách theo table.',
      'Đầu tư vào quan sát hệ thống ngay khi tách.',
    ],
    tagNames: ['system-design', 'microservices', 'backend'],
  },
  {
    title: 'Redis cache-aside strategy for hot read endpoints',
    topic: 'Backend + Database',
    intro: 'Cache đúng chỗ giúp giảm tải DB đáng kể mà không hi sinh tính nhất quán quá nhiều.',
    context: 'Feed endpoint bị gọi lặp lại nhiều lần trong 30 giây đầu sau khi user vào app.',
    codeLang: 'js',
    code: `const cacheKey = 'feed:' + userId + ':' + page;
const cached = await redis.get(cacheKey);

if (cached) return JSON.parse(cached);

const data = await feedRepository.findFeed(userId, page);
await redis.set(cacheKey, JSON.stringify(data), 'EX', 30);
return data;`,
    explanation: 'Cache-aside dễ implement, dễ invalidate khi có post mới hoặc user refresh feed.',
    takeaways: [
      'Chọn TTL theo business freshness.',
      'Cache key cần đủ ngữ cảnh để tránh đè dữ liệu.',
      'Theo dõi hit ratio để biết cache có hiệu quả thật không.',
    ],
    tagNames: ['backend', 'database', 'redis'],
  },
  {
    title: 'Node.js stream pipeline for memory-safe CSV imports',
    topic: 'Node.js + Performance',
    intro: 'Đọc file lớn vào RAM một lần là cách nhanh nhất để tự tạo incident.',
    context: 'Batch import hàng trăm nghìn dòng từng làm service bị OOM khi dùng readFile + parse toàn bộ.',
    codeLang: 'js',
    code: `import { pipeline } from 'stream/promises';
import fs from 'fs';

await pipeline(
  fs.createReadStream('users.csv'),
  csvParser(),
  transformRows(),
  writeToDatabase()
);`,
    explanation: 'Pipeline giúp xử lý dữ liệu theo luồng, giới hạn memory footprint và có error handling rõ.',
    takeaways: [
      'Dùng stream cho dữ liệu lớn.',
      'Backpressure giúp hệ thống ổn định hơn.',
      'Đo throughput từng stage để tối ưu đúng chỗ.',
    ],
    tagNames: ['nodejs', 'performance', 'backend'],
  },
  {
    title: 'Java thread model choices for I/O heavy backend workloads',
    topic: 'Java + Backend',
    intro: 'Không phải workload nào cũng cần tuning giống nhau.',
    context: 'Service Java xử lý nhiều network I/O có dấu hiệu nghẽn thread khi traffic tăng theo đợt.',
    codeLang: 'js',
    code: `ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor();
for (Task task : tasks) {
  executor.submit(() -> service.handle(task));
}`,
    explanation: 'Virtual threads giúp mô hình hóa tác vụ I/O tốt hơn trong nhiều use-case backend hiện đại.',
    takeaways: [
      'Benchmark trước khi migrate toàn bộ.',
      'Theo dõi latency và saturation cùng lúc.',
      'Áp dụng dần theo từng endpoint quan trọng.',
    ],
    tagNames: ['java', 'backend', 'performance'],
  },
  {
    title: 'PostgreSQL indexing strategy for high-traffic activity feeds',
    topic: 'Database + Performance',
    intro: 'Index đúng sẽ giảm query time mạnh hơn nhiều so với tối ưu code application.',
    context: 'Query feed sort theo createdAt và filter theo authorId bị slow khi bảng vượt vài triệu rows.',
    codeLang: 'js',
    code: `CREATE INDEX CONCURRENTLY idx_post_author_created_at
ON "Post"("authorId", "createdAt" DESC)
WHERE "status" = 'PUBLISHED';`,
    explanation: 'Partial index giảm kích thước index và tập trung vào truy vấn thực tế được gọi nhiều nhất.',
    takeaways: [
      'Đo query plan trước và sau mỗi thay đổi index.',
      'Tránh index trùng ý nghĩa.',
      'Tạo index concurrently cho bảng lớn.',
    ],
    tagNames: ['database', 'postgresql', 'performance'],
  },
  {
    title: 'OpenTelemetry tracing setup for NestJS APIs',
    topic: 'NestJS + Observability',
    intro: 'Tracing giúp thấy rõ request chậm nằm ở service nào, query nào.',
    context: 'Khi p95 tăng, log text thông thường không đủ để thấy dependency nào gây chậm.',
    codeLang: 'js',
    code: `const span = tracer.startSpan('posts.list');
try {
  const posts = await postService.findAll();
  span.setAttribute('posts.count', posts.length);
  return posts;
} finally {
  span.end();
}`,
    explanation: 'Span theo từng luồng xử lý giúp truy nguyên bottleneck xuyên qua service và database.',
    takeaways: [
      'Tag span bằng business attributes hữu ích.',
      'Theo dõi trace sampling để không quá tốn chi phí.',
      'Kết hợp trace với metrics để có góc nhìn đầy đủ.',
    ],
    tagNames: ['nestjs', 'observability', 'backend'],
  },
  {
    title: 'CI/CD workflow for backend releases with safe database migrations',
    topic: 'DevOps + Database',
    intro: 'Pipeline release nên phản ánh đúng thứ tự thay đổi ở production.',
    context: 'Lỗi phổ biến là deploy app trước migration hoặc migration trước khi app đã tương thích.',
    codeLang: 'js',
    code: `name: deploy-api
steps:
  - run: npm ci
  - run: npm run test
  - run: npx prisma migrate deploy
  - run: npm run build
  - run: npm run start:prod`,
    explanation: 'Pipeline chuẩn hóa giúp giảm sai sót thao tác thủ công trong giờ release.',
    takeaways: [
      'Dùng pipeline như source of truth cho release process.',
      'Bắt buộc test và migration check trước deploy.',
      'Giữ artifact immutable giữa các môi trường.',
    ],
    tagNames: ['devops', 'database', 'prisma'],
  },
  {
    title: 'Outbox pattern implementation for reliable event publishing',
    topic: 'System Design + Microservices',
    intro: 'Outbox là cách thực dụng để tránh mất event khi publish sang message broker.',
    context: 'Service cần ghi order và publish event. Nếu tách hai thao tác riêng biệt sẽ dễ bị lệch trạng thái khi lỗi mạng.',
    codeLang: 'js',
    code: `await prisma.$transaction(async (tx) => {
  const order = await tx.order.create({ data: orderData });
  await tx.outboxEvent.create({
    data: {
      type: 'ORDER_CREATED',
      payload: JSON.stringify({ orderId: order.id }),
    },
  });
});`,
    explanation: 'Business write và outbox write nằm trong cùng transaction, worker riêng sẽ publish event sau.',
    takeaways: [
      'Không publish trực tiếp trong transaction business.',
      'Worker publish cần retry có giới hạn.',
      'Theo dõi trạng thái outbox để phát hiện backlog.',
    ],
    tagNames: ['system-design', 'microservices', 'kafka'],
  },
  {
    title: 'API versioning strategy for long-lived mobile clients',
    topic: 'API Design + Backend',
    intro: 'Client mobile update chậm nên API cần khả năng tương thích ngược rõ ràng.',
    context: 'Khi endpoint thay đổi field mà không versioning, app cũ dễ crash hoặc hiển thị sai dữ liệu.',
    codeLang: 'js',
    code: `app.setGlobalPrefix('api');
app.enableVersioning({
  type: VersioningType.URI,
  defaultVersion: '1',
});

@Controller({ path: 'posts', version: '2' })
export class PostsV2Controller {}`,
    explanation: 'Versioning theo URI minh bạch và dễ theo dõi vòng đời từng contract API.',
    takeaways: [
      'Mỗi version cần policy deprecation rõ.',
      'Document sự khác biệt giữa các version.',
      'Ưu tiên additive change trước khi tạo version mới.',
    ],
    tagNames: ['api-design', 'backend', 'nestjs'],
  },
];

const TITLE_SUFFIXES = [
  'production guide',
  'field notes',
  'team playbook',
  'scaling checklist',
  'incident-ready approach',
  'practical walkthrough',
];

const COMMENT_LINES = [
  'Phần query này bạn có benchmark ở p95/p99 chưa? Mình tò mò khi traffic tăng thì độ trễ thay đổi thế nào.',
  'Đoạn migration strategy rất hữu ích. Team mình từng gặp lock table vì chạy backfill một lần.',
  'Mình thích cách tách rõ business write và event publish. Outbox pattern đọc dễ hiểu và thực dụng.',
  'Cho mình hỏi bạn đang theo dõi metrics nào để phát hiện sớm bottleneck database?',
  'Bài viết rõ ràng, nhất là phần giải thích trade-off giữa độ phức tạp và tính ổn định.',
  'Có thể chia sẻ thêm cách bạn test failure case cho phần retry logic không?',
  'Cách dùng tracing ở đây rất sát thực tế. Nhìn span theo từng stage sẽ dễ triage hơn nhiều.',
  'Mình áp dụng tương tự cho service bên mình và giảm được khá nhiều thời gian điều tra incident.',
];

const REPLY_LINES = [
  'Mình đã test với dataset lớn hơn, kết quả tốt hơn kỳ vọng khi thêm index phù hợp.',
  'Bạn nói đúng, nếu không có idempotency key thì dễ duplicate record khi retry.',
  'Team mình cũng dùng cách này, nhưng thêm circuit breaker để giảm ảnh hưởng khi dependency chậm.',
  'Ý này hay, mình sẽ bổ sung phần benchmark script vào bài tiếp theo.',
  'Chuẩn, rollout theo nhiều bước giúp rollback an toàn hơn rất nhiều.',
];

function parseArgs(argv: string[]): SeedOptions {
  const options: SeedOptions = {
    users: DEFAULT_USER_COUNT,
    posts: DEFAULT_POST_COUNT,
    password: DEFAULT_PASSWORD,
    reset: false,
  };

  for (const arg of argv) {
    if (arg === '--reset') {
      options.reset = true;
      continue;
    }

    if (arg.startsWith('--users=')) {
      const value = Number(arg.split('=')[1]);
      if (Number.isFinite(value) && value >= 10) {
        options.users = Math.floor(value);
      }
      continue;
    }

    if (arg.startsWith('--posts=')) {
      const value = Number(arg.split('=')[1]);
      if (Number.isFinite(value) && value >= 12) {
        options.posts = Math.floor(value);
      }
      continue;
    }

    if (arg.startsWith('--password=')) {
      const value = arg.split('=')[1]?.trim();
      if (value) {
        options.password = value;
      }
    }
  }

  return options;
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickOne<T>(items: T[]): T {
  return items[randomInt(0, items.length - 1)] as T;
}

function pickDistinct<T>(items: T[], count: number): T[] {
  if (count <= 0) return [];
  if (count >= items.length) return [...items];

  const pool = [...items];
  const output: T[] = [];

  for (let index = 0; index < count; index += 1) {
    const randomIndex = randomInt(0, pool.length - 1);
    output.push(pool[randomIndex] as T);
    pool.splice(randomIndex, 1);
  }

  return output;
}

function toSlugToken(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function stripMarkdownToPlain(markdown: string) {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/^\s{0,3}(#{1,6}|>|[-*+]\s|\d+\.\s)/gm, ' ')
    .replace(/[*_~>#-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildExcerpt(markdown: string, maxLength = 190) {
  const plain = stripMarkdownToPlain(markdown);
  if (plain.length <= maxLength) return plain;
  return `${plain.slice(0, maxLength).trimEnd()}...`;
}

function estimateReadTimeMinutes(markdown: string) {
  const words = stripMarkdownToPlain(markdown)
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

function randomDateBetween(from: Date, to: Date) {
  const min = from.getTime();
  const max = to.getTime();
  return new Date(randomInt(min, max));
}

function getUserProfile(index: number): UserProfileSeed {
  if (index < BASE_USER_PROFILES.length) {
    return BASE_USER_PROFILES[index] as UserProfileSeed;
  }

  const baseName = index % 2 === 0 ? 'Nguyễn Dev' : 'Alex Engineer';
  const suffix = String.fromCharCode(65 + (index % 26));
  const name = `${baseName} ${suffix}`;
  const username = `${toSlugToken(name).replace(/-/g, '')}${index + 1}`;

  return {
    name,
    username,
    bio: DEV_BIOS[index % DEV_BIOS.length] as string,
    avatarImage: (index % 70) + 1,
  };
}

function buildPostMarkdownContent(template: PostTemplate) {
  const implementationSteps = [
    '- Bắt đầu từ metric hoặc lỗi thực tế thay vì tối ưu cảm tính.',
    '- Giữ thay đổi nhỏ, deploy được từng bước, rollback rõ ràng.',
    '- Viết code dễ đọc để người khác trong team có thể tiếp tục ngay.',
  ];

  return [
    `## ${template.topic}`,
    '',
    `**${template.intro}**`,
    '',
    '### Bối cảnh',
    template.context,
    '',
    '### Cách triển khai',
    ...implementationSteps,
    '',
    '### Ví dụ code',
    `\`\`\`${template.codeLang}`,
    template.code,
    '\`\`\`',
    '',
    `Giải thích: ${template.explanation}`,
    '',
    '### Kết luận',
    ...template.takeaways.map((line) => `- ${line}`),
  ].join('\n');
}

async function resetDatabaseForReseed() {
  if (process.env.SEED_CONFIRM_RESET !== 'YES') {
    throw new Error(
      'Reset mode is blocked. Set SEED_CONFIRM_RESET=YES to confirm full data wipe before reseeding.',
    );
  }

  await prisma.$transaction([
    prisma.notification.deleteMany(),
    prisma.bookmark.deleteMany(),
    prisma.like.deleteMany(),
    prisma.comment.deleteMany(),
    prisma.follow.deleteMany(),
    prisma.postTag.deleteMany(),
    prisma.post.deleteMany(),
    prisma.tag.deleteMany(),
    prisma.session.deleteMany(),
    prisma.account.deleteMany(),
    prisma.credential.deleteMany(),
    prisma.user.deleteMany(),
  ]);
}

async function seedUsers(userCount: number, runId: string, password: string): Promise<SeedUser[]> {
  const passwordHash = await bcrypt.hash(password, 10);
  const users: SeedUser[] = [];
  const userRows: Array<{
    id: string;
    username: string;
    name: string;
    bio: string;
    avatarUrl: string;
    active: boolean;
    createdAt: Date;
  }> = [];
  const credentialRows: Array<{
    id: string;
    userId: string;
    email: string;
    passwordHash: string;
    createdAt: Date;
  }> = [];

  const now = new Date();
  const minCreatedDate = new Date(now.getTime() - 900 * 24 * 60 * 60 * 1000);
  const maxCreatedDate = new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000);

  for (let index = 0; index < userCount; index += 1) {
    const profile = getUserProfile(index);
    const id = randomUUID();
    const username = `seed_${profile.username}_${runId}_${index + 1}`;
    const email = `${profile.username}.${runId}.${index + 1}@devlog.seed.local`;
    const avatarUrl = `https://i.pravatar.cc/300?img=${((profile.avatarImage - 1) % 70) + 1}`;
    const createdAt = randomDateBetween(minCreatedDate, maxCreatedDate);

    users.push({
      id,
      username,
      name: profile.name,
      bio: profile.bio,
      email,
      avatarUrl,
      createdAt,
    });

    userRows.push({
      id,
      username,
      name: profile.name,
      bio: profile.bio,
      avatarUrl,
      active: true,
      createdAt,
    });

    credentialRows.push({
      id: randomUUID(),
      userId: id,
      email,
      passwordHash,
      createdAt,
    });
  }

  if (userRows.length > 0) {
    await prisma.user.createMany({ data: userRows, skipDuplicates: true });
    await prisma.credential.createMany({ data: credentialRows, skipDuplicates: true });
  }

  return users;
}

async function seedTags() {
  await prisma.tag.createMany({
    data: TAG_POOL.map((name) => ({ name })),
    skipDuplicates: true,
  });

  return prisma.tag.findMany({
    where: { name: { in: TAG_POOL } },
    select: { id: true, name: true },
  });
}

function buildPostTitle(baseTitle: string, usageMap: Map<string, number>) {
  const used = usageMap.get(baseTitle) ?? 0;
  usageMap.set(baseTitle, used + 1);

  if (used === 0) {
    return baseTitle;
  }

  const suffix = TITLE_SUFFIXES[(used - 1) % TITLE_SUFFIXES.length] as string;
  const wave = String.fromCharCode(65 + Math.floor((used - 1) / TITLE_SUFFIXES.length));
  return `${baseTitle} (${suffix} ${wave})`;
}

async function seedPosts(
  users: SeedUser[],
  postsCount: number,
  runId: string,
  tags: Array<{ id: string; name: string }>,
) {
  const posts: SeedPost[] = [];
  const now = new Date();
  const minPostDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
  const titleUsage = new Map<string, number>();
  const tagMap = new Map(tags.map((tag) => [tag.name, tag.id] as const));

  for (let index = 0; index < postsCount; index += 1) {
    const author = users[randomInt(0, users.length - 1)] as SeedUser;
    const template = POST_TEMPLATES[index % POST_TEMPLATES.length] as PostTemplate;
    const title = buildPostTitle(template.title, titleUsage);
    const content = buildPostMarkdownContent(template);
    const excerpt = buildExcerpt(content);
    const createdAt = randomDateBetween(minPostDate, now);
    const slug = `seed-${runId}-${toSlugToken(title)}-${String(index + 1).padStart(3, '0')}`;

    const preferredTagIds = template.tagNames
      .map((name) => tagMap.get(name))
      .filter((id): id is string => Boolean(id));

    const fallbackTagIds = tags
      .map((tag) => tag.id)
      .filter((id) => !preferredTagIds.includes(id));

    const extraTagCount = randomInt(0, Math.max(0, Math.min(2, fallbackTagIds.length)));
    const selectedTagIds = [...preferredTagIds, ...pickDistinct(fallbackTagIds, extraTagCount)].slice(0, 5);

    const createdPost = await prisma.post.create({
      data: {
        id: randomUUID(),
        authorId: author.id,
        title,
        slug,
        content,
        excerpt,
        status: PostStatus.PUBLISHED,
        readTimeMinutes: estimateReadTimeMinutes(content),
        viewCount: randomInt(120, 25000),
        publishedAt: createdAt,
        createdAt,
        tags: {
          create: selectedTagIds.map((tagId) => ({
            tag: { connect: { id: tagId } },
          })),
        },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        authorId: true,
        createdAt: true,
      },
    });

    posts.push(createdPost);
  }

  return posts;
}

async function seedFollows(users: SeedUser[]) {
  const pairs = new Set<string>();

  for (const follower of users) {
    const candidates = users.filter((user) => user.id !== follower.id);
    const followCount = randomInt(3, Math.min(18, candidates.length));
    const followings = pickDistinct(candidates, followCount);

    for (const following of followings) {
      pairs.add(`${follower.id}:${following.id}`);
    }
  }

  const followRows = Array.from(pairs).map((pair) => {
    const [followerId, followingId] = pair.split(':');
    return {
      id: randomUUID(),
      followerId: followerId as string,
      followingId: followingId as string,
      active: true,
      createdAt: randomDateBetween(new Date(Date.now() - 160 * 24 * 60 * 60 * 1000), new Date()),
    };
  });

  if (followRows.length > 0) {
    await prisma.follow.createMany({ data: followRows, skipDuplicates: true });
  }

  return followRows.length;
}

async function seedComments(users: SeedUser[], posts: SeedPost[]) {
  const topLevelRows: Array<{
    id: string;
    postId: string;
    authorId: string;
    content: string;
    parentId: null;
    active: boolean;
    createdAt: Date;
  }> = [];

  const replyRows: Array<{
    id: string;
    postId: string;
    authorId: string;
    content: string;
    parentId: string;
    active: boolean;
    createdAt: Date;
  }> = [];

  const now = new Date();

  for (const post of posts) {
    const topCount = randomInt(2, 8);

    for (let index = 0; index < topCount; index += 1) {
      const author = users[randomInt(0, users.length - 1)] as SeedUser;
      const topCommentId = randomUUID();
      const topCreatedAt = randomDateBetween(post.createdAt, now);

      topLevelRows.push({
        id: topCommentId,
        postId: post.id,
        authorId: author.id,
        content: pickOne(COMMENT_LINES),
        parentId: null,
        active: true,
        createdAt: topCreatedAt,
      });

      const replyCount = randomInt(0, 3);
      for (let replyIndex = 0; replyIndex < replyCount; replyIndex += 1) {
        const replyAuthor = users[randomInt(0, users.length - 1)] as SeedUser;

        replyRows.push({
          id: randomUUID(),
          postId: post.id,
          authorId: replyAuthor.id,
          content: pickOne(REPLY_LINES),
          parentId: topCommentId,
          active: true,
          createdAt: randomDateBetween(topCreatedAt, now),
        });
      }
    }
  }

  if (topLevelRows.length > 0) {
    await prisma.comment.createMany({ data: topLevelRows, skipDuplicates: true });
  }

  if (replyRows.length > 0) {
    await prisma.comment.createMany({ data: replyRows, skipDuplicates: true });
  }

  return {
    topLevelCount: topLevelRows.length,
    replyCount: replyRows.length,
  };
}

async function seedLikes(users: SeedUser[], posts: SeedPost[]) {
  const likeRows: Array<{
    id: string;
    postId: string;
    userId: string;
    active: boolean;
    createdAt: Date;
  }> = [];

  const now = new Date();

  for (const post of posts) {
    const maxLikesPerPost = Math.min(500, users.length);
    const likesPerPost = randomInt(5, Math.max(5, maxLikesPerPost));
    const likers = pickDistinct(users, likesPerPost);

    for (const liker of likers) {
      likeRows.push({
        id: randomUUID(),
        postId: post.id,
        userId: liker.id,
        active: true,
        createdAt: randomDateBetween(post.createdAt, now),
      });
    }
  }

  if (likeRows.length > 0) {
    await prisma.like.createMany({ data: likeRows, skipDuplicates: true });
  }

  return likeRows.length;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const runId = Date.now().toString().slice(-8);

  console.log('Starting DevLog seed with options:', options);

  if (options.reset) {
    console.log('Reset mode enabled. Wiping existing data...');
    await resetDatabaseForReseed();
    console.log('Database wipe completed.');
  }

  const users = await seedUsers(options.users, runId, options.password);
  const tags = await seedTags();
  const posts = await seedPosts(users, options.posts, runId, tags);

  const [followCount, commentStats, likeCount] = await Promise.all([
    seedFollows(users),
    seedComments(users, posts),
    seedLikes(users, posts),
  ]);

  console.log('Seed completed successfully.');
  console.log(`- Users: ${users.length}`);
  console.log(`- Tags: ${tags.length}`);
  console.log(`- Posts: ${posts.length}`);
  console.log(`- Follows: ${followCount}`);
  console.log(
    `- Comments: ${commentStats.topLevelCount + commentStats.replyCount} (top-level: ${commentStats.topLevelCount}, replies: ${commentStats.replyCount})`,
  );
  console.log(`- Likes: ${likeCount}`);
  console.log('');
  console.log(`Seed account password: ${options.password}`);
  console.log('Sample accounts:');

  for (const user of users.slice(0, 5)) {
    console.log(`- @${user.username} | ${user.email} | ${user.name}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

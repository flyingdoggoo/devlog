import { PrismaClient, PostStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

type SeedConfig = {
  users: number;
  posts: number;
  tags: number;
  maxCommentsPerPost: number;
  maxRepliesPerComment: number;
  maxLikesPerPost: number;
  batchSize: number;
};

const DEFAULTS: SeedConfig = {
  users: 200,
  posts: 1200,
  tags: 40,
  maxCommentsPerPost: 8,
  maxRepliesPerComment: 2,
  maxLikesPerPost: 80,
  batchSize: 1000,
};

const SEED_PREFIX = 'seed';
const EMAIL_DOMAIN = 'seed.devlog.local';

const FIRST_NAMES_VN = [
  'Minh', 'Anh', 'Linh', 'Huy', 'Nam', 'Trang', 'Phuong', 'Khanh', 'Duc', 'Bao', 'Vy', 'Nhi',
  'Tuan', 'Quynh', 'Giang', 'Thanh', 'Trung', 'My', 'Ngan', 'Hoang', 'Hieu', 'Thao', 'Lam', 'Long',
];

const LAST_NAMES_VN = [
  'Nguyen', 'Tran', 'Le', 'Pham', 'Hoang', 'Phan', 'Vu', 'Dang', 'Bui', 'Do',
];

const FIRST_NAMES_GLOBAL = [
  'Ethan', 'Sophia', 'Liam', 'Olivia', 'Noah', 'Emma', 'Ava', 'Mason', 'Lucas', 'Mia',
  'Amelia', 'Elijah', 'Harper', 'Benjamin', 'Charlotte', 'Aiden', 'Aria', 'Henry', 'Scarlett', 'Jack',
];

const LAST_NAMES_GLOBAL = [
  'Smith', 'Johnson', 'Brown', 'Taylor', 'Anderson', 'Clark', 'Lewis', 'Walker', 'Young', 'Allen',
];

const TAG_POOL = [
  'typescript', 'javascript', 'nestjs', 'nodejs', 'react', 'nextjs', 'vuejs', 'redux', 'zustand',
  'prisma', 'postgresql', 'mongodb', 'redis', 'graphql', 'rest-api', 'microservices', 'system-design',
  'clean-architecture', 'domain-driven-design', 'testing', 'jest', 'cypress', 'performance',
  'web-security', 'oauth2', 'jwt', 'docker', 'kubernetes', 'ci-cd', 'devops', 'observability',
  'monitoring', 'refactoring', 'design-patterns', 'algorithms', 'data-structures', 'websocket',
  'message-queue', 'event-driven', 'frontend', 'backend', 'fullstack', 'tailwindcss', 'ux', 'accessibility',
  'async-programming', 'api-gateway', 'serverless', 'cloud', 'azure', 'aws',
];

const POST_TOPICS = [
  {
    title: 'Tối ưu Prisma query cho dashboard có phân trang',
    excerpt: 'Giảm số query N+1 bằng cách gom include hợp lý và map dữ liệu ở service layer.',
    points: [
      'Dùng include có điều kiện để chỉ lấy dữ liệu cần thiết cho feed ban đầu.',
      'Áp dụng pagination theo page/limit để kiểm soát tải truy vấn trong giờ cao điểm.',
      'Map response ngay tại service giúp frontend đơn giản và hạn chế logic lặp lại.',
    ],
  },
  {
    title: 'Thiết kế API search cho dữ liệu lớn',
    excerpt: 'Chuẩn hóa query params, filter và phân trang để API dễ mở rộng.',
    points: [
      'Định nghĩa rõ q, type, page và limit để frontend sync URL ổn định.',
      'Tách lớp parse filter để giữ controller gọn và testable.',
      'Bổ sung logging tookMs để đo hiệu năng trước khi scale hạ tầng.',
    ],
  },
  {
    title: 'Kinh nghiệm triển khai optimistic update cho like button',
    excerpt: 'Cập nhật UI tức thì, rollback nếu API lỗi để tăng cảm giác phản hồi cho người dùng.',
    points: [
      'Lưu trạng thái pending theo postId để chống spam click.',
      'Cập nhật count và trạng thái likedByMe trước khi chờ API trả về.',
      'Rollback đúng chiều thay đổi sẽ tránh lệch số liệu trên dashboard.',
    ],
  },
  {
    title: 'Clean Architecture trong dự án NestJS thực tế',
    excerpt: 'Tách module theo nghiệp vụ giúp codebase giữ được tính rõ ràng khi số lượng feature tăng.',
    points: [
      'Mỗi bounded context có service và controller riêng để giảm coupling.',
      'Dùng DTO và validation pipe làm lớp bảo vệ đầu vào nhất quán.',
      'Ẩn chi tiết ORM ở service layer để dễ thay đổi truy cập dữ liệu sau này.',
    ],
  },
  {
    title: 'Checklist bảo mật cho hệ thống đăng nhập JWT',
    excerpt: 'Một số cấu hình nhỏ nhưng ảnh hưởng lớn đến an toàn phiên đăng nhập.',
    points: [
      'Dùng HttpOnly cookie cho access/refresh token và cấu hình SameSite phù hợp môi trường.',
      'Rotate refresh token theo session để giảm rủi ro token replay.',
      'Chuẩn hóa thông báo lỗi login để tránh lộ thông tin tài khoản.',
    ],
  },
  {
    title: 'Cách tổ chức component loading skeleton hiệu quả',
    excerpt: 'Skeleton tốt giúp người dùng cảm thấy ứng dụng nhanh hơn ngay cả khi API chậm.',
    points: [
      'Thiết kế skeleton giống bố cục thật để giảm layout shift.',
      'Tách skeleton theo block dữ liệu: feed, sidebar và profile.',
      'Ẩn các tương tác không cần thiết trong lúc đang loading.',
    ],
  },
  {
    title: 'Tối ưu hiệu năng rendering danh sách bài viết',
    excerpt: 'Tránh re-render không cần thiết bằng cách chuẩn hóa state và key ổn định.',
    points: [
      'Giữ key theo id và tránh dùng index cho list động.',
      'Dùng state cập nhật tối thiểu theo từng item khi toggle like.',
      'Tách các hàm xử lý nặng ra khỏi render để giữ FPS ổn định.',
    ],
  },
  {
    title: 'Thực hành viết comment có giá trị trong code review',
    excerpt: 'Comment tập trung vào tác động và ngữ cảnh giúp team xử lý nhanh hơn.',
    points: [
      'Nêu rõ vấn đề có thể gây bug hoặc regression thay vì góp ý chung chung.',
      'Đề xuất hướng fix cụ thể để người nhận xử lý ngay được.',
      'Tách concern theo ưu tiên để buổi review ngắn và hiệu quả hơn.',
    ],
  },
  {
    title: 'Chiến lược seed dữ liệu lớn để test dashboard',
    excerpt: 'Dữ liệu seed sát thực tế giúp phát hiện bottleneck trước khi deploy thật.',
    points: [
      'Phân phối dữ liệu theo nhiều author để feed không bị thiên lệch.',
      'Thêm like/comment theo ngưỡng ngẫu nhiên để mô phỏng traffic thật.',
      'Dùng script cleanup riêng để reset nhanh trong quá trình benchmark.',
    ],
  },
  {
    title: 'Kinh nghiệm xử lý migration Prisma khi schema thay đổi lớn',
    excerpt: 'Triển khai migration theo từng bước giúp giảm rủi ro trên database có dữ liệu thật.',
    points: [
      'Thêm cột nullable và backfill trước khi chuyển sang not null.',
      'Viết migration SQL rõ ràng thay vì phụ thuộc hoàn toàn vào auto-generated.',
      'Luôn kiểm tra index và unique constraint sau khi hoàn tất backfill.',
    ],
  },
];

const COMMENT_TEMPLATES = [
  'Bài viết rất hữu ích, mình áp dụng được ngay cho dự án hiện tại.',
  'Phần phân tích rất rõ ràng, đặc biệt là đoạn nói về trade-off hiệu năng.',
  'Cảm ơn bạn đã chia sẻ, mình cũng từng gặp đúng vấn đề này ở production.',
  'Mình thích cách bạn tổ chức flow từ backend tới frontend, dễ bảo trì.',
  'Có thể viết thêm phần benchmark trước/sau tối ưu không? Mình rất quan tâm.',
  'Mình đã thử theo hướng này, kết quả cải thiện rõ ở thời gian phản hồi API.',
  'Bài này đúng thứ mình đang cần để review lại kiến trúc của team.',
  'Giải thích gọn nhưng vẫn đủ chiều sâu, rất đáng tham khảo.',
  'Mình nghĩ phần error handling này nên đưa vào guideline cho cả team.',
  'Đọc xong có thêm động lực refactor module cũ, cảm ơn bạn nhiều.',
];

const REPLY_TEMPLATES = [
  'Chuẩn luôn, team mình cũng vừa áp dụng tương tự.',
  'Mình đồng ý, điểm này rất quan trọng khi scale.',
  'Cảm ơn bạn góp ý, mình sẽ bổ sung vào checklist.',
  'Mình đã thử và confirm là cách này ổn định hơn hẳn.',
  'Hay quá, để mình test thêm rồi chia sẻ kết quả sau.',
];

function parseArgs(argv: string[]): SeedConfig {
  const cfg = { ...DEFAULTS };
  for (const arg of argv) {
    if (!arg.startsWith('--')) continue;
    const [key, raw] = arg.slice(2).split('=');
    if (!raw) continue;
    const n = Number(raw);
    if (!Number.isFinite(n) || n < 0) continue;

    switch (key) {
      case 'users':
        cfg.users = Math.floor(n);
        break;
      case 'posts':
        cfg.posts = Math.floor(n);
        break;
      case 'tags':
        cfg.tags = Math.floor(n);
        break;
      case 'maxComments':
        cfg.maxCommentsPerPost = Math.floor(n);
        break;
      case 'maxReplies':
        cfg.maxRepliesPerComment = Math.floor(n);
        break;
      case 'maxLikes':
        cfg.maxLikesPerPost = Math.floor(n);
        break;
      case 'batch':
        cfg.batchSize = Math.max(100, Math.floor(n));
        break;
      default:
        break;
    }
  }

  if (cfg.users < 2) cfg.users = 2;
  if (cfg.posts < 1) cfg.posts = 1;
  if (cfg.tags < 1) cfg.tags = 1;
  if (cfg.maxLikesPerPost > cfg.users) cfg.maxLikesPerPost = cfg.users;
  return cfg;
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function chunk<T>(arr: T[], size: number) {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

function pickDistinct<T>(arr: T[], count: number): T[] {
  if (count <= 0) return [];
  if (count >= arr.length) return [...arr];

  const copy = [...arr];
  const picked: T[] = [];
  for (let i = 0; i < count; i++) {
    const idx = randInt(0, copy.length - 1);
    picked.push(copy[idx]);
    copy.splice(idx, 1);
  }
  return picked;
}

function normalizeForUsername(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '.');
}

function buildRealName(index: number) {
  const useVN = index % 3 !== 0;
  if (useVN) {
    const last = LAST_NAMES_VN[index % LAST_NAMES_VN.length];
    const first = FIRST_NAMES_VN[(index * 7) % FIRST_NAMES_VN.length];
    return `${last} ${first}`;
  }

  const first = FIRST_NAMES_GLOBAL[index % FIRST_NAMES_GLOBAL.length];
  const last = LAST_NAMES_GLOBAL[(index * 5) % LAST_NAMES_GLOBAL.length];
  return `${first} ${last}`;
}

function buildPostContent(topic: { title: string; points: string[] }, index: number, authorName: string) {
  return [
    `Trong bài viết này mình ghi lại quá trình triển khai thực tế cho chủ đề: ${topic.title}.`,
    `Bối cảnh: hệ thống của team có lượng truy cập tăng dần theo tuần, vì vậy mình ưu tiên cách tiếp cận dễ đo lường và rollback an toàn.`,
    ...topic.points.map((point, i) => `${i + 1}. ${point}`),
    `Kết luận: nếu làm theo từng bước nhỏ, team sẽ kiểm soát được rủi ro và vẫn cải thiện được tốc độ release.`,
    `Tác giả note: ${authorName} - case #${index + 1}.`,
  ].join('\n\n');
}

function buildComment(postTitle: string) {
  const sentence = COMMENT_TEMPLATES[randInt(0, COMMENT_TEMPLATES.length - 1)];
  return `${sentence} (liên quan tới: ${postTitle.toLowerCase()})`;
}

function buildReply() {
  return REPLY_TEMPLATES[randInt(0, REPLY_TEMPLATES.length - 1)];
}

async function seedTags(tagCount: number, batchSize: number) {
  const tags = Array.from({ length: tagCount }).map((_, i) => ({
    id: randomUUID(),
    name: TAG_POOL[i % TAG_POOL.length],
  }));

  for (const part of chunk(tags, batchSize)) {
    await prisma.tag.createMany({ data: part, skipDuplicates: true });
  }

  const existing = await prisma.tag.findMany({
    where: { name: { in: tags.map((t) => t.name) } },
    select: { id: true, name: true },
  });

  return existing;
}

async function seedUsers(userCount: number, batchSize: number) {
  const passwordHash = await bcrypt.hash('SeedPassword@123', 10);
  const now = Date.now().toString();
  const usernameSet = new Set<string>();

  const users = Array.from({ length: userCount }).map((_, i) => {
    const id = randomUUID();
    const index = i + 1;
    const name = buildRealName(index);
    let username = `${normalizeForUsername(name)}.${index}`;
    if (usernameSet.has(username)) {
      username = `${username}.${randInt(10, 99)}`;
    }
    usernameSet.add(username);

    return {
      user: {
        id,
        username,
        name,
        avatarUrl: `https://api.dicebear.com/9.x/shapes/svg?seed=${username}`,
      },
      credential: {
        id: randomUUID(),
        userId: id,
        email: `${SEED_PREFIX}.${now}.${index}@${EMAIL_DOMAIN}`,
        passwordHash,
      },
    };
  });

  for (const part of chunk(users.map((u) => u.user), batchSize)) {
    await prisma.user.createMany({ data: part, skipDuplicates: true });
  }
  for (const part of chunk(users.map((u) => u.credential), batchSize)) {
    await prisma.credential.createMany({ data: part, skipDuplicates: true });
  }

  return users.map((u) => u.user);
}

async function seedPosts(users: Array<{ id: string }>, postCount: number, batchSize: number) {
  const now = Date.now();
  const posts = Array.from({ length: postCount }).map((_, i) => {
    const index = i + 1;
    const author = users[randInt(0, users.length - 1)] as { id: string; name?: string | null };
    const topic = POST_TOPICS[i % POST_TOPICS.length];
    const title = `${topic.title} #${index}`;

    return {
      id: randomUUID(),
      authorId: author.id,
      title,
      slug: `${SEED_PREFIX}-post-${now}-${index}`,
      content: buildPostContent(topic, i, author.name ?? 'Unknown Author'),
      excerpt: topic.excerpt,
      viewCount: randInt(0, 5000),
      status: PostStatus.PUBLISHED,
      publishedAt: new Date(Date.now() - randInt(0, 1000 * 60 * 60 * 24 * 60)),
    };
  });

  for (const part of chunk(posts, batchSize)) {
    await prisma.post.createMany({ data: part, skipDuplicates: true });
  }

  return posts;
}

async function seedPostTags(
  posts: Array<{ id: string }>,
  tags: Array<{ id: string }>,
  batchSize: number,
) {
  const links: Array<{ postId: string; tagId: string }> = [];

  for (const post of posts) {
    const count = randInt(1, Math.min(4, tags.length));
    const picked = pickDistinct(tags, count);
    for (const tag of picked) {
      links.push({ postId: post.id, tagId: tag.id });
    }
  }

  for (const part of chunk(links, batchSize)) {
    await prisma.postTag.createMany({ data: part, skipDuplicates: true });
  }

  return links.length;
}

async function seedComments(
  posts: Array<{ id: string; title: string }>,
  users: Array<{ id: string }>,
  maxCommentsPerPost: number,
  maxRepliesPerComment: number,
  batchSize: number,
) {
  const comments: Array<{
    id: string;
    postId: string;
    authorId: string;
    content: string;
    parentId: string | null;
    active: boolean;
    createdAt: Date;
  }> = [];

  for (const post of posts) {
    const topLevelCount = randInt(0, maxCommentsPerPost);
    const topLevelIds: string[] = [];

    for (let i = 0; i < topLevelCount; i++) {
      const id = randomUUID();
      topLevelIds.push(id);
      comments.push({
        id,
        postId: post.id,
        authorId: users[randInt(0, users.length - 1)].id,
        content: buildComment(post.title),
        parentId: null,
        active: true,
        createdAt: new Date(Date.now() - randInt(0, 1000 * 60 * 60 * 24 * 30)),
      });
    }

    for (const parentId of topLevelIds) {
      const replies = randInt(0, maxRepliesPerComment);
      for (let r = 0; r < replies; r++) {
        comments.push({
          id: randomUUID(),
          postId: post.id,
          authorId: users[randInt(0, users.length - 1)].id,
          content: buildReply(),
          parentId,
          active: true,
          createdAt: new Date(Date.now() - randInt(0, 1000 * 60 * 60 * 24 * 30)),
        });
      }
    }
  }

  for (const part of chunk(comments, batchSize)) {
    await prisma.comment.createMany({ data: part, skipDuplicates: true });
  }

  return comments.length;
}

async function seedLikes(
  posts: Array<{ id: string }>,
  users: Array<{ id: string }>,
  maxLikesPerPost: number,
  batchSize: number,
) {
  const likes: Array<{
    id: string;
    postId: string;
    userId: string;
    active: boolean;
    createdAt: Date;
  }> = [];

  for (const post of posts) {
    const count = randInt(0, Math.min(maxLikesPerPost, users.length));
    const pickedUsers = pickDistinct(users, count);

    for (const user of pickedUsers) {
      likes.push({
        id: randomUUID(),
        postId: post.id,
        userId: user.id,
        active: true,
        createdAt: new Date(Date.now() - randInt(0, 1000 * 60 * 60 * 24 * 30)),
      });
    }
  }

  for (const part of chunk(likes, batchSize)) {
    await prisma.like.createMany({ data: part, skipDuplicates: true });
  }

  return likes.length;
}

async function main() {
  const cfg = parseArgs(process.argv.slice(2));

  console.log('Starting large seed with config:', cfg);

  const tags = await seedTags(cfg.tags, cfg.batchSize);
  const users = await seedUsers(cfg.users, cfg.batchSize);
  const posts = await seedPosts(users, cfg.posts, cfg.batchSize);

  const [postTagCount, commentCount, likeCount] = await Promise.all([
    seedPostTags(posts, tags, cfg.batchSize),
    seedComments(
      posts,
      users,
      cfg.maxCommentsPerPost,
      cfg.maxRepliesPerComment,
      cfg.batchSize,
    ),
    seedLikes(posts, users, cfg.maxLikesPerPost, cfg.batchSize),
  ]);

  console.log('Seed complete');
  console.log(`- Users: ${users.length}`);
  console.log(`- Tags: ${tags.length}`);
  console.log(`- Posts: ${posts.length}`);
  console.log(`- PostTags: ${postTagCount}`);
  console.log(`- Comments: ${commentCount}`);
  console.log(`- Likes: ${likeCount}`);
  console.log(`Seed users are identifiable via credential email domain: ${EMAIL_DOMAIN}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

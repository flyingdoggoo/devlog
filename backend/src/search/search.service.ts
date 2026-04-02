import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';
import { RedisCacheService } from '../cache/redis-cache.service';

export type SearchType = 'posts' | 'users' | 'tags';

interface SearchParams {
    q: string;
    type?: string;
    filters?: string;
    page?: number;
    limit?: number;
}

export interface SearchPayload<T = unknown> {
    q: string;
    type: SearchType;
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
    tookMs: number;
    items: T[];
}

interface CountRow {
    total: number;
}

interface PostSearchRow {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    createdAt: Date;
    authorId: string;
    authorUsername: string;
    authorName: string | null;
    authorAvatarUrl: string | null;
    rank: number;
    likeCount: number;
    commentCount: number;
}

interface UserSearchRow {
    id: string;
    username: string;
    name: string | null;
    avatarUrl: string | null;
    createdAt: Date;
    rank: number;
    followerCount: number;
    postCount: number;
}

interface TagSearchRow {
    id: string;
    name: string;
    rank: number;
    postCount: number;
}

@Injectable()
export class SearchService {
    private static readonly DEFAULT_LIMIT = 20;
    private static readonly MAX_LIMIT = 50;
    private static readonly CACHE_TTL_SECONDS = 60;

    constructor(
        private readonly prisma: PrismaService,
        private readonly redisCache: RedisCacheService,
    ) { }

    async search(params: SearchParams): Promise<SearchPayload> {
        const startedAt = Date.now();
        const q = this.normalizeQuery(params.q);
        const type = this.resolveType(params.type, params.filters);
        const page = this.normalizePage(params.page);
        const limit = this.normalizeLimit(params.limit);

        if (q.length < 2) {
            return {
                q,
                type,
                page,
                limit,
                total: 0,
                hasMore: false,
                tookMs: 0,
                items: [],
            };
        }

        const cacheKey = this.buildCacheKey({ q, type, page, limit });
        const cached = await this.redisCache.getJson<SearchPayload>(cacheKey);

        if (cached) {
            return {
                ...cached,
                tookMs: Date.now() - startedAt,
            };
        }

        const offset = (page - 1) * limit;
        const result =
            type === 'users'
                ? await this.searchUsers(q, limit, offset)
                : type === 'tags'
                    ? await this.searchTags(q, limit, offset)
                    : await this.searchPosts(q, limit, offset);

        const payload: SearchPayload = {
            q,
            type,
            page,
            limit,
            total: result.total,
            hasMore: offset + result.items.length < result.total,
            tookMs: Date.now() - startedAt,
            items: result.items,
        };

        await this.redisCache.setJson(cacheKey, payload, SearchService.CACHE_TTL_SECONDS);
        return payload;
    }

    private async searchPosts(q: string, limit: number, offset: number) {
        const rowsPromise = this.prisma.$queryRaw<PostSearchRow[]>(Prisma.sql`
    SELECT
      p.id,
      p.title,
      p.slug,
      p.excerpt,
      p."createdAt" AS "createdAt",
      u.id AS "authorId",
      u.username AS "authorUsername",
      u.name AS "authorName",
      u."avatarUrl" AS "authorAvatarUrl",
      ts_rank_cd(
        to_tsvector(
          'simple',
          public.immutable_unaccent(coalesce(p.title, '') || ' ' || coalesce(p.excerpt, '') || ' ' || coalesce(p.content, ''))
        ),
        websearch_to_tsquery('simple', public.immutable_unaccent(${q}))
      )::double precision AS rank,
      (
        SELECT COUNT(*)::int
        FROM "Like" l
        WHERE l."postId" = p.id
          AND l.active = true
      ) AS "likeCount",
      (
        SELECT COUNT(*)::int
        FROM "Comment" c
        WHERE c."postId" = p.id
          AND c.active = true
      ) AS "commentCount"
    FROM "Post" p
    JOIN "User" u ON u.id = p."authorId"
    WHERE p.status = 'PUBLISHED'
      AND to_tsvector(
        'simple',
        public.immutable_unaccent(coalesce(p.title, '') || ' ' || coalesce(p.excerpt, '') || ' ' || coalesce(p.content, ''))
      ) @@ websearch_to_tsquery('simple', public.immutable_unaccent(${q}))
    ORDER BY rank DESC, p."createdAt" DESC
    LIMIT ${limit}
    OFFSET ${offset};
  `);

        const countPromise = this.prisma.$queryRaw<CountRow[]>(Prisma.sql`
    SELECT COUNT(*)::int AS total
    FROM "Post" p
    WHERE p.status = 'PUBLISHED'
      AND to_tsvector(
        'simple',
        public.immutable_unaccent(coalesce(p.title, '') || ' ' || coalesce(p.excerpt, '') || ' ' || coalesce(p.content, ''))
      ) @@ websearch_to_tsquery('simple', public.immutable_unaccent(${q}));
  `);

        const [rows, countRows] = await Promise.all([rowsPromise, countPromise]);

        return {
            items: rows.map((row) => ({
                id: row.id,
                title: row.title,
                slug: row.slug,
                excerpt: row.excerpt,
                createdAt: new Date(row.createdAt).toISOString(),
                rank: this.toNumber(row.rank),
                author: {
                    id: row.authorId,
                    username: row.authorUsername,
                    name: row.authorName,
                    avatarUrl: row.authorAvatarUrl,
                },
                _count: {
                    likes: this.toNumber(row.likeCount),
                    comments: this.toNumber(row.commentCount),
                },
            })),
            total: this.toNumber(countRows[0]?.total),
        };
    }

    private async searchUsers(q: string, limit: number, offset: number) {
        const rowsPromise = this.prisma.$queryRaw<UserSearchRow[]>(Prisma.sql`
    SELECT
      u.id,
      u.username,
      u.name,
      u."avatarUrl",
      u."createdAt" AS "createdAt",
      ts_rank_cd(
        to_tsvector('simple', public.immutable_unaccent(coalesce(u.username, '') || ' ' || coalesce(u.name, ''))),
        websearch_to_tsquery('simple', public.immutable_unaccent(${q}))
      )::double precision AS rank,
      (
        SELECT COUNT(*)::int
        FROM "Follow" f
        WHERE f."followingId" = u.id
          AND f.active = true
      ) AS "followerCount",
      (
        SELECT COUNT(*)::int
        FROM "Post" p
        WHERE p."authorId" = u.id
          AND p.status = 'PUBLISHED'
      ) AS "postCount"
    FROM "User" u
    WHERE u.active = true
      AND to_tsvector('simple', public.immutable_unaccent(coalesce(u.username, '') || ' ' || coalesce(u.name, '')))
        @@ websearch_to_tsquery('simple', public.immutable_unaccent(${q}))
    ORDER BY rank DESC, u."createdAt" DESC
    LIMIT ${limit}
    OFFSET ${offset};
  `);

        const countPromise = this.prisma.$queryRaw<CountRow[]>(Prisma.sql`
    SELECT COUNT(*)::int AS total
    FROM "User" u
    WHERE u.active = true
      AND to_tsvector('simple', public.immutable_unaccent(coalesce(u.username, '') || ' ' || coalesce(u.name, '')))
        @@ websearch_to_tsquery('simple', public.immutable_unaccent(${q}));
  `);

        const [rows, countRows] = await Promise.all([rowsPromise, countPromise]);

        return {
            items: rows.map((row) => ({
                id: row.id,
                username: row.username,
                name: row.name,
                avatarUrl: row.avatarUrl,
                createdAt: new Date(row.createdAt).toISOString(),
                rank: this.toNumber(row.rank),
                _count: {
                    followers: this.toNumber(row.followerCount),
                    posts: this.toNumber(row.postCount),
                },
            })),
            total: this.toNumber(countRows[0]?.total),
        };
    }

    private async searchTags(q: string, limit: number, offset: number) {
        const likePattern = `%${q}%`;

        const rowsPromise = this.prisma.$queryRaw<TagSearchRow[]>(Prisma.sql`
    SELECT
      t.id,
      t.name,
      GREATEST(
        similarity(public.immutable_unaccent(t.name), public.immutable_unaccent(${q})),
        ts_rank_cd(
          to_tsvector('simple', public.immutable_unaccent(t.name)),
          websearch_to_tsquery('simple', public.immutable_unaccent(${q}))
        )
      )::double precision AS rank,
      (
        SELECT COUNT(*)::int
        FROM "PostTag" pt
        JOIN "Post" p ON p.id = pt."postId"
        WHERE pt."tagId" = t.id
          AND p.status = 'PUBLISHED'
      ) AS "postCount"
    FROM "Tag" t
    WHERE to_tsvector('simple', public.immutable_unaccent(t.name))
        @@ websearch_to_tsquery('simple', public.immutable_unaccent(${q}))
       OR public.immutable_unaccent(t.name) % public.immutable_unaccent(${q})
       OR public.immutable_unaccent(t.name) ILIKE public.immutable_unaccent(${likePattern})
    ORDER BY rank DESC, "postCount" DESC, t.name ASC
    LIMIT ${limit}
    OFFSET ${offset};
  `);

        const countPromise = this.prisma.$queryRaw<CountRow[]>(Prisma.sql`
    SELECT COUNT(*)::int AS total
    FROM "Tag" t
    WHERE to_tsvector('simple', public.immutable_unaccent(t.name))
        @@ websearch_to_tsquery('simple', public.immutable_unaccent(${q}))
       OR public.immutable_unaccent(t.name) % public.immutable_unaccent(${q})
       OR public.immutable_unaccent(t.name) ILIKE public.immutable_unaccent(${likePattern});
  `);

        const [rows, countRows] = await Promise.all([rowsPromise, countPromise]);

        return {
            items: rows.map((row) => ({
                id: row.id,
                name: row.name,
                rank: this.toNumber(row.rank),
                postCount: this.toNumber(row.postCount),
            })),
            total: this.toNumber(countRows[0]?.total),
        };
    }
    private resolveType(type?: string, filters?: string): SearchType {
        const normalizedType = (type ?? '').trim().toLowerCase();

        if (normalizedType === 'posts' || normalizedType === 'users' || normalizedType === 'tags') {
            return normalizedType;
        }

        const normalizedFilters = (filters ?? '').trim().toLowerCase();

        if (normalizedFilters === 'class_name:user') {
            return 'users';
        }

        if (normalizedFilters === 'class_name:tag') {
            return 'tags';
        }

        return 'posts';
    }

    private normalizeQuery(raw: string): string {
        return (raw ?? '').trim().replace(/\s+/g, ' ');
    }

    private normalizePage(page?: number): number {
        if (!Number.isFinite(page)) return 1;
        return Math.max(1, Math.floor(page as number));
    }

    private normalizeLimit(limit?: number): number {
        if (!Number.isFinite(limit)) return SearchService.DEFAULT_LIMIT;

        return Math.min(
            SearchService.MAX_LIMIT,
            Math.max(1, Math.floor(limit as number)),
        );
    }

    private buildCacheKey(input: { q: string; type: SearchType; page: number; limit: number }): string {
        const encodedQuery = encodeURIComponent(input.q.toLowerCase());
        return `search:v1:${input.type}:${input.page}:${input.limit}:${encodedQuery}`;
    }

    private toNumber(value: unknown): number {
        const n = Number(value);
        return Number.isFinite(n) ? n : 0;
    }
}

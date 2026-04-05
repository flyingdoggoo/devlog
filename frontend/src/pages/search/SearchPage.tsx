import { FormEvent, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AvatarMenu } from '@components/AvatarMenu';
import { useAppSelector } from '@app/hooks';
import { selectIsAuthenticated } from '@features/auth/auth.slice';
import { FileText, Hash, Home, Search, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  searchApi,
  type SearchItem,
  type SearchPostItem,
  type SearchTagItem,
  type SearchType,
  type SearchUserItem,
} from '@services/search.service';
import { getPostPreviewText } from '@/utils/preview-text';

const PAGE_SIZE = 20;
const TAB_OPTIONS: Array<{ value: SearchType; label: string; icon: LucideIcon; activeClass: string }> = [
  { value: 'posts', label: 'Posts', icon: FileText, activeClass: 'bg-blue-600 text-white border-blue-600' },
  { value: 'users', label: 'Users', icon: Users, activeClass: 'bg-emerald-600 text-white border-emerald-600' },
  { value: 'tags', label: 'Tags', icon: Hash, activeClass: 'bg-orange-500 text-white border-orange-500' },
];

function isPostItem(item: SearchItem): item is SearchPostItem {
  return typeof item === 'object' && item !== null && 'author' in item && 'title' in item;
}

function isUserItem(item: SearchItem): item is SearchUserItem {
  return typeof item === 'object' && item !== null && 'username' in item && !('author' in item);
}

function isTagItem(item: SearchItem): item is SearchTagItem {
  return typeof item === 'object' && item !== null && 'postCount' in item && !('username' in item);
}

function resolveType(params: URLSearchParams): SearchType {
  const type = (params.get('type') ?? '').toLowerCase();
  if (type === 'users' || type === 'tags' || type === 'posts') {
    return type;
  }

  const filters = (params.get('filters') ?? '').toLowerCase();
  if (filters === 'class_name:user') return 'users';
  if (filters === 'class_name:tag') return 'tags';
  return 'posts';
}

function resolvePage(params: URLSearchParams): number {
  const raw = Number(params.get('page') ?? 1);
  if (!Number.isFinite(raw)) return 1;
  return Math.max(1, Math.floor(raw));
}

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (Array.isArray(message)) return message.join(', ');
    if (typeof message === 'string') return message;
  }

  if (error instanceof Error) return error.message;
  return 'Search failed';
}

export function SearchPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [searchParams, setSearchParams] = useSearchParams();

  const q = (searchParams.get('q') ?? '').trim();
  const type = resolveType(searchParams);
  const page = resolvePage(searchParams);

  const [input, setInput] = useState(q);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{
    items: SearchItem[];
    total: number;
    hasMore: boolean;
    tookMs: number;
  } | null>(null);

  useEffect(() => {
    setInput(q);
  }, [q]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (q.length < 2) {
        setData(null);
        setError(null);
        return;
      }

      // Reset old result set when query context changes (q/type/page)
      // to avoid rendering mismatched item-shape across tabs.
      setData(null);
      setLoading(true);
      setError(null);

      try {
        const result = await searchApi.search({
          q,
          type,
          page,
          limit: PAGE_SIZE,
        });

        if (!cancelled) {
          setData({
            items: result.items,
            total: result.total,
            hasMore: result.hasMore,
            tookMs: result.tookMs,
          });
        }
      } catch (fetchError) {
        if (!cancelled) {
          setError(getErrorMessage(fetchError));
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [q, type, page]);

  const updateParams = (next: { nextQ?: string; nextType?: SearchType; nextPage?: number }) => {
    const params = new URLSearchParams(searchParams);

    const finalQ = (next.nextQ ?? q).trim();
    const finalType = next.nextType ?? type;
    const finalPage = next.nextPage ?? page;

    if (finalQ.length > 0) params.set('q', finalQ);
    else params.delete('q');

    params.set('type', finalType);
    params.set('page', String(finalPage));
    params.delete('filters');

    setSearchParams(params);
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateParams({ nextQ: input, nextPage: 1 });
  };

  const postItems = (data?.items ?? []).filter(isPostItem);
  const userItems = (data?.items ?? []).filter(isUserItem);
  const tagItems = (data?.items ?? []).filter(isTagItem);
  const visibleItemsCount =
    type === 'posts' ? postItems.length : type === 'users' ? userItems.length : tagItems.length;

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#1a1c1c]">
      <header className="fixed top-0 w-full h-16 px-6 bg-[#f9f9f9] border-b border-neutral-200/60 z-50 flex items-center justify-between">
        <button
          className="text-2xl font-bold font-['Space_Grotesk'] tap-feedback"
          onClick={() => navigate('/home')}
        >
          DevLog
        </button>
        <div className="flex items-center gap-4">
          <button
            className="text-sm font-medium px-3 py-1 rounded-md hover:bg-blue-50 hover:text-blue-700 transition-all tap-feedback flex items-center gap-1.5"
            onClick={() => navigate('/home')}
          >
            <Home className="h-4 w-4" />
            Home
          </button>
          {isAuthenticated ? (
            <AvatarMenu size="sm" />
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-neutral-300 text-neutral-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-all tap-feedback"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/register')}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-blue-300 text-blue-700 bg-white hover:bg-blue-50 transition-all tap-feedback"
              >
                Register
              </button>
            </>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto pt-24 pb-10 px-4 md:px-6">
        <form onSubmit={onSubmit} className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sky-600" />
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Search posts, users, tags..."
              className="w-full rounded-xl border border-neutral-200 bg-white pl-11 pr-28 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-200 hover:border-sky-200 transition-colors"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-emerald-500 text-white text-sm hover:shadow-md transition-all tap-feedback"
            >
              Search
            </button>
          </div>
        </form>

        <div className="flex items-center gap-2 mb-6">
          {TAB_OPTIONS.map((tab) => {
            const TabIcon = tab.icon;
            return (
            <button
              key={tab.value}
              onClick={() => updateParams({ nextType: tab.value, nextPage: 1 })}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border tap-feedback flex items-center gap-2 ${
                type === tab.value
                  ? tab.activeClass
                  : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              <TabIcon className="h-4 w-4" />
              {tab.label}
            </button>
            );
          })}
        </div>

        {q.length < 2 && (
          <div className="bg-white border border-neutral-200 rounded-xl p-6 text-sm text-neutral-600">
            Type at least 2 characters to search.
          </div>
        )}

        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-20 bg-white border border-neutral-200 rounded-xl animate-pulse" />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="bg-white border border-red-200 text-red-600 rounded-xl p-4 text-sm">
            {error}
          </div>
        )}

        {!loading && !error && data && (
          <div className="space-y-4">
            <div className="text-xs text-neutral-500">
              {data.total} results in {data.tookMs} ms
            </div>

            {type === 'posts' &&
              postItems.map((item) => (
                <article
                  key={item.id}
                  className="bg-white border border-neutral-200 rounded-xl p-5 cursor-pointer hover:border-blue-200 interactive-card tap-feedback"
                  onClick={() => navigate(`/posts/${item.slug}`)}
                >
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                  <p className="text-sm text-neutral-600 mt-1 line-clamp-2">
                    {getPostPreviewText(item.excerpt, undefined, { fallback: 'No excerpt' })}
                  </p>
                  <div className="mt-3 flex items-center gap-4 text-xs text-neutral-500">
                    <span>@{item.author?.username ?? 'unknown'}</span>
                    <span>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</span>
                    <span>{item._count?.likes ?? 0} likes</span>
                    <span>{item._count?.comments ?? 0} comments</span>
                  </div>
                </article>
              ))}

            {type === 'users' &&
              userItems.map((item) => (
                <article
                  key={item.id}
                  className="bg-white border border-neutral-200 rounded-xl p-5 cursor-pointer hover:border-emerald-200 interactive-card tap-feedback"
                  onClick={() => navigate(`/profile/${item.username}`)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{item.name || item.username}</h3>
                      <p className="text-sm text-neutral-500">@{item.username}</p>
                    </div>
                    <div className="text-right text-xs text-neutral-500">
                      <p>{item._count.followers} followers</p>
                      <p>{item._count.posts} posts</p>
                    </div>
                  </div>
                </article>
              ))}

            {type === 'tags' &&
              tagItems.map((item) => (
                <article
                  key={item.id}
                  className="bg-white border border-neutral-200 rounded-xl p-5 interactive-card cursor-pointer hover:border-orange-200 tap-feedback"
                  onClick={() => navigate(`/tags?tagId=${item.id}`)}
                >
                  <h3 className="font-semibold text-lg">#{item.name}</h3>
                  <p className="text-xs text-neutral-500 mt-1">{item.postCount} published posts</p>
                </article>
              ))}

            {visibleItemsCount === 0 && (
              <div className="bg-white border border-neutral-200 rounded-xl p-6 text-sm text-neutral-600">
                No matching results.
              </div>
            )}

            <div className="pt-2 flex items-center justify-between">
              <button
                className="px-4 py-2 rounded-lg border border-neutral-200 bg-white text-sm disabled:opacity-40 hover:border-blue-200 hover:bg-blue-50 transition-colors tap-feedback"
                disabled={page <= 1 || loading}
                onClick={() => updateParams({ nextPage: page - 1 })}
              >
                Previous
              </button>
              <span className="text-sm text-neutral-600">Page {page}</span>
              <button
                className="px-4 py-2 rounded-lg border border-neutral-200 bg-white text-sm disabled:opacity-40 hover:border-blue-200 hover:bg-blue-50 transition-colors tap-feedback"
                disabled={!data.hasMore || loading}
                onClick={() => updateParams({ nextPage: page + 1 })}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

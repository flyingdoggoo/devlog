import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AvatarMenu } from '@components/AvatarMenu';
import { Bookmark, Home } from 'lucide-react';
import { bookmarksApi } from '@services/bookmarks.service';
import type { Post } from '@/types/post';
import { formatReadTime } from '@/utils/read-metrics';
import { getPostPreviewText } from '@/utils/preview-text';

const PAGE_SIZE = 10;

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (Array.isArray(message)) return message.join(', ');
    if (typeof message === 'string') return message;
  }

  if (error instanceof Error) return error.message;
  return 'Could not load bookmarks';
}

export function BookmarksPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [pendingRemovePostIds, setPendingRemovePostIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await bookmarksApi.getMyBookmarks(1, PAGE_SIZE);
        if (!active) return;

        setPosts(result.items);
        setPage(result.page);
        setHasMore(result.hasMore);
      } catch (fetchError) {
        if (!active) return;
        setError(getErrorMessage(fetchError));
        setPosts([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    bootstrap();

    return () => {
      active = false;
    };
  }, []);

  const loadMore = async () => {
    if (loading || loadingMore || !hasMore) return;

    const nextPage = page + 1;

    try {
      setLoadingMore(true);
      setError(null);

      const result = await bookmarksApi.getMyBookmarks(nextPage, PAGE_SIZE);

      setPosts((prev) => {
        const existingIds = new Set(prev.map((post) => post.id));
        const uniqueIncoming = result.items.filter((post) => !existingIds.has(post.id));
        return [...prev, ...uniqueIncoming];
      });
      setPage(result.page);
      setHasMore(result.hasMore);
    } catch (fetchError) {
      setError(getErrorMessage(fetchError));
    } finally {
      setLoadingMore(false);
    }
  };

  const removeBookmark = async (event: React.MouseEvent, postId: string) => {
    event.stopPropagation();

    if (pendingRemovePostIds.has(postId)) return;

    try {
      setPendingRemovePostIds((prev) => {
        const next = new Set(prev);
        next.add(postId);
        return next;
      });

      await bookmarksApi.unbookmarkPost(postId);
      setPosts((prev) => prev.filter((post) => post.id !== postId));
    } catch (fetchError) {
      setError(getErrorMessage(fetchError));
    } finally {
      setPendingRemovePostIds((prev) => {
        const next = new Set(prev);
        next.delete(postId);
        return next;
      });
    }
  };

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
          <AvatarMenu size="sm" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto pt-24 pb-10 px-4 md:px-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold font-['Space_Grotesk'] flex items-center gap-2">
            <Bookmark className="h-6 w-6 text-blue-700" />
            Bookmarks
          </h1>
          <p className="text-sm text-neutral-500 mt-2">Your saved posts in one place.</p>
        </div>

        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-24 rounded-xl border border-neutral-200 bg-white animate-pulse" />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="text-sm text-red-500">{error}</div>
        )}

        {!loading && !error && posts.length === 0 && (
          <div className="rounded-xl border border-neutral-200 bg-white p-6 text-sm text-neutral-600">
            No bookmarked posts yet.
          </div>
        )}

        {!loading && !error && posts.length > 0 && (
          <div className="space-y-4">
            {posts.map((post) => {
              const isRemoving = pendingRemovePostIds.has(post.id);

              return (
                <article
                  key={post.id}
                  className="rounded-xl border border-neutral-200 bg-white p-4 md:p-5 hover:border-blue-200 transition-colors cursor-pointer"
                  onClick={() => navigate(`/posts/${post.slug}`)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="text-lg font-semibold leading-snug">{post.title}</h2>
                      <p className="text-sm text-neutral-600 mt-2 line-clamp-2">
                        {getPostPreviewText(post.excerpt, post.content, { fallback: 'No excerpt' })}
                      </p>
                    </div>
                    <button
                      className="shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 disabled:opacity-50"
                      onClick={(event) => removeBookmark(event, post.id)}
                      disabled={isRemoving}
                    >
                      {isRemoving ? 'Removing...' : 'Remove'}
                    </button>
                  </div>

                  <div className="mt-3 text-xs text-neutral-500 flex flex-wrap items-center gap-3">
                    <span>@{post.author?.username ?? 'unknown'}</span>
                    <span>{new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                    <span>{post._count?.likes ?? 0} likes</span>
                    <span>{post._count?.comments ?? 0} comments</span>
                    <span>{formatReadTime(post.readTimeMinutes, post.content)}</span>
                  </div>
                </article>
              );
            })}

            {hasMore && (
              <button
                className="w-full md:w-auto px-4 py-2 rounded-lg border border-neutral-200 bg-white text-sm hover:bg-neutral-50 disabled:opacity-50"
                onClick={loadMore}
                disabled={loadingMore}
              >
                {loadingMore ? 'Loading...' : 'Load more'}
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

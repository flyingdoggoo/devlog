import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AvatarMenu } from '@components/AvatarMenu';
import { useAppSelector } from '@app/hooks';
import { selectIsAuthenticated } from '@features/auth/auth.slice';
import { Hash, Home, Search, Tag as TagIcon } from 'lucide-react';
import { searchApi, type SearchItem, type SearchTagItem } from '@services/search.service';
import { tagsApi } from '@services/tags.service';
import type { Post } from '@/types/post';
import type { Tag } from '@/types/tag';
import { formatReadTime } from '@/utils/read-metrics';
import { getPostPreviewText } from '@/utils/preview-text';

const PAGE_SIZE = 8;

function isTagSearchItem(item: SearchItem): item is SearchTagItem {
  return typeof item === 'object' && item !== null && 'postCount' in item && 'name' in item;
}

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (Array.isArray(message)) return message.join(', ');
    if (typeof message === 'string') return message;
  }

  if (error instanceof Error) return error.message;
  return 'Could not load tags';
}

export function TagsPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedTagId = (searchParams.get('tagId') ?? '').trim();

  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [searchedTags, setSearchedTags] = useState<Tag[]>([]);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [tagPosts, setTagPosts] = useState<Post[]>([]);

  const [tagQuery, setTagQuery] = useState('');

  const [loadingTags, setLoadingTags] = useState(true);
  const [searchingTags, setSearchingTags] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingMorePosts, setLoadingMorePosts] = useState(false);

  const [page, setPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(false);

  const [tagsError, setTagsError] = useState<string | null>(null);
  const [postsError, setPostsError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      try {
        setLoadingTags(true);
        setTagsError(null);

        const tags = await tagsApi.getAllTags();
        if (!active) return;

        const sorted = [...tags].sort((a, b) => a.name.localeCompare(b.name));
        setAllTags(sorted);
      } catch (error) {
        if (!active) return;
        setTagsError(getErrorMessage(error));
        setAllTags([]);
      } finally {
        if (active) setLoadingTags(false);
      }
    };

    bootstrap();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const query = tagQuery.trim();

    if (query.length < 2) {
      setSearchedTags([]);
      setSearchingTags(false);
      return;
    }

    let active = true;

    const runSearch = async () => {
      try {
        setSearchingTags(true);
        const result = await searchApi.search({
          q: query,
          type: 'tags',
          page: 1,
          limit: 40,
        });

        if (!active) return;

        const items = result.items
          .filter(isTagSearchItem)
          .map((item) => ({
            id: item.id,
            name: item.name,
            postCount: item.postCount,
          }));

        setSearchedTags(items);
      } catch {
        if (!active) return;
        setSearchedTags([]);
      } finally {
        if (active) setSearchingTags(false);
      }
    };

    runSearch();

    return () => {
      active = false;
    };
  }, [tagQuery]);

  const visibleTags = useMemo(() => {
    const query = tagQuery.trim().toLowerCase();

    if (query.length >= 2) {
      return searchedTags;
    }

    if (!query) {
      return allTags;
    }

    return allTags.filter((tag) => tag.name.toLowerCase().includes(query));
  }, [allTags, searchedTags, tagQuery]);

  useEffect(() => {
    if (!selectedTagId) {
      setSelectedTag(null);
      setTagPosts([]);
      setPage(1);
      setHasMorePosts(false);
      setPostsError(null);
      return;
    }

    let active = true;

    const fetchTagPosts = async () => {
      try {
        setLoadingPosts(true);
        setPostsError(null);

        const result = await tagsApi.getPostsByTagId(selectedTagId, 1, PAGE_SIZE);
        if (!active) return;

        setSelectedTag(result.tag);
        setTagPosts(result.items);
        setPage(result.page);
        setHasMorePosts(result.hasMore);
      } catch (error) {
        if (!active) return;
        setPostsError(getErrorMessage(error));
        setSelectedTag(null);
        setTagPosts([]);
        setPage(1);
        setHasMorePosts(false);
      } finally {
        if (active) setLoadingPosts(false);
      }
    };

    fetchTagPosts();

    return () => {
      active = false;
    };
  }, [selectedTagId]);

  const selectTag = (tag: Tag) => {
    const params = new URLSearchParams(searchParams);
    params.set('tagId', tag.id);
    setSearchParams(params);
  };

  const clearSelectedTag = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('tagId');
    setSearchParams(params);
  };

  const loadMorePosts = async () => {
    if (!selectedTagId || loadingMorePosts || loadingPosts || !hasMorePosts) return;

    const nextPage = page + 1;

    try {
      setLoadingMorePosts(true);
      setPostsError(null);

      const result = await tagsApi.getPostsByTagId(selectedTagId, nextPage, PAGE_SIZE);

      setTagPosts((prev) => {
        const existingIds = new Set(prev.map((post) => post.id));
        const uniqueIncoming = result.items.filter((post) => !existingIds.has(post.id));
        return [...prev, ...uniqueIncoming];
      });
      setPage(result.page);
      setHasMorePosts(result.hasMore);
    } catch (error) {
      setPostsError(getErrorMessage(error));
    } finally {
      setLoadingMorePosts(false);
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

      <main className="max-w-6xl mx-auto pt-24 pb-10 px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <aside className="lg:col-span-4 bg-white border border-neutral-200 rounded-2xl p-4 md:p-5 h-fit">
            <div className="flex items-center gap-2 mb-4">
              <TagIcon className="h-4 w-4 text-orange-600" />
              <h2 className="text-sm font-bold uppercase tracking-wider">Tags</h2>
            </div>

            <label htmlFor="tags-search" className="sr-only">
              Search tags
            </label>
            <div className="relative mb-3">
              <Search className="h-4 w-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="tags-search"
                type="text"
                value={tagQuery}
                onChange={(event) => setTagQuery(event.target.value)}
                placeholder="Search tags..."
                className="w-full rounded-lg border border-neutral-200 bg-white pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
              />
            </div>

            <p className="text-[11px] text-neutral-500 mb-4">
              Tag search is powered by the same global search feature.
            </p>

            {loadingTags && (
              <div className="space-y-2">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <div key={idx} className="h-9 bg-neutral-100 rounded-lg animate-pulse" />
                ))}
              </div>
            )}

            {!loadingTags && tagsError && (
              <div className="text-sm text-red-500">{tagsError}</div>
            )}

            {!loadingTags && !tagsError && (
              <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                {searchingTags && (
                  <div className="text-xs text-neutral-500 px-1">Searching...</div>
                )}

                {visibleTags.map((tag) => {
                  const isActive = selectedTagId === tag.id;

                  return (
                    <button
                      key={tag.id}
                      className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${
                        isActive
                          ? 'border-orange-300 bg-orange-50 text-orange-700'
                          : 'border-neutral-200 bg-white text-neutral-700 hover:border-orange-200 hover:bg-orange-50/50'
                      }`}
                      onClick={() => selectTag(tag)}
                    >
                      <span className="font-medium">#{tag.name}</span>
                      {typeof tag.postCount === 'number' && (
                        <span className="ml-2 text-xs text-neutral-500">{tag.postCount} posts</span>
                      )}
                    </button>
                  );
                })}

                {visibleTags.length === 0 && (
                  <div className="text-sm text-neutral-500 px-1">No tags found.</div>
                )}
              </div>
            )}
          </aside>

          <section className="lg:col-span-8 bg-white border border-neutral-200 rounded-2xl p-4 md:p-6 min-h-[300px]">
            {!selectedTagId && (
              <div className="h-full min-h-[260px] flex flex-col items-center justify-center text-center text-neutral-500">
                <Hash className="h-8 w-8 mb-3 text-neutral-400" />
                <p className="text-sm">Pick a tag to see related posts.</p>
              </div>
            )}

            {selectedTagId && (
              <>
                <div className="flex items-center justify-between mb-5 gap-3">
                  <div>
                    <h2 className="text-2xl font-bold font-['Space_Grotesk']">
                      #{selectedTag?.name ?? 'Tag'}
                    </h2>
                    <p className="text-xs text-neutral-500 mt-1">
                      {loadingPosts ? 'Loading related posts...' : `${tagPosts.length} posts loaded`}
                    </p>
                  </div>
                  <button
                    className="text-xs font-medium px-3 py-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50"
                    onClick={clearSelectedTag}
                  >
                    Clear
                  </button>
                </div>

                {loadingPosts && (
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, idx) => (
                      <div key={idx} className="h-24 rounded-xl border border-neutral-200 bg-neutral-50 animate-pulse" />
                    ))}
                  </div>
                )}

                {!loadingPosts && postsError && (
                  <div className="text-sm text-red-500">{postsError}</div>
                )}

                {!loadingPosts && !postsError && tagPosts.length === 0 && (
                  <div className="text-sm text-neutral-500">No published posts for this tag yet.</div>
                )}

                {!loadingPosts && !postsError && tagPosts.length > 0 && (
                  <div className="space-y-4">
                    {tagPosts.map((post) => (
                      <article
                        key={post.id}
                        className="rounded-xl border border-neutral-200 p-4 md:p-5 hover:border-blue-200 transition-colors cursor-pointer"
                        onClick={() => navigate(`/posts/${post.slug}`)}
                      >
                        <h3 className="text-lg font-semibold leading-snug">{post.title}</h3>
                        <p className="text-sm text-neutral-600 mt-2 line-clamp-2">
                          {getPostPreviewText(post.excerpt, post.content, { fallback: 'No excerpt' })}
                        </p>
                        <div className="mt-3 text-xs text-neutral-500 flex flex-wrap items-center gap-3">
                          <span>@{post.author?.username ?? 'unknown'}</span>
                          <span>{new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                          <span>{post._count?.likes ?? 0} likes</span>
                          <span>{post._count?.comments ?? 0} comments</span>
                          <span>{formatReadTime(post.readTimeMinutes, post.content)}</span>
                        </div>
                      </article>
                    ))}

                    {hasMorePosts && (
                      <button
                        className="w-full md:w-auto px-4 py-2 rounded-lg border border-neutral-200 bg-white text-sm hover:bg-neutral-50 disabled:opacity-50"
                        onClick={loadMorePosts}
                        disabled={loadingMorePosts}
                      >
                        {loadingMorePosts ? 'Loading...' : 'Load more'}
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

import { postsApi } from '@/services/posts.service';
import { tagsApi } from '@/services/tags.service';
import { usersApi } from '@/services/users.service';
import { likesApi } from '@/services/likes.service';
import { Post } from '@/types/post';
import { Tag } from '@/types/tag';
import { User } from '@/types/user';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AvatarMenu } from '@/components/AvatarMenu';
import { useAppSelector } from '@/app/hooks';
import { selectCurrentUser, selectIsAuthenticated } from '@/features/auth/auth.slice';
import { useRequireAuthAction } from '@hooks/useRequireAuthAction';
import {
  BarChart3,
  Bell,
  Bookmark,
  Compass,
  Flame,
  Heart,
  HelpCircle,
  Home,
  MessageCircle,
  Plus,
  Search,
  Settings,
  Tag as TagIcon,
  TrendingUp,
  Users,
} from 'lucide-react';

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getCurrentStreak(posts: Post[]) {
  const dateKeys = new Set(posts.map((post) => formatDateKey(new Date(post.createdAt))));
  const today = new Date();
  let streak = 0;

  while (true) {
    const cursor = new Date(today);
    cursor.setDate(today.getDate() - streak);
    const key = formatDateKey(cursor);
    if (!dateKeys.has(key)) {
      break;
    }
    streak += 1;
  }

  return streak;
}

function buildLast7DaysHeights(posts: Post[]) {
  const dayCounts = new Map<string, number>();
  for (const post of posts) {
    const key = formatDateKey(new Date(post.createdAt));
    dayCounts.set(key, (dayCounts.get(key) ?? 0) + 1);
  }

  const values = Array.from({ length: 7 }).map((_, idx) => {
    const day = new Date();
    day.setDate(day.getDate() - (6 - idx));
    return dayCounts.get(formatDateKey(day)) ?? 0;
  });

  const max = Math.max(...values, 1);
  return values.map((value) => Math.max(8, Math.round((value / max) * 40)));
}

export function HomePage() {
  const currentUser = useAppSelector(selectCurrentUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [posts, setPosts] = useState<Post[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [sidebarLoading, setSidebarLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const pageRef = useRef(1);
  const navigate = useNavigate();
  const { requireAuthAction } = useRequireAuthAction();
  const [pendingLikePostIds, setPendingLikePostIds] = useState<Set<string>>(new Set());
  const handleLikePost = async (event: React.MouseEvent, postId: string) => {
    event.stopPropagation();

    if (!requireAuthAction()) return;
    if (!currentUser?.id) return;
    if (pendingLikePostIds.has(postId)) return;

    const targetPost = posts.find((p) => p.id === postId);
    if (!targetPost) return;

    const isLiked = targetPost.isLikedByMe;

    setPendingLikePostIds((prev) => {
      const newSet = new Set(prev);
      newSet.add(postId);
      return newSet;
    });

    try {
      if (isLiked) {
        await likesApi.unlikePost(postId);
      } else {
        await likesApi.likePost(postId);
      }
      setPosts((prev) =>
        prev.map((post) => {
          if (post.id === postId) {
            const likeCount = post._count?.likes ?? 0;
            const nextCount = isLiked ? Math.max(0, likeCount - 1) : likeCount + 1;
            return {
              ...post,
              isLikedByMe: !isLiked,
              _count: {
                ...post._count,
                likes: nextCount,
                comments: post._count?.comments ?? 0,
              }
            };
          }
          return post;
        })
      );
    } catch (error) {
      console.error('Failed to update like status:', error);
    } finally {
      setPendingLikePostIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    }
  }

  const handleSearchSubmit = () => {
    const q = searchKeyword.trim();
    if (q.length < 2) return;
    navigate(`/search?q=${encodeURIComponent(q)}&type=posts&page=1`);
  }

  const loadPosts = useCallback(async (nextPage: number) => {
    if (loadingRef.current || !hasMoreRef.current) return;
    setLoading(true);
    loadingRef.current = true;
    try {
      const res = await postsApi.getAllPost(nextPage, 10);
      console.log('Loaded posts:', res);
      setPosts(prev => [...prev, ...res.items]);
      setHasMore(res.hasMore);
      hasMoreRef.current = res.hasMore;
      pageRef.current = nextPage;
    } catch (err: any) {
      console.error('Failed to load posts:', err);
      setError(err.message || 'Failed to load posts');
    }
    finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    loadPosts(1);
  }, [loadPosts]);

  useEffect(() => {
    const fetchSidebarData = async () => {
      setSidebarLoading(true);
      try {
        const allTagsPromise = tagsApi.getAllTags();
        const allUsersPromise = isAuthenticated ? usersApi.getAllUsers() : Promise.resolve([] as User[]);
        const [allTags, allUsers] = await Promise.all([allTagsPromise, allUsersPromise]);

        setTags(allTags.slice(0, 8));
        setSuggestedUsers(
          allUsers
            .filter((user) => user.id !== currentUser?.id)
            .slice(0, 5),
        );
      } catch {
        setTags([]);
        setSuggestedUsers([]);
      } finally {
        setSidebarLoading(false);
      }
    };

    fetchSidebarData();
  }, [currentUser?.id, isAuthenticated]);

  useEffect(() => {
    const onScroll = () => {
      if (loadingRef.current || !hasMoreRef.current) return;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const viewportHeight = window.innerHeight;
      const fullHeight = document.documentElement.scrollHeight;
      if (scrollTop + viewportHeight >= fullHeight - 320) {
        loadPosts(pageRef.current + 1);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [loadPosts]);

  useEffect(() => {
    if (loadingRef.current || !hasMoreRef.current) return;
    const viewportHeight = window.innerHeight;
    const fullHeight = document.documentElement.scrollHeight;
    // Only auto-load on initial mount or when content is too short
    if (fullHeight <= viewportHeight + 40 && pageRef.current <= 3) {
      loadPosts(pageRef.current + 1);
    }
  }, [posts.length, loadPosts]);


  const [currentDate] = useState(new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }));

  const postStreak = getCurrentStreak(posts);
  const activeDays = new Set(posts.map((post) => formatDateKey(new Date(post.createdAt)))).size;
  const activityBarHeights = buildLast7DaysHeights(posts);

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#1a1c1c]">
      {/* Top Navigation Bar */}
      <header className="fixed top-0 w-full flex justify-between items-center px-6 h-16 bg-[#f9f9f9] border-b border-neutral-200/50 z-50">
        <div className="flex items-center gap-8">
          <span className="text-2xl font-bold font-['Space_Grotesk'] text-black">DevLog</span>
          <form
            className="relative hidden md:block"
            onSubmit={(e) => {
              e.preventDefault();
              handleSearchSubmit();
            }}
          >
            <button
              type="submit"
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 icon-badge icon-badge-search"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>

            <input
              className="bg-surface-container-low border border-transparent hover:border-sky-200 focus:ring-2 focus:ring-sky-200 rounded-lg pl-10 pr-4 py-1.5 text-sm w-64 transition-all"
              placeholder="Search entries..."
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
          </form>
        </div>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <button className="p-2.5 icon-badge icon-badge-bell">
                <Bell className="h-4 w-4" />
              </button>
              <AvatarMenu size="sm" />
            </>
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
                Create Account
              </button>
            </>
          )}
        </div>
      </header>

      <div className="flex pt-16 min-h-screen">
        {/* Left Sidebar */}
        <aside className="fixed left-0 top-16 h-[calc(100vh-64px)] w-64 bg-[#f3f3f3] flex flex-col p-4 space-y-2 z-40">
          <div className="mb-8 px-4 py-2">
            <h2 className="font-['Space_Grotesk'] font-bold text-lg tracking-tight">Journal</h2>
            <p className="text-xs text-neutral-500 font-medium uppercase tracking-widest">Developer Logs</p>
          </div>

          <nav className="flex-1 space-y-1">
            <a className="bg-[#e2e2e2] text-black rounded-lg px-4 py-2 flex items-center gap-3 transition-transform translate-x-1 interactive-card" href="#">
              <Home className="h-4 w-4 text-sky-600" />
              <span className="font-['Inter'] text-sm font-medium tracking-wide">Home</span>
            </a>
            <a className="text-neutral-600 px-4 py-2 flex items-center gap-3 hover:bg-neutral-200 transition-all rounded-lg interactive-card" href="#">
              <Compass className="h-4 w-4 text-emerald-600" />
              <span className="font-['Inter'] text-sm font-medium tracking-wide">Explore</span>
            </a>
            <a className="text-neutral-600 px-4 py-2 flex items-center gap-3 hover:bg-neutral-200 transition-all rounded-lg interactive-card" href="#">
              <TagIcon className="h-4 w-4 text-orange-600" />
              <span className="font-['Inter'] text-sm font-medium tracking-wide">Tags</span>
            </a>
            <a className="text-neutral-600 px-4 py-2 flex items-center gap-3 hover:bg-neutral-200 transition-all rounded-lg interactive-card" href="#">
              <Bookmark className="h-4 w-4 text-blue-700" />
              <span className="font-['Inter'] text-sm font-medium tracking-wide">Bookmarks</span>
            </a>
          </nav>

          <button
            onClick={() => requireAuthAction(() => navigate('/posts/create'))}
            className="bg-white border border-blue-300 text-blue-700 rounded-lg py-3 px-4 flex items-center justify-center gap-2 font-medium text-sm transition-all active:scale-95 hover:bg-blue-50 mb-4 tap-feedback"
          >
            <Plus className="h-4 w-4" />
            New Post
          </button>

          <div className="border-t border-neutral-200/50 pt-4 space-y-1">
            <button
              className="w-full text-left text-neutral-600 px-4 py-2 flex items-center gap-3 hover:bg-neutral-200 transition-all rounded-lg interactive-card"
              onClick={() => requireAuthAction(() => navigate('/settings'))}
            >
              <Settings className="h-4 w-4 text-amber-600" />
              <span className="font-['Inter'] text-sm font-medium tracking-wide">Settings</span>
            </button>
            <a className="text-neutral-600 px-4 py-2 flex items-center gap-3 hover:bg-neutral-200 transition-all rounded-lg interactive-card" href="#">
              <HelpCircle className="h-4 w-4 text-violet-600" />
              <span className="font-['Inter'] text-sm font-medium tracking-wide">Help</span>
            </a>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-64 mr-72 p-8 max-w-4xl mx-auto">
          <header className="mb-12">
            <h1 className="text-4xl font-bold tracking-tight mb-2">Morning Session</h1>
            <p className="text-neutral-500 font-medium">{currentDate}</p>
          </header>

          {/* Posts Feed */}
          <div className="space-y-12">
            {loading && posts.length === 0 && (
              <div className="space-y-6 animate-pulse">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="bg-white p-8 rounded-xl border border-neutral-200/60 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-neutral-200" />
                      <div className="space-y-2 flex-1">
                        <div className="h-3 w-32 bg-neutral-200 rounded" />
                        <div className="h-3 w-24 bg-neutral-200 rounded" />
                      </div>
                    </div>
                    <div className="h-7 w-2/3 bg-neutral-200 rounded" />
                    <div className="h-4 w-full bg-neutral-200 rounded" />
                    <div className="h-4 w-5/6 bg-neutral-200 rounded" />
                    <div className="h-4 w-1/3 bg-neutral-200 rounded" />
                  </div>
                ))}
              </div>
            )}

            {posts.map((post) => {
              const tagName = post.tags?.[0]?.tag?.name ?? 'GENERAL';
              const words = (post.content || '').trim().split(/\s+/).filter(Boolean).length;
              const readTime = `${Math.max(1, Math.ceil(words / 200))}m read`;

              return (
                <article key={post.id} className="group">
                  <div className="bg-white p-8 rounded-xl transition-all duration-300 hover:bg-white border-transparent border hover:border-neutral-200/50 interactive-card">
                    {/* 1) User header */}
                    <div className="flex items-center gap-3 mb-4 cursor-pointer" onClick={() => navigate(`/profile/${post.author?.username}`)}>
                      {post.author?.avatarUrl ? (
                        <img
                          src={post.author.avatarUrl}
                          alt={post.author?.name ?? 'User'}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-semibold">
                          {(post.author?.name?.[0] ?? 'U').toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold">{post.author?.name ?? 'Unknown user'}</p>
                        <p className="text-xs text-neutral-400">
                          {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>

                    {/* Title + tag */}
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-2xl font-bold hover:underline underline-offset-4 decoration-1 cursor-pointer hover:text-blue-700 transition-colors" onClick={() => navigate(`/posts/${post.id}`)}>
                        {post.title}
                      </h2>
                      <span className="text-xs font-mono bg-neutral-200 px-2 py-1 rounded text-neutral-700">
                        {tagName}
                      </span>
                    </div>

                    <p className="text-neutral-600 leading-relaxed mb-6 line-clamp-3">
                      {post.excerpt || post.content}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs font-medium text-neutral-400">
                      <div
                        className={`flex items-center gap-1.5 transition-colors cursor-pointer like-button
                                  ${post.isLikedByMe ? 'is-liked' : 'text-neutral-400'} 
                                  ${pendingLikePostIds.has(post.id) ? 'opacity-50 cursor-not-allowed' : ''}
                                `}
                        onClick={(event) => handleLikePost(event, post.id)}
                      >
                        <Heart className={`h-[18px] w-[18px] like-icon ${post.isLikedByMe ? 'fill-current' : ''}`} />
                        {post._count?.likes ?? 0}
                      </div>
                      <div className="flex items-center gap-1.5 hover:text-blue-700 transition-colors cursor-pointer tap-feedback" onClick={() => navigate(`/posts/${post.id}`)}>
                        <MessageCircle className="h-[18px] w-[18px]" />
                        {post._count?.comments ?? 0}
                      </div>
                      <span className="ml-auto">{readTime}</span>
                    </div>

                    {/* 2) Comment preview */}
                    <div className="mt-4 border-t border-neutral-200 pt-4 space-y-3">
                      {post._count?.comments === 0 ? (
                        <p className="text-sm text-neutral-500">
                          No comments yet. Be the first to comment!
                        </p>
                      ) : (
                        post.comments &&
                        post.comments.length > 0 &&
                        post.comments.map((c) => (
                          <div
                            key={c.id}
                            className="flex items-start gap-3 rounded-xl px-3 py-2 hover:bg-neutral-50 transition-colors cursor-pointer"
                            onClick={() => navigate(`/profile/${c.author?.username}`)}
                          >
                            {c.author?.avatarUrl ? (
                              <img
                                src={c.author.avatarUrl}
                                alt={c.author?.name ?? 'User'}
                                className="h-8 w-8 shrink-0 rounded-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="h-8 w-8 shrink-0 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-semibold text-neutral-600">
                                {(c.author?.name?.[0] ?? 'U').toUpperCase()}
                              </div>
                            )}

                            <div className="min-w-0 flex-1">
                              <div className="rounded-2xl bg-neutral-100 px-3 py-2">
                                <span className="text-sm font-medium text-neutral-900">
                                  {c.author?.name ?? 'Anonymous'}
                                </span>

                                <p className="mt-1 line-clamp-2 break-words text-sm text-neutral-600">
                                  {c.content}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </article>
              );
            })}
            {loading && posts.length > 0 && (
              <div className="bg-white p-6 rounded-xl border border-neutral-200/60 animate-pulse">
                <div className="h-4 w-32 bg-neutral-200 rounded" />
              </div>
            )}
            {error && <p className="text-sm text-red-500">{error}</p>}
            {!hasMore && posts.length > 0 && (
              <p className="text-xs text-neutral-400 text-center">No more posts</p>
            )}
            {!loading && !error && posts.length === 0 && !hasMore && (
              <p className="text-sm text-neutral-500 text-center">No posts yet. Be the first to write one!</p>
            )}

            {/* Snippet Card */}
            <div className="grid grid-cols-2 gap-8">
              <div className="bg-neutral-100 p-6 rounded-lg border border-neutral-200/50">
                <h3 className="font-bold text-sm uppercase tracking-widest mb-4">Snippet of the day</h3>
                <code className="block text-xs font-mono text-black bg-white/50 p-4 rounded mb-4">
                  const curate = (log) ={'>'} {'{'}<br />
                  &nbsp;&nbsp;return log.filter(e ={'>'} e.valuable);<br />
                  {'}'}
                </code>
                <p className="text-xs text-neutral-500">Keeping only what matters in the daily log.</p>
              </div>
              <div className="flex flex-col justify-center">
                <h2 className="text-xl font-bold mb-2 italic">"Simplicity is the ultimate sophistication."</h2>
                <p className="text-sm text-neutral-400">— Leonardo da Vinci (applied to code)</p>
              </div>
            </div>
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="fixed right-0 top-16 h-[calc(100vh-64px)] w-72 bg-[#f9f9f9] flex flex-col p-6 border-l border-neutral-100 z-40 overflow-y-auto">
          {/* Streak Tracker */}
          <div className="bg-white p-6 rounded-xl mb-8 shadow-sm border border-neutral-100">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">Daily Streak</span>
              <Flame className="h-4 w-4 text-orange-500" />
            </div>
            <div className="text-3xl font-bold font-['Space_Grotesk'] mb-2">{postStreak} Days</div>
            <div className="flex gap-1.5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={`h-1.5 flex-1 rounded-full ${i < Math.min(postStreak, 5) ? 'bg-black' : 'bg-neutral-200'}`}></div>
              ))}
              {[...Array(2)].map((_, i) => (
                <div key={i + 5} className={`h-1.5 flex-1 rounded-full ${i + 5 < Math.min(postStreak, 7) ? 'bg-black' : 'bg-neutral-200'}`}></div>
              ))}
            </div>
            <p className="text-[11px] text-neutral-400 mt-3">{activeDays} active posting days in your current feed window.</p>
          </div>

          {/* Trending Tags */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              <h3 className="font-['Space_Grotesk'] text-xs uppercase tracking-widest font-bold">Trending Tags</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {sidebarLoading && Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="h-7 w-20 rounded-full bg-neutral-200 animate-pulse" />
              ))}
              {!sidebarLoading && tags.map((tag) => (
                <span
                  key={tag.id}
                  className="text-[11px] font-mono bg-neutral-200 px-3 py-1.5 rounded-full"
                >
                  #{tag.name}
                </span>
              ))}
              {!sidebarLoading && tags.length === 0 && (
                <span className="text-[11px] text-neutral-500">No tags yet</span>
              )}
            </div>
          </div>

          {/* Suggested Users */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-4 w-4 text-blue-600" />
              <h3 className="font-['Space_Grotesk'] text-xs uppercase tracking-widest font-bold">Suggested Users</h3>
            </div>
            <div className="space-y-4">
              {sidebarLoading && Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="flex items-center gap-3 animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-neutral-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-24 bg-neutral-200 rounded" />
                    <div className="h-3 w-16 bg-neutral-200 rounded" />
                  </div>
                </div>
              ))}
              {!sidebarLoading && suggestedUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-3 group cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/profile/${user.username}`)
                  }}
                >
                  {user.avatarUrl ? (
                    <img className="w-8 h-8 rounded-full object-cover" src={user.avatarUrl} alt={user.name ?? user.username} />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center text-[10px] font-bold text-neutral-600">
                      {(user.name?.[0] ?? user.username[0] ?? 'U').toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-xs font-bold group-hover:underline">{user.name ?? user.username}</p>
                    <p className="text-[10px] text-neutral-400">@{user.username}</p>
                  </div>
                  <button
                    className="text-[10px] font-bold border border-neutral-200 px-2 py-1 rounded hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all tap-feedback"
                    onClick={() => navigate(`/profile/${user.username}`)}
                  >
                    VIEW
                  </button>
                </div>
              ))}
              {!sidebarLoading && suggestedUsers.length === 0 && (
                <p className="text-[11px] text-neutral-500">No suggestions right now.</p>
              )}
            </div>
          </div>

          {/* Activity Stats */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-4 w-4 text-violet-600" />
              <h3 className="font-['Space_Grotesk'] text-xs uppercase tracking-widest font-bold">Activity Stats</h3>
            </div>
            <div className="p-4 bg-neutral-100 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] text-neutral-500 font-medium">Log Volume</span>
                <span className="text-[11px] font-bold text-green-600">{posts.length} posts loaded</span>
              </div>
              <div className="flex items-end gap-1 h-12">
                {activityBarHeights.map((height, i) => (
                  <div
                    key={i}
                    className={`w-full rounded-t-sm ${i === 4 ? 'bg-black' : 'bg-neutral-300'}`}
                    style={{ height: `${height}px` }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

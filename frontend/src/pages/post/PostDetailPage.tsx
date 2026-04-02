import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { postsApi } from '@services/posts.service';
import apiClient from '@services/api';
import { AvatarMenu } from '@components/AvatarMenu';
import { useRequireAuthAction } from '@hooks/useRequireAuthAction';
import type { Post } from '@/types/post';
import type { Comment } from '@/types/comment';
import type { ApiResponse } from '@/types/api';
import { selectIsAuthenticated } from '@/features/auth/auth.slice';
import { useAppSelector } from '@app/hooks';
import { ArrowUp, Bell, Bookmark, Heart, MessageCircle, Search, Share2 } from 'lucide-react';
function formatDate(dateInput?: string | null) {
  if (!dateInput) return 'Unknown date';
  return new Date(dateInput).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getReadTime(content?: string) {
  if (!content) return '1 min read';
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 200))} min read`;
}

export function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { requireAuthAction } = useRequireAuthAction();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readingProgress, setReadingProgress] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [postingComment, setPostingComment] = useState(false);

  useEffect(() => {
    if (!id) {
      setError('Missing post id');
      setLoading(false);
      return;
    }

    let active = true;

    const fetchPostDetail = async () => {
      try {
        setLoading(true);
        const [postRes, commentsRes] = await Promise.all([
          postsApi.getPostById(id),
          apiClient.get<ApiResponse<Comment[]>>(`/posts/${id}/comments`),
        ]);

        if (!active) return;

        setPost(postRes.data);
        setComments(commentsRes.data.data ?? []);
        setError(null);
      } catch (err: any) {
        if (!active) return;
        const msg = err?.response?.data?.message;
        setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Failed to load post');
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchPostDetail();
    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const pct = max <= 0 ? 0 : Math.min(100, Math.round((doc.scrollTop / max) * 100));
      setReadingProgress(pct);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const topLevelComments = useMemo(
    () => comments.filter((comment) => !comment.parentId),
    [comments],
  );

  const handlePostComment = async () => {
    if (!id || !newComment.trim()) return;
    if (!requireAuthAction()) return;

    try {
      setPostingComment(true);
      setError(null);

      await apiClient.post<ApiResponse<Comment>>(`/posts/${id}/comments`, {
        content: newComment.trim(),
      });

      const commentsRes = await apiClient.get<ApiResponse<Comment[]>>(`/posts/${id}/comments`);
      setComments(commentsRes.data.data ?? []);
      setNewComment('');

      setPost((prev) =>
        prev
          ? {
              ...prev,
              _count: {
                likes: prev._count?.likes ?? 0,
                comments: (prev._count?.comments ?? 0) + 1,
              },
            }
          : prev,
      );
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Failed to post comment');
    } finally {
      setPostingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] text-[#1a1c1c] p-8 animate-pulse">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="h-5 w-40 bg-neutral-200 rounded" />
          <div className="h-12 w-4/5 bg-neutral-200 rounded" />
          <div className="h-4 w-60 bg-neutral-200 rounded" />
          <div className="space-y-3">
            <div className="h-4 w-full bg-neutral-200 rounded" />
            <div className="h-4 w-full bg-neutral-200 rounded" />
            <div className="h-4 w-5/6 bg-neutral-200 rounded" />
          </div>
          <div className="h-32 bg-neutral-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] text-[#1a1c1c] flex flex-col items-center justify-center gap-4">
        <p className="text-sm text-red-500">{error || 'Post not found'}</p>
        <button
          className="px-4 py-2 text-sm font-medium bg-black text-white rounded-lg"
          onClick={() => navigate('/home')}
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#f9f9f9] text-[#1a1c1c] font-body min-h-screen">
      <div className="h-[3px] w-full fixed top-0 left-0 z-[100] bg-[#f3f3f3]">
        <div className="h-full bg-black transition-all duration-200" style={{ width: `${readingProgress}%` }} />
      </div>

      <header className="w-full sticky top-0 z-50 bg-[#f9f9f9] border-b border-neutral-200/50">
        <nav className="flex justify-between items-center w-full px-6 md:px-8 py-4 max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-8">
            <button
              className="text-2xl font-bold text-black tracking-tighter font-['Space_Grotesk']"
              onClick={() => navigate('/home')}
            >
              DevLog
            </button>
            <div className="hidden md:flex gap-6 items-center">
              <button className="text-black border-b-2 border-black pb-1 font-['Space_Grotesk'] font-bold tracking-tight">
                Journal
              </button>
              <button className="text-neutral-500 hover:text-black transition-colors font-['Space_Grotesk'] font-bold tracking-tight">
                Archive
              </button>
              <button className="text-neutral-500 hover:text-black transition-colors font-['Space_Grotesk'] font-bold tracking-tight">
                Insights
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <button className="p-2 hover:bg-sky-100 hover:text-sky-700 rounded-md transition-all duration-150 tap-feedback">
              <Search className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <button className="p-2.5 rounded-full bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors tap-feedback">
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
          </div>
        </nav>
      </header>

      <main className="max-w-screen-2xl mx-auto px-6 md:px-8 py-10 md:py-12">
        <div className="grid grid-cols-12 gap-10 relative">
          <aside className="hidden lg:block col-span-1">
            <div className="sticky top-28 flex flex-col items-center gap-8">
              <div className="relative flex items-center justify-center">
                <svg className="w-12 h-12 transform -rotate-90">
                  <circle cx="24" cy="24" r="20" fill="transparent" strokeWidth="2" className="text-[#e2e2e2]" stroke="currentColor" />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    fill="transparent"
                    strokeWidth="2"
                    className="text-black"
                    stroke="currentColor"
                    strokeDasharray="125.6"
                    strokeDashoffset={125.6 - (125.6 * readingProgress) / 100}
                  />
                </svg>
                <span className="absolute text-[10px] font-bold">{readingProgress}%</span>
              </div>

              <div className="bg-white/70 backdrop-blur-xl border border-neutral-200/40 flex flex-col gap-6 p-3 rounded-full shadow-sm">
                <button className="flex flex-col items-center gap-1 group" onClick={() => requireAuthAction()}>
                  <Heart className="h-4 w-4 text-neutral-600 group-hover:text-rose-600 transition-colors" />
                  <span className="text-[10px] font-bold text-neutral-600">{post._count?.likes ?? 0}</span>
                </button>
                <button className="flex flex-col items-center gap-1 group">
                  <MessageCircle className="h-4 w-4 text-neutral-600 group-hover:text-blue-600 transition-colors" />
                  <span className="text-[10px] font-bold text-neutral-600">{post._count?.comments ?? 0}</span>
                </button>
                <button className="flex flex-col items-center gap-1 group" onClick={() => requireAuthAction()}>
                  <Bookmark className="h-4 w-4 text-neutral-600 group-hover:text-violet-600 transition-colors" />
                </button>
                <button className="flex flex-col items-center gap-1 group">
                  <Share2 className="h-4 w-4 text-neutral-600 group-hover:text-emerald-600 transition-colors" />
                </button>
              </div>
            </div>
          </aside>

          <article className="col-span-12 lg:col-span-7 xl:col-span-8 w-full max-w-none mx-auto">
            <header className="mb-12" id="top">
              <div className="flex flex-wrap gap-2 mb-6">
                {(post.tags ?? []).map((tagItem, idx) => (
                  <span
                    key={`${post.id}-${idx}-${tagItem.tag?.name ?? 'tag'}`}
                    className="px-3 py-1 bg-neutral-200 text-neutral-700 rounded-full text-[10px] font-bold uppercase tracking-wider"
                  >
                    {tagItem.tag?.name ?? 'Tag'}
                  </span>
                ))}
                {(!post.tags || post.tags.length === 0) && (
                  <span className="px-3 py-1 bg-neutral-200 text-neutral-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    General
                  </span>
                )}
              </div>

              <h1 className="text-4xl md:text-6xl font-['Space_Grotesk'] font-bold leading-tight tracking-tighter mb-8 text-black">
                {post.title}
              </h1>

              <div className="flex items-center justify-between border-y border-neutral-200 py-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-neutral-200">
                    {post.author?.avatarUrl ? (
                      <img
                        className="w-full h-full object-cover"
                        src={post.author.avatarUrl}
                        alt={post.author.name ?? 'Author'}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm font-bold text-neutral-600">
                        {(post.author?.name?.[0] ?? 'A').toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">{post.author?.name ?? 'Unknown author'}</span>
                      <button
                        className="text-[11px] font-bold text-black px-2 py-0.5 border border-black rounded-md hover:bg-black hover:text-white transition-all"
                        onClick={() => requireAuthAction()}
                      >
                        Follow
                      </button>
                    </div>
                    <div className="text-xs text-neutral-500 mt-1">
                      {formatDate(post.publishedAt || post.createdAt)} • {getReadTime(post.content)}
                    </div>
                  </div>
                </div>
              </div>
            </header>

            <div className="space-y-8 text-lg leading-relaxed text-neutral-700 font-body" id="content">
              {(post.content || '')
                .split('\n')
                .map((paragraph) => paragraph.trim())
                .filter(Boolean)
                .map((paragraph, idx) => (
                  <p key={`${post.id}-p-${idx}`}>{paragraph}</p>
                ))}
              {!post.content?.trim() && <p>No content yet.</p>}
            </div>

            <section className="mt-24 pt-12 border-t border-neutral-200" id="comments">
              <h3 className="text-2xl font-['Space_Grotesk'] font-bold mb-8">
                Discussions ({post._count?.comments ?? topLevelComments.length})
              </h3>

              <div className="bg-[#f3f3f3] rounded-xl p-4 mb-12">
                <textarea
                  className="w-full bg-transparent border-none focus:ring-0 text-sm resize-none placeholder:text-neutral-400"
                  placeholder="Add to the journal..."
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-neutral-200">
                  <div className="flex gap-2">
                    <button className="p-1.5 hover:bg-neutral-200 rounded-md transition-colors">
                      <span className="material-symbols-outlined text-[20px]">image</span>
                    </button>
                    <button className="p-1.5 hover:bg-neutral-200 rounded-md transition-colors">
                      <span className="material-symbols-outlined text-[20px]">code</span>
                    </button>
                  </div>
                  <button
                    className="bg-black text-white px-4 py-1.5 rounded-md text-xs font-bold hover:opacity-90 transition-all disabled:opacity-50"
                    disabled={!newComment.trim() || postingComment}
                    onClick={handlePostComment}
                  >
                    {postingComment ? 'Posting...' : 'Post Comment'}
                  </button>
                </div>
              </div>

              <div className="space-y-10">
                {topLevelComments.map((comment) => (
                  <div key={comment.id} className="flex gap-4">
                    {comment.author?.avatarUrl ? (
                      <img
                        className="w-10 h-10 rounded-full object-cover"
                        src={comment.author.avatarUrl}
                        alt={comment.author.name ?? 'User'}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-semibold text-neutral-600">
                        {(comment.author?.name?.[0] ?? 'U').toUpperCase()}
                      </div>
                    )}

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm">{comment.author?.name ?? 'Anonymous'}</span>
                        <span className="text-[10px] text-neutral-500">{formatDate(comment.createdAt)}</span>
                      </div>
                      <p className="text-sm text-neutral-600 leading-relaxed">{comment.content}</p>
                      <div className="flex gap-4 mt-3">
                        <button
                          className="text-[10px] font-bold text-neutral-500 hover:text-black uppercase tracking-tighter"
                          onClick={() => requireAuthAction()}
                        >
                          Reply
                        </button>
                        <button
                          className="text-[10px] font-bold text-neutral-500 hover:text-black uppercase tracking-tighter"
                          onClick={() => requireAuthAction()}
                        >
                          Like
                        </button>
                      </div>

                      {(comment.replies ?? []).map((reply) => (
                        <div key={reply.id} className="mt-6 pl-6 border-l border-neutral-300 flex gap-4">
                          {reply.author?.avatarUrl ? (
                            <img
                              className="w-8 h-8 rounded-full object-cover"
                              src={reply.author.avatarUrl}
                              alt={reply.author.name ?? 'User'}
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center text-[10px] font-semibold text-neutral-600">
                              {(reply.author?.name?.[0] ?? 'U').toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-xs">{reply.author?.name ?? 'Anonymous'}</span>
                              <span className="text-[10px] text-neutral-500">{formatDate(reply.createdAt)}</span>
                            </div>
                            <p className="text-xs text-neutral-600 leading-relaxed">{reply.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {topLevelComments.length === 0 && (
                  <p className="text-sm text-neutral-500">No comments yet. Start the discussion.</p>
                )}
              </div>
            </section>
          </article>

          <aside className="hidden lg:block col-span-12 lg:col-span-4 xl:col-span-3">
            <div className="sticky top-28 space-y-12">
              <div className="bg-[#f3f3f3] p-6 rounded-2xl">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-4">The Author</h4>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-neutral-200">
                    {post.author?.avatarUrl ? (
                      <img
                        className="w-full h-full object-cover"
                        src={post.author.avatarUrl}
                        alt={post.author.name ?? 'Author'}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm font-bold text-neutral-600">
                        {(post.author?.name?.[0] ?? 'A').toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-base">{post.author?.name ?? 'Unknown author'}</div>
                    <div className="text-xs text-neutral-500">Software Engineer</div>
                  </div>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed mb-6">
                  Writing about architecture, system performance, and the craft of building reliable products.
                </p>
                <button
                  className="w-full bg-white border border-neutral-300 py-2 rounded-lg text-xs font-bold hover:bg-black hover:text-white transition-all"
                  onClick={() => navigate('/profile/' + (post.author?.username ?? ''))}
                >
                  View Profile
                </button>
              </div>

              <nav>
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-6">On This Page</h4>
                <ul className="space-y-4 border-l border-neutral-200">
                  <li className="pl-4 border-l-2 border-black -ml-px">
                    <a className="text-sm font-bold text-black" href="#top">
                      Post Header
                    </a>
                  </li>
                  <li className="pl-4 hover:border-l-2 hover:border-neutral-300 -ml-px transition-all">
                    <a className="text-sm text-neutral-500 hover:text-black transition-colors" href="#content">
                      Content
                    </a>
                  </li>
                  <li className="pl-4 hover:border-l-2 hover:border-neutral-300 -ml-px transition-all">
                    <a className="text-sm text-neutral-500 hover:text-black transition-colors" href="#comments">
                      Comments
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </aside>
        </div>
      </main>

      <footer className="w-full border-t border-neutral-200 bg-[#f9f9f9]">
        <div className="flex flex-col md:flex-row justify-between items-center w-full px-8 py-12 max-w-screen-2xl mx-auto gap-4">
          <div className="text-neutral-700 text-sm tracking-wide opacity-80">
            © 2026 DevLog. All rights reserved.
          </div>
          <div className="flex gap-8">
            <button className="text-neutral-500 hover:underline underline-offset-4 text-sm tracking-wide hover:text-black transition-all">
              Documentation
            </button>
            <button className="text-neutral-500 hover:underline underline-offset-4 text-sm tracking-wide hover:text-black transition-all">
              Privacy
            </button>
            <button className="text-neutral-500 hover:underline underline-offset-4 text-sm tracking-wide hover:text-black transition-all">
              Terms
            </button>
            <button className="text-neutral-500 hover:underline underline-offset-4 text-sm tracking-wide hover:text-black transition-all">
              Support
            </button>
          </div>
        </div>
      </footer>

      <button
        className="fixed bottom-8 right-8 w-12 h-12 bg-gradient-to-r from-blue-600 to-emerald-500 text-white rounded-full flex items-center justify-center shadow-xl hover:-translate-y-1 transition-all z-40 tap-feedback"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <ArrowUp className="h-5 w-5" />
      </button>
    </div>
  );
}

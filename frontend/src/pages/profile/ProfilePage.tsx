import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppSelector } from '@app/hooks';
import { selectCurrentUser } from '@features/auth/auth.slice';
import { AvatarMenu } from '@components/AvatarMenu';
import { usersApi, type UserProfile } from '@services/users.service';
import { followsApi } from '@services/follows.service';
import type { Follow } from '@/types/follow';
import { useRequireAuthAction } from '@hooks/useRequireAuthAction';
import axios from 'axios';
import { getPostPreviewText } from '@/utils/preview-text';
import {
  BarChart3,
  Bell,
  Bookmark,
  CalendarDays,
  Heart,
  Home,
  Loader2,
  Mail,
  MessageCircle,
  Plus,
  Search,
  Settings,
  Share2,
  TrendingUp,
  User,
  UserMinus,
  UserPlus,
  Users,
  X,
} from 'lucide-react';

const intensityClasses = ['bg-[#ececec]', 'bg-[#d7d7d7]', 'bg-[#a9a9a9]', 'bg-black'];
const HEATMAP_CELLS = 52 * 7;
type NetworkTab = 'followers' | 'following';

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (Array.isArray(message)) {
      return message.join(', ');
    }
    if (typeof message === 'string') {
      return message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong';
}

function formatJoinedDate(dateString?: string) {
  if (!dateString) return 'Unknown';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

function buildHeatmapLevels(posts: UserProfile['posts']) {
  const byDay = new Map<string, number>();

  for (const post of posts) {
    const day = new Date(post.createdAt).toISOString().slice(0, 10);
    byDay.set(day, (byDay.get(day) ?? 0) + 1);
  }

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - HEATMAP_CELLS + 1);

  return Array.from({ length: HEATMAP_CELLS }).map((_, idx) => {
    const day = new Date(startDate);
    day.setDate(startDate.getDate() + idx);
    const key = day.toISOString().slice(0, 10);
    const count = byDay.get(key) ?? 0;

    if (count === 0) return 0;
    if (count === 1) return 1;
    if (count <= 3) return 2;
    return 3;
  });
}

export function ProfilePage() {
  const navigate = useNavigate();
  const { username } = useParams<{ username: string }>();
  const currentUser = useAppSelector(selectCurrentUser);
  const { isAuthenticated, requireAuthAction } = useRequireAuthAction();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileImageError, setProfileImageError] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowActionLoading, setIsFollowActionLoading] = useState(false);
  const [followActionError, setFollowActionError] = useState<string | null>(null);
  const [isNetworkModalOpen, setIsNetworkModalOpen] = useState(false);
  const [networkTab, setNetworkTab] = useState<NetworkTab>('followers');
  const [networkLoading, setNetworkLoading] = useState(false);
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [followers, setFollowers] = useState<Follow[]>([]);
  const [following, setFollowing] = useState<Follow[]>([]);

  const isMeRoute = !username;
  const isOwnProfile = !!currentUser && !!profile && currentUser.id === profile.id;

  const selectedNetworkItems = networkTab === 'followers' ? followers : following;

  const loadNetworkData = useCallback(async (targetUserId: string) => {
    setNetworkLoading(true);
    setNetworkError(null);

    try {
      const [followersData, followingData] = await Promise.all([
        followsApi.getUserFollowers(targetUserId),
        followsApi.getUserFollowing(targetUserId),
      ]);

      setFollowers(followersData);
      setFollowing(followingData);
    } catch (err) {
      setNetworkError(getErrorMessage(err));
    } finally {
      setNetworkLoading(false);
    }
  }, []);

  const openNetworkModal = async (tab: NetworkTab) => {
    if (!profile) return;

    setNetworkTab(tab);
    setIsNetworkModalOpen(true);
    await loadNetworkData(profile.id);
  };

  const closeNetworkModal = () => {
    setIsNetworkModalOpen(false);
    setNetworkError(null);
  };

  const handleToggleFollow = async () => {
    if (!profile || isOwnProfile || isFollowActionLoading) return;

    const canProceed = requireAuthAction();
    if (!canProceed) return;

    setFollowActionError(null);
    setIsFollowActionLoading(true);

    try {
      if (isFollowing) {
        await followsApi.unfollowUser(profile.id);
        setIsFollowing(false);
        setProfile((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            _count: {
              ...prev._count,
              followers: Math.max(0, prev._count.followers - 1),
            },
          };
        });
      } else {
        await followsApi.followUser(profile.id);
        setIsFollowing(true);
        setProfile((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            _count: {
              ...prev._count,
              followers: prev._count.followers + 1,
            },
          };
        });
      }

      if (isNetworkModalOpen) {
        await loadNetworkData(profile.id);
      }
    } catch (err) {
      setFollowActionError(getErrorMessage(err));
    } finally {
      setIsFollowActionLoading(false);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      setFollowActionError(null);
      setIsFollowing(false);
      setIsNetworkModalOpen(false);
      setFollowers([]);
      setFollowing([]);
      setNetworkError(null);

      try {
        const data = isMeRoute
          ? await usersApi.getMyProfile()
          : await usersApi.getProfileByUsername(username || '');

        setProfile(data);
        setProfileImageError(false);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isMeRoute, username]);

  useEffect(() => {
    let active = true;

    const syncFollowState = async () => {
      if (!isAuthenticated || !currentUser?.id || !profile || currentUser.id === profile.id) {
        setIsFollowing(false);
        return;
      }

      try {
        const myFollowing = await followsApi.getMyFollowing();
        if (!active) return;

        setIsFollowing(myFollowing.some((entry) => entry.followingId === profile.id && entry.active));
      } catch {
        if (!active) return;
        setIsFollowing(false);
      }
    };

    syncFollowState();

    return () => {
      active = false;
    };
  }, [currentUser?.id, isAuthenticated, profile?.id]);

  const displayName = profile?.name || profile?.username || 'Developer';
  const initials = (displayName[0] || 'U').toUpperCase();
  const profileAvatar = profile?.avatarUrl || '';

  const heatmapLevels = useMemo(() => buildHeatmapLevels(profile?.posts ?? []), [profile?.posts]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] text-[#1a1c1c] p-8 animate-pulse">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="h-10 w-40 bg-neutral-200 rounded" />
          <div className="flex gap-6 items-start">
            <div className="w-28 h-28 rounded-xl bg-neutral-200" />
            <div className="flex-1 space-y-3">
              <div className="h-8 w-64 bg-neutral-200 rounded" />
              <div className="h-4 w-40 bg-neutral-200 rounded" />
              <div className="h-4 w-56 bg-neutral-200 rounded" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="h-24 bg-neutral-200 rounded-xl" />
            <div className="h-24 bg-neutral-200 rounded-xl" />
            <div className="h-24 bg-neutral-200 rounded-xl" />
          </div>
          <div className="space-y-4">
            <div className="h-5 w-36 bg-neutral-200 rounded" />
            <div className="h-28 bg-neutral-200 rounded-xl" />
            <div className="h-28 bg-neutral-200 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] text-[#1a1c1c] flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-sm text-red-600 font-medium">{error ?? 'Profile not found'}</p>
          <button
            className="mt-4 px-4 py-2 rounded-md bg-black text-white text-sm"
            onClick={() => navigate('/home')}
          >
            Back to home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f9f9f9] text-[#1a1c1c] min-h-screen font-body">
      <nav className="fixed top-0 w-full flex justify-between items-center px-6 h-16 bg-[#f9f9f9] border-b border-neutral-200/60 z-50">
        <div className="flex items-center gap-8">
          <button
            className="text-2xl font-bold font-['Space_Grotesk'] text-black tap-feedback"
            onClick={() => navigate('/home')}
          >
            DevLog
          </button>
          <div className="hidden md:flex items-center gap-6">
            <button
              className="text-neutral-500 font-medium hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150 px-3 py-1 rounded tap-feedback"
              onClick={() => navigate('/home')}
            >
              Home
            </button>
            <button className="text-black font-bold border-b-2 border-black px-3 py-1">
              Profile
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sky-600" />
            <input
              className="bg-[#f1f1f1] border border-transparent focus:ring-2 focus:ring-sky-200 hover:border-sky-200 rounded-full pl-10 pr-4 py-1.5 text-sm w-56 transition-all"
              placeholder="Search logs..."
              type="text"
            />
          </div>
          {isAuthenticated ? (
            <>
              <button className="p-2.5 rounded-full bg-amber-50 text-amber-600 hover:bg-amber-100 transition-all tap-feedback">
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
                Register
              </button>
            </>
          )}
        </div>
      </nav>

      <aside className="fixed left-0 top-16 h-[calc(100vh-64px)] flex flex-col p-4 space-y-2 bg-[#f3f3f3] w-64 hidden lg:flex">
        <div className="px-4 py-6 mb-4">
          <h2 className="font-['Space_Grotesk'] font-bold text-lg text-neutral-900">Journal</h2>
          <p className="text-xs text-neutral-500 uppercase tracking-widest mt-1">Developer Logs</p>
        </div>
        <button
          className="text-neutral-600 px-4 py-2 flex items-center gap-3 hover:bg-neutral-200 transition-all duration-150 rounded-lg interactive-card"
          onClick={() => navigate('/home')}
        >
          <Home className="h-4 w-4 text-sky-600" />
          <span className="font-['Inter'] text-sm font-medium tracking-wide">Home</span>
        </button>
        <button className="text-black bg-[#e2e2e2] px-4 py-2 flex items-center gap-3 rounded-lg">
          <User className="h-4 w-4 text-violet-600" />
          <span className="font-['Inter'] text-sm font-semibold tracking-wide">Profile</span>
        </button>
        <button
          className="text-neutral-600 px-4 py-2 flex items-center gap-3 hover:bg-neutral-200 transition-all duration-150 rounded-lg interactive-card"
          onClick={() => requireAuthAction(() => navigate('/bookmarks'))}
        >
          <Bookmark className="h-4 w-4 text-blue-700" />
          <span className="font-['Inter'] text-sm font-medium tracking-wide">Bookmarks</span>
        </button>

        <div className="mt-auto border-t border-neutral-200/40 pt-4">
          <button
            className="w-full bg-white border border-blue-300 text-blue-700 py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:bg-blue-50 transition-all mb-4 tap-feedback"
            onClick={() => navigate('/posts/create')}
          >
            <Plus className="h-4 w-4" />
            Create Post
          </button>
          <button
            className="w-full text-left text-neutral-600 px-4 py-2 flex items-center gap-3 hover:bg-neutral-200 transition-all duration-150 rounded-lg interactive-card"
            onClick={() => requireAuthAction(() => navigate('/settings'))}
          >
            <Settings className="h-4 w-4 text-amber-600" />
            <span className="font-['Inter'] text-sm font-medium tracking-wide">Settings</span>
          </button>
        </div>
      </aside>

      <main className="lg:ml-64 mr-0 xl:mr-72 mt-16 p-6 md:p-8 min-h-screen">
        <div className="max-w-4xl mx-auto space-y-10">
          <section className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-32 h-32 rounded-xl overflow-hidden bg-neutral-200 flex-shrink-0">
              {profileAvatar && !profileImageError ? (
                <img
                  src={profileAvatar}
                  alt={displayName}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={() => setProfileImageError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-neutral-600">
                  {initials}
                </div>
              )}
            </div>

            <div className="flex-grow space-y-4">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h1 className="text-4xl font-['Space_Grotesk'] font-bold tracking-tight">{displayName}</h1>
                  <p className="text-neutral-500 font-medium">@{profile.username}</p>
                </div>
                {isOwnProfile ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-full bg-black text-white text-xs font-semibold uppercase tracking-wider">
                      Your profile
                    </span>
                    <button
                      className="px-3 py-1 rounded-full border border-neutral-300 text-xs font-semibold uppercase tracking-wider hover:bg-neutral-100"
                      onClick={() => navigate('/settings')}
                    >
                      Edit in settings
                    </button>
                  </div>
                ) : (
                  <button
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-300 text-sm font-semibold hover:bg-neutral-100 disabled:opacity-70 disabled:cursor-not-allowed"
                    onClick={handleToggleFollow}
                    disabled={isFollowActionLoading}
                  >
                    {isFollowActionLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : isFollowing ? (
                      <>
                        <UserMinus className="h-4 w-4" />
                        Unfollow
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4" />
                        Follow
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-4 text-sm font-medium">
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4 text-sky-600" />
                  Joined {formatJoinedDate(profile.createdAt)}
                </span>
                {isOwnProfile && profile.credentials?.[0]?.email && (
                  <span className="flex items-center gap-1.5 text-neutral-600">
                    <Mail className="h-4 w-4 text-emerald-600" />
                    {profile.credentials[0].email}
                  </span>
                )}
              </div>

              {followActionError && (
                <p className="text-xs text-red-600 font-medium">{followActionError}</p>
              )}

            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-1 bg-neutral-100 rounded-xl overflow-hidden p-1">
            <div className="bg-white p-6 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-['Space_Grotesk'] font-bold">{profile._count.posts}</span>
              <span className="text-xs uppercase tracking-widest text-neutral-500 mt-1">Total Posts</span>
            </div>
            <button
              className="bg-white p-6 flex flex-col items-center justify-center text-center hover:bg-neutral-50 transition-colors"
              onClick={() => {
                void openNetworkModal('followers');
              }}
            >
              <span className="text-3xl font-['Space_Grotesk'] font-bold">{profile._count.following}</span>
              <span className="text-xs uppercase tracking-widest text-neutral-500 mt-1">Followers</span>
            </button>
            <button
              className="bg-white p-6 flex flex-col items-center justify-center text-center hover:bg-neutral-50 transition-colors"
              onClick={() => {
                void openNetworkModal('following');
              }}
            >
              <span className="text-3xl font-['Space_Grotesk'] font-bold">{profile._count.followers}</span>
              <span className="text-xs uppercase tracking-widest text-neutral-500 mt-1">Following</span>
            </button>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-['Space_Grotesk'] font-bold text-lg tracking-tight">Journal Contributions</h3>
              <span className="text-xs text-neutral-500 font-medium">Last 364 days</span>
            </div>
            <div className="bg-white p-6 rounded-xl border border-neutral-200/80">
              <div className="heatmap-grid mb-4">
                {heatmapLevels.map((level, idx) => (
                  <div key={idx} className={`heatmap-cell ${intensityClasses[level]}`} />
                ))}
              </div>
              <div className="flex items-center justify-between text-[10px] text-neutral-500 font-medium">
                <span>Less</span>
                <div className="flex gap-1 items-center">
                  {intensityClasses.map((cls, idx) => (
                    <div key={idx} className={`w-2.5 h-2.5 ${cls}`} />
                  ))}
                </div>
                <span>More</span>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="font-['Space_Grotesk'] font-bold text-2xl tracking-tight">Recent Logs</h3>
            <div className="space-y-4">
              {profile.posts.map((item) => (
                <div
                  key={item.id}
                  className="group p-6 bg-white rounded-xl border border-transparent hover:border-neutral-300/60 transition-all interactive-card"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-2">
                      {item.tags.map((entry) => (
                        <span
                          key={`${item.id}-${entry.tag.name}`}
                          className="bg-neutral-200 text-neutral-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                        >
                          {entry.tag.name}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-neutral-500 font-medium italic">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h4
                    className="text-xl font-['Space_Grotesk'] font-bold group-hover:text-neutral-700 transition-colors cursor-pointer"
                    onClick={() => navigate(`/posts/${item.slug}`)}
                  >
                    {item.title}
                  </h4>
                  <p className="mt-2 text-neutral-600 line-clamp-2 leading-relaxed">
                    {getPostPreviewText(item.excerpt, item.content, { fallback: 'No excerpt' })}
                  </p>
                  <div className="mt-4 flex items-center gap-6 text-xs font-medium text-neutral-500">
                    <span className="flex items-center gap-1.5">
                      <Heart className="h-4 w-4 text-rose-500" /> {item._count.likes}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MessageCircle className="h-4 w-4 text-blue-600" /> {item._count.comments}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Share2 className="h-4 w-4 text-emerald-600" />
                    </span>
                  </div>
                </div>
              ))}

              {profile.posts.length === 0 && (
                <div className="p-6 bg-white rounded-xl border border-neutral-200 text-sm text-neutral-500">
                  No posts yet.
                </div>
              )}
            </div>

            <button className="w-full py-4 text-xs font-bold uppercase tracking-[0.2em] text-neutral-500 hover:text-black transition-colors border-t border-neutral-200 mt-4">
              View All Archive
            </button>
          </section>
        </div>
      </main>

      <aside className="fixed right-0 top-16 h-[calc(100vh-64px)] flex flex-col p-6 border-l border-neutral-100 bg-[#f9f9f9] w-72 hidden xl:flex">
        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="font-['Space_Grotesk'] text-xs uppercase tracking-widest text-neutral-500 font-semibold">
              Insights
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 group opacity-90 hover:opacity-100 transition-all cursor-pointer">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                <div>
                  <p className="text-xs font-semibold text-black">Published Posts</p>
                  <p className="text-[10px] text-neutral-500">{profile._count.posts} published entries</p>
                </div>
              </div>
              <div className="flex items-center gap-4 group opacity-90 hover:opacity-100 transition-all cursor-pointer">
                <Users className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-xs font-semibold text-black">Network</p>
                  <p className="text-[10px] text-neutral-500">{profile._count.followers} followers • {profile._count.following} following</p>
                </div>
              </div>
              <div className="flex items-center gap-4 group opacity-90 hover:opacity-100 transition-all cursor-pointer">
                <BarChart3 className="h-4 w-4 text-violet-600" />
                <div>
                  <p className="text-xs font-semibold text-black">Comments</p>
                  <p className="text-[10px] text-neutral-500">{profile._count.comments} comments in total</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-8 border-t border-neutral-200">
            <h3 className="font-['Space_Grotesk'] text-xs uppercase tracking-widest text-neutral-500 font-semibold">
              Profile URL
            </h3>
            <button
              onClick={() => navigate(`/profile/${profile.username}`)}
              className="text-left text-xs text-neutral-700 underline underline-offset-4"
            >
              /profile/{profile.username}
            </button>
          </div>
        </div>
      </aside>

      {isNetworkModalOpen && (
        <div className="fixed inset-0 z-[60] bg-black/40 p-4 flex items-center justify-center">
          <div className="w-full max-w-xl bg-white rounded-2xl border border-neutral-200 shadow-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-bold tracking-wide">{displayName}'s Network</h3>
              </div>
              <button
                className="p-2 rounded-full hover:bg-neutral-100"
                onClick={closeNetworkModal}
                aria-label="Close network modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-5 pt-4">
              <div className="inline-flex bg-neutral-100 rounded-lg p-1 gap-1">
                <button
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    networkTab === 'followers'
                      ? 'bg-white text-black shadow-sm'
                      : 'text-neutral-500 hover:text-black'
                  }`}
                  onClick={() => setNetworkTab('followers')}
                >
                  Followers ({profile._count.following})
                </button>
                <button
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    networkTab === 'following'
                      ? 'bg-white text-black shadow-sm'
                      : 'text-neutral-500 hover:text-black'
                  }`}
                  onClick={() => setNetworkTab('following')}
                >
                  Following ({profile._count.followers})
                </button>
              </div>
            </div>

            <div className="px-5 py-4 max-h-[60vh] overflow-y-auto">
              {networkLoading && (
                <div className="py-12 text-sm text-neutral-500 flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading network...
                </div>
              )}

              {!networkLoading && networkError && (
                <div className="py-6 text-sm text-red-600 font-medium">{networkError}</div>
              )}

              {!networkLoading && !networkError && selectedNetworkItems.length === 0 && (
                <div className="py-10 text-sm text-neutral-500">
                  No users in this list yet.
                </div>
              )}

              {!networkLoading && !networkError && selectedNetworkItems.length > 0 && (
                <div className="space-y-2">
                  {selectedNetworkItems.map((entry) => {
                    const user = networkTab === 'followers' ? entry.follower : entry.following;
                    if (!user) return null;

                    const userDisplayName = user.name || user.username;
                    const initials = (userDisplayName[0] || 'U').toUpperCase();

                    return (
                      <button
                        key={entry.id}
                        className="w-full px-3 py-2 rounded-lg border border-neutral-200 hover:bg-neutral-50 flex items-center gap-3 text-left"
                        onClick={() => {
                          closeNetworkModal();
                          navigate(`/profile/${user.username}`);
                        }}
                      >
                        <div className="w-9 h-9 rounded-full bg-neutral-200 overflow-hidden flex-shrink-0 flex items-center justify-center text-xs font-bold text-neutral-700">
                          {user.avatarUrl ? (
                            <img
                              src={user.avatarUrl}
                              alt={userDisplayName}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            initials
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-neutral-900 truncate">{userDisplayName}</p>
                          <p className="text-xs text-neutral-500 truncate">@{user.username}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

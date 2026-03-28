import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@app/hooks';
import { selectCurrentUser } from '@features/auth/auth.slice';
import { AvatarMenu } from '@components/AvatarMenu';

const stackTags = ['TYPESCRIPT', 'NEXT.JS', 'TAILWIND', 'GRAPHQL', 'DOCKER'];
const recentLogs = [
  {
    id: 1,
    tags: ['React', 'Patterns'],
    ago: '2 hours ago',
    title: 'Re-thinking state management in distributed systems',
    excerpt:
      'Explored how the actor model could simplify complex local state syncing. The trade-offs between eventual consistency and developer experience are starting to clarify...',
    likes: 124,
    comments: 18,
  },
  {
    id: 2,
    tags: ['Rust', 'Safety'],
    ago: 'Yesterday',
    title: 'The beauty of the Borrow Checker: A love letter',
    excerpt:
      "It is frustrating at first, but once you realize it's preventing the 2 AM debugging sessions you used to have in C++, the appreciation grows...",
    likes: 89,
    comments: 12,
  },
];

const intensityClasses = ['bg-[#ececec]', 'bg-[#d7d7d7]', 'bg-[#a9a9a9]', 'bg-black'];

export function ProfilePage() {
  const navigate = useNavigate();
  const currentUser = useAppSelector(selectCurrentUser);
  const [profileImageError, setProfileImageError] = useState(false);

  const displayName = currentUser?.name || 'Developer';
  const initials = (displayName[0] || 'U').toUpperCase();
  const profileAvatar = currentUser?.avatarUrl || '';

  const heatmapLevels = useMemo(
    () =>
      Array.from({ length: 52 * 7 }).map((_, idx) => {
        const seed = (idx * 17 + 13) % 100;
        if (seed < 45) return 0;
        if (seed < 70) return 1;
        if (seed < 88) return 2;
        return 3;
      }),
    [],
  );

  return (
    <div className="bg-[#f9f9f9] text-[#1a1c1c] min-h-screen font-body">
      <nav className="fixed top-0 w-full flex justify-between items-center px-6 h-16 bg-[#f9f9f9] border-b border-neutral-200/60 z-50">
        <div className="flex items-center gap-8">
          <button
            className="text-2xl font-bold font-['Space_Grotesk'] text-black"
            onClick={() => navigate('/home')}
          >
            DevLog
          </button>
          <div className="hidden md:flex items-center gap-6">
            <button
              className="text-neutral-500 font-medium hover:bg-neutral-100 transition-colors duration-150 px-3 py-1 rounded"
              onClick={() => navigate('/home')}
            >
              Home
            </button>
            <button className="text-neutral-500 font-medium hover:bg-neutral-100 transition-colors duration-150 px-3 py-1 rounded">
              Explore
            </button>
            <button className="text-black font-bold border-b-2 border-black px-3 py-1">
              Profile
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden sm:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">
              search
            </span>
            <input
              className="bg-[#f1f1f1] border-none focus:ring-0 rounded-full pl-10 pr-4 py-1.5 text-sm w-44 transition-all focus:w-60"
              placeholder="Search logs..."
              type="text"
            />
          </div>
          <button className="material-symbols-outlined p-2 rounded-full hover:bg-neutral-100 transition-all">
            notifications
          </button>

          <AvatarMenu size="sm" />
        </div>
      </nav>

      <aside className="fixed left-0 top-16 h-[calc(100vh-64px)] flex flex-col p-4 space-y-2 bg-[#f3f3f3] w-64 hidden lg:flex">
        <div className="px-4 py-6 mb-4">
          <h2 className="font-['Space_Grotesk'] font-bold text-lg text-neutral-900">Journal</h2>
          <p className="text-xs text-neutral-500 uppercase tracking-widest mt-1">Developer Logs</p>
        </div>
        <button
          className="text-neutral-600 px-4 py-2 flex items-center gap-3 hover:bg-neutral-200 transition-all duration-150 rounded-lg"
          onClick={() => navigate('/home')}
        >
          <span className="material-symbols-outlined">home</span>
          <span className="font-['Inter'] text-sm font-medium tracking-wide">Home</span>
        </button>
        <button className="text-neutral-600 px-4 py-2 flex items-center gap-3 hover:bg-neutral-200 transition-all duration-150 rounded-lg">
          <span className="material-symbols-outlined">explore</span>
          <span className="font-['Inter'] text-sm font-medium tracking-wide">Explore</span>
        </button>
        <button className="text-black bg-[#e2e2e2] px-4 py-2 flex items-center gap-3 rounded-lg">
          <span className="material-symbols-outlined">person</span>
          <span className="font-['Inter'] text-sm font-semibold tracking-wide">Profile</span>
        </button>
        <button className="text-neutral-600 px-4 py-2 flex items-center gap-3 hover:bg-neutral-200 transition-all duration-150 rounded-lg">
          <span className="material-symbols-outlined">bookmark</span>
          <span className="font-['Inter'] text-sm font-medium tracking-wide">Bookmarks</span>
        </button>

        <div className="mt-auto border-t border-neutral-200/40 pt-4">
          <button
            className="w-full bg-black text-white py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity mb-4"
            onClick={() => navigate('/posts/create')}
          >
            <span className="material-symbols-outlined text-sm">add</span>
            New Entry
          </button>
          <button className="w-full text-left text-neutral-600 px-4 py-2 flex items-center gap-3 hover:bg-neutral-200 transition-all duration-150 rounded-lg">
            <span className="material-symbols-outlined">settings</span>
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
                  <p className="text-neutral-500 font-medium">@{displayName.toLowerCase().replace(/\s+/g, '_')} • Senior Frontend Engineer</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 rounded-md bg-white border border-neutral-200 hover:border-neutral-400 text-sm font-medium transition-all">
                    Edit Profile
                  </button>
                  <button className="px-4 py-2 rounded-md bg-black text-white text-sm font-medium hover:opacity-90 transition-all">
                    Follow
                  </button>
                </div>
              </div>

              <p className="text-neutral-600 leading-relaxed max-w-2xl">
                Building accessible interfaces at the intersection of design and engineering. Currently
                documenting the journey through distributed systems and modern web standards.
              </p>

              <div className="flex flex-wrap gap-4 text-sm font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">location_on</span> San Francisco
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">link</span> devlog.app
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">calendar_today</span> Joined March 2021
                </span>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-1 bg-neutral-100 rounded-xl overflow-hidden p-1">
            <div className="bg-white p-6 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-['Space_Grotesk'] font-bold">482</span>
              <span className="text-xs uppercase tracking-widest text-neutral-500 mt-1">Total Posts</span>
            </div>
            <div className="bg-white p-6 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-['Space_Grotesk'] font-bold">14</span>
              <span className="text-xs uppercase tracking-widest text-neutral-500 mt-1">Day Streak</span>
            </div>
            <div className="bg-white p-6 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-['Space_Grotesk'] font-bold">12.4k</span>
              <span className="text-xs uppercase tracking-widest text-neutral-500 mt-1">Total Reach</span>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-['Space_Grotesk'] font-bold text-lg tracking-tight">Journal Contributions</h3>
              <span className="text-xs text-neutral-500 font-medium">Year: 2026</span>
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
              {recentLogs.map((item) => (
                <div
                  key={item.id}
                  className="group p-6 bg-white rounded-xl border border-transparent hover:border-neutral-300/60 transition-all"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-2">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-neutral-200 text-neutral-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-neutral-500 font-medium italic">{item.ago}</span>
                  </div>

                  <h4 className="text-xl font-['Space_Grotesk'] font-bold group-hover:text-neutral-700 transition-colors cursor-pointer">
                    {item.title}
                  </h4>
                  <p className="mt-2 text-neutral-600 line-clamp-2 leading-relaxed">{item.excerpt}</p>
                  <div className="mt-4 flex items-center gap-6 text-xs font-medium text-neutral-500">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm">favorite</span> {item.likes}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm">chat_bubble</span> {item.comments}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm">share</span>
                    </span>
                  </div>
                </div>
              ))}
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
                <span className="material-symbols-outlined text-neutral-400">trending_up</span>
                <div>
                  <p className="text-xs font-semibold text-black">Trending Tags</p>
                  <p className="text-[10px] text-neutral-500">#Rust, #Wasm, #Zig</p>
                </div>
              </div>
              <div className="flex items-center gap-4 group opacity-90 hover:opacity-100 transition-all cursor-pointer">
                <span className="material-symbols-outlined text-neutral-400">group</span>
                <div>
                  <p className="text-xs font-semibold text-black">Suggested Users</p>
                  <p className="text-[10px] text-neutral-500">Follow 12 new peers</p>
                </div>
              </div>
              <div className="flex items-center gap-4 group opacity-90 hover:opacity-100 transition-all cursor-pointer">
                <span className="material-symbols-outlined text-neutral-400">insights</span>
                <div>
                  <p className="text-xs font-semibold text-black">Activity Stats</p>
                  <p className="text-[10px] text-neutral-500">+15% engagement this week</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-8 border-t border-neutral-200">
            <h3 className="font-['Space_Grotesk'] text-xs uppercase tracking-widest text-neutral-500 font-semibold">
              Current Stack
            </h3>
            <div className="flex flex-wrap gap-2">
              {stackTags.map((tag) => (
                <span key={tag} className="px-3 py-1 bg-neutral-200 rounded text-[10px] font-bold">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

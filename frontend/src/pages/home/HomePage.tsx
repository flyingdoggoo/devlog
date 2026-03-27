import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Mock data cho demo
const mockPosts = [
  {
    id: '1',
    title: 'Refactoring the Auth Middleware',
    category: 'NODE.JS',
    excerpt: 'Cleaned up the repetitive JWT validation logic today. Moved the validation to a higher-order function to support both Express and Fastify adapters.',
    likes: 24,
    comments: 8,
    readTime: '4m read',
  },
  {
    id: '2',
    title: 'The CSS Grid Struggle is Real',
    category: 'UI/UX',
    excerpt: 'Implementing the new dashboard layout. Decided to go with a full-height grid structure. Ran into issues with `min-content` overflows.',
    likes: 41,
    comments: 12,
    readTime: '6m read',
  },
  {
    id: '3',
    title: 'Switching to Rust for the CLI',
    category: 'RUST',
    excerpt: 'Finally bit the bullet. The memory safety and speed for the log parser are too good to ignore. The initial learning curve is steep.',
    likes: 89,
    comments: 34,
    readTime: '12m read',
  },
];

const suggestedUsers = [
  { name: 'Alex Rivers', role: 'Principal Engineer', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCTjXLedylR2lWZhSnmBzz1nCJJqnAwYHiihOvUeTXdMxCZmv2AiZN9CZuzBkO5jhAC2_gHQMyKnaf43xbNPoQju90ak3t-y4zcaIqUANz7KXaavECsC2yhl_AiR4Ao4UmPO4AUaNFxHWr4OFcpOjeu9mhTWXWY06NeyfNeNadFuGr6cWSn6bJrMC33DIE6NqqYXu3ungq3CcIlzJl5Sw_npKNd177tW2J5fJ-Hk16eV-f1tzw9kqOEhP2QbZCE3OuqlljezLmv_cM' },
  { name: 'Sarah Chen', role: 'OSS Maintainer', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBLk9zFsd95aqV3TgPzkQRWJ2Uh0zl6-y4yOo7IFKJYME7VR5SwHWDk4VgXE-NSLx6idgv9qEuaT7M549_WD_5rQDCuiEQ0hDHYDNw-dlH6LWY78IXT4ge4u7b724GJqnW5HYHTmT8ildXUeFvvhFu04PNU7NpSeHPHEtxQSg64kolAuC7az266VWCjy5NXQEioJYWdq9Ir2OM4XJeGtlOQ-tm7v7D--eCp7buHsTnyYZ1lXdMqRMpRd_bqamKfoLdBsviI9FimMJk' },
];

const trendingTags = ['#typescript', '#rustlang', '#webgpu', '#refactoring', '#architecture'];

export function HomePage() {
  const navigate = useNavigate();
  const [currentDate] = useState(new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }));

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#1a1c1c]">
      {/* Top Navigation Bar */}
      <header className="fixed top-0 w-full flex justify-between items-center px-6 h-16 bg-[#f9f9f9] border-b border-neutral-200/50 z-50">
        <div className="flex items-center gap-8">
          <span className="text-2xl font-bold font-['Space_Grotesk'] text-black">DevLog</span>
          <div className="relative hidden md:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">search</span>
            <input
              className="bg-surface-container-low border-none focus:ring-1 focus:ring-primary rounded-lg pl-10 pr-4 py-1.5 text-sm w-64 transition-all"
              placeholder="Search entries..."
              type="text"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-neutral-100 transition-colors">
            <span className="material-symbols-outlined text-neutral-600">notifications</span>
          </button>
          <div className="h-8 w-8 rounded-full bg-neutral-200 overflow-hidden">
            <img
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2IFCzzExA5GgA8HQHGlW71hI7Lm6l8Walk6nJxpljXGXT9C6Tom9Unb4r9Pk059PO5u4bH8xipeEYoAn5oItYAWWRiGlQuVO6b0H5EtE10I299ZlrXrdksIZiJA6C_xd3yoFs2bih47fRamz2YGpNXz4f-sIf7ZEiBT5iNouxAgnuVwqbgd8S6u_qrHaOeXd-xC3Zyk0cK_M8Igc9AEETeyl8ArKNa1JKG3-H_tKbvHFw2zBJuc3LXmHk7C6pE3v8b7qTo-IM9N0"
              alt="Profile"
            />
          </div>
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
            <a className="bg-[#e2e2e2] text-black rounded-lg px-4 py-2 flex items-center gap-3 transition-transform translate-x-1" href="#">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
              <span className="font-['Inter'] text-sm font-medium tracking-wide">Home</span>
            </a>
            <a className="text-neutral-600 px-4 py-2 flex items-center gap-3 hover:bg-neutral-200 transition-all rounded-lg" href="#">
              <span className="material-symbols-outlined">explore</span>
              <span className="font-['Inter'] text-sm font-medium tracking-wide">Explore</span>
            </a>
            <a className="text-neutral-600 px-4 py-2 flex items-center gap-3 hover:bg-neutral-200 transition-all rounded-lg" href="#">
              <span className="material-symbols-outlined">sell</span>
              <span className="font-['Inter'] text-sm font-medium tracking-wide">Tags</span>
            </a>
            <a className="text-neutral-600 px-4 py-2 flex items-center gap-3 hover:bg-neutral-200 transition-all rounded-lg" href="#">
              <span className="material-symbols-outlined">bookmark</span>
              <span className="font-['Inter'] text-sm font-medium tracking-wide">Bookmarks</span>
            </a>
          </nav>

          <button 
            onClick={() => navigate('/posts/create')}
            className="bg-gradient-to-br from-black to-neutral-700 text-white rounded-lg py-3 px-4 flex items-center justify-center gap-2 font-medium text-sm transition-all active:scale-95 mb-4"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            New Entry
          </button>

          <div className="border-t border-neutral-200/50 pt-4 space-y-1">
            <a className="text-neutral-600 px-4 py-2 flex items-center gap-3 hover:bg-neutral-200 transition-all rounded-lg" href="#">
              <span className="material-symbols-outlined text-lg">settings</span>
              <span className="font-['Inter'] text-sm font-medium tracking-wide">Settings</span>
            </a>
            <a className="text-neutral-600 px-4 py-2 flex items-center gap-3 hover:bg-neutral-200 transition-all rounded-lg" href="#">
              <span className="material-symbols-outlined text-lg">help_outline</span>
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
            {mockPosts.map((post) => (
              <article key={post.id} className="group cursor-pointer">
                <div className="bg-white p-8 rounded-xl transition-all duration-300 hover:bg-white border-transparent border hover:border-neutral-200/50">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-bold group-hover:underline underline-offset-4 decoration-1">
                      {post.title}
                    </h2>
                    <span className="text-xs font-mono bg-neutral-200 px-2 py-1 rounded text-neutral-700">
                      {post.category}
                    </span>
                  </div>
                  <p className="text-neutral-600 leading-relaxed mb-6 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-xs font-medium text-neutral-400">
                    <div className="flex items-center gap-1.5 hover:text-black transition-colors">
                      <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                      {post.likes}
                    </div>
                    <div className="flex items-center gap-1.5 hover:text-black transition-colors">
                      <span className="material-symbols-outlined text-lg">chat_bubble</span>
                      {post.comments}
                    </div>
                    <span className="ml-auto">{post.readTime}</span>
                  </div>
                </div>
              </article>
            ))}

            {/* Snippet Card */}
            <div className="grid grid-cols-2 gap-8">
              <div className="bg-neutral-100 p-6 rounded-lg border border-neutral-200/50">
                <h3 className="font-bold text-sm uppercase tracking-widest mb-4">Snippet of the day</h3>
                <code className="block text-xs font-mono text-black bg-white/50 p-4 rounded mb-4">
                  const curate = (log) ={'>'} {'{'}<br/>
                  &nbsp;&nbsp;return log.filter(e ={'>'} e.valuable);<br/>
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
              <span className="material-symbols-outlined text-orange-500" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
            </div>
            <div className="text-3xl font-bold font-['Space_Grotesk'] mb-2">14 Days</div>
            <div className="flex gap-1.5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-1.5 flex-1 rounded-full bg-black"></div>
              ))}
              {[...Array(2)].map((_, i) => (
                <div key={i + 5} className="h-1.5 flex-1 rounded-full bg-neutral-200"></div>
              ))}
            </div>
            <p className="text-[11px] text-neutral-400 mt-3">Keep it up! 3 more days to reach Gold Curator status.</p>
          </div>

          {/* Trending Tags */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-lg">trending_up</span>
              <h3 className="font-['Space_Grotesk'] text-xs uppercase tracking-widest font-bold">Trending Tags</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {trendingTags.map((tag) => (
                <a
                  key={tag}
                  className="text-[11px] font-mono bg-neutral-200 px-3 py-1.5 rounded-full hover:bg-neutral-300 transition-colors"
                  href="#"
                >
                  {tag}
                </a>
              ))}
            </div>
          </div>

          {/* Suggested Users */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-lg">group</span>
              <h3 className="font-['Space_Grotesk'] text-xs uppercase tracking-widest font-bold">Suggested Users</h3>
            </div>
            <div className="space-y-4">
              {suggestedUsers.map((user) => (
                <div key={user.name} className="flex items-center gap-3 group cursor-pointer">
                  <img className="w-8 h-8 rounded-full" src={user.avatar} alt={user.name} />
                  <div className="flex-1">
                    <p className="text-xs font-bold group-hover:underline">{user.name}</p>
                    <p className="text-[10px] text-neutral-400">{user.role}</p>
                  </div>
                  <button className="text-[10px] font-bold border border-neutral-200 px-2 py-1 rounded hover:bg-black hover:text-white transition-all">
                    FOLLOW
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Stats */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-lg">insights</span>
              <h3 className="font-['Space_Grotesk'] text-xs uppercase tracking-widest font-bold">Activity Stats</h3>
            </div>
            <div className="p-4 bg-neutral-100 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] text-neutral-500 font-medium">Log Volume</span>
                <span className="text-[11px] font-bold text-green-600">+12%</span>
              </div>
              <div className="flex items-end gap-1 h-12">
                {[4, 6, 8, 5, 10, 7, 9].map((height, i) => (
                  <div
                    key={i}
                    className={`w-full rounded-t-sm ${i === 4 ? 'bg-black' : 'bg-neutral-300'}`}
                    style={{ height: `${height * 4}px` }}
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

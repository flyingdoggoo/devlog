import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function CreatePostPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState(['Productivity', 'DevLog']);
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Auto-save simulation
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setContent(value);
    
    // Calculate word count
    const words = value.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
    setReadingTime(Math.ceil(words.length / 200)); // 200 words per minute
    
    // Auto-save debounce
    if (isSaving) return;
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setLastSaved(new Date());
      console.log('Auto-saved:', { title, content, tags });
    }, 1000);
  };

  const handlePublish = () => {
    console.log('Publishing:', { title, content, tags });
    // TODO: Call API to create post
    navigate('/');
  };

  const handleAddTag = () => {
    const newTag = prompt('Enter tag name:');
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#1a1c1c] font-body">
      {/* Top Navigation Bar */}
      <header className="fixed top-0 w-full flex justify-between items-center px-6 h-16 bg-[#f9f9f9] border-b border-neutral-200/50 z-50">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-neutral-100 transition-colors duration-150 rounded-lg group"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="h-6 w-[1px] bg-neutral-300/30"></div>
          <span className="text-2xl font-bold font-['Space_Grotesk']">DevLog</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-neutral-400 font-mono text-xs hidden md:block">
            {isSaving ? 'SAVING...' : lastSaved ? `AUTOSAVED AT ${lastSaved.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : 'NOT SAVED'}
          </span>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 transition-colors rounded-lg">
              Preview
            </button>
            <button 
              onClick={handlePublish}
              disabled={!title.trim() || !content.trim()}
              className="bg-gradient-to-br from-black to-neutral-700 text-white px-5 py-2 rounded-lg text-sm font-semibold tracking-wide shadow-sm active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Publish
            </button>
          </div>
        </div>
      </header>

      <main className="pt-16 min-h-screen flex">
        {/* Left Sidebar - Editor Tools */}
        <aside className="fixed left-0 top-16 h-[calc(100vh-64px)] w-64 bg-[#f3f3f3] flex flex-col p-4 space-y-2 hidden lg:flex">
          <div className="mb-6 px-4 pt-4">
            <h3 className="font-headline text-xs uppercase tracking-widest text-neutral-500 font-bold mb-4">Editor Tools</h3>
          </div>
          <nav className="space-y-1">
            <button className="w-full text-neutral-600 px-4 py-2 flex items-center gap-3 hover:bg-neutral-200 transition-all duration-150 rounded-lg group">
              <span className="material-symbols-outlined text-[20px]">format_bold</span>
              <span className="font-['Inter'] text-sm font-medium tracking-wide">Bold</span>
              <span className="ml-auto text-[10px] text-neutral-400 font-mono">⌘B</span>
            </button>
            <button className="w-full text-neutral-600 px-4 py-2 flex items-center gap-3 hover:bg-neutral-200 transition-all duration-150 rounded-lg group">
              <span className="material-symbols-outlined text-[20px]">format_italic</span>
              <span className="font-['Inter'] text-sm font-medium tracking-wide">Italic</span>
              <span className="ml-auto text-[10px] text-neutral-400 font-mono">⌘I</span>
            </button>
            <button className="w-full text-neutral-600 px-4 py-2 flex items-center gap-3 hover:bg-neutral-200 transition-all duration-150 rounded-lg group">
              <span className="material-symbols-outlined text-[20px]">link</span>
              <span className="font-['Inter'] text-sm font-medium tracking-wide">Link</span>
              <span className="ml-auto text-[10px] text-neutral-400 font-mono">⌘K</span>
            </button>
            <button className="w-full text-neutral-600 px-4 py-2 flex items-center gap-3 hover:bg-neutral-200 transition-all duration-150 rounded-lg group">
              <span className="material-symbols-outlined text-[20px]">code</span>
              <span className="font-['Inter'] text-sm font-medium tracking-wide">Code Block</span>
            </button>
            <button className="w-full text-neutral-600 px-4 py-2 flex items-center gap-3 hover:bg-neutral-200 transition-all duration-150 rounded-lg group">
              <span className="material-symbols-outlined text-[20px]">image</span>
              <span className="font-['Inter'] text-sm font-medium tracking-wide">Media</span>
            </button>
          </nav>
          <div className="mt-auto p-4 bg-white rounded-xl border border-neutral-200/50">
            <p className="text-[11px] font-mono text-neutral-400 mb-2 uppercase">Writing Mode</p>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">Focus Mode</span>
              <div className="w-8 h-4 bg-neutral-300 rounded-full relative cursor-pointer">
                <div className="absolute left-0.5 top-0.5 w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Editor */}
        <section className="flex-1 lg:ml-64 lg:mr-72 min-h-screen bg-white flex flex-col items-center">
          <div className="w-full max-w-3xl px-8 md:px-12 py-16 flex flex-col gap-8">
            {/* Hero Metadata */}
            <div className="flex items-center gap-4 mb-2">
              <div className="flex items-center gap-2 px-3 py-1 bg-neutral-200 rounded-full">
                <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                <span className="text-[10px] font-mono font-bold uppercase tracking-tighter">{currentDate}</span>
              </div>
              <div className="h-1 w-1 bg-neutral-300 rounded-full"></div>
              <span className="text-[11px] text-neutral-400 font-mono uppercase tracking-widest">Draft Entry</span>
            </div>

            {/* Title Input */}
            <textarea
              className="w-full bg-transparent border-none focus:ring-0 p-0 text-5xl md:text-6xl font-headline font-bold tracking-tight text-black placeholder:text-neutral-200 resize-none overflow-hidden"
              placeholder="Untitled Entry"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = target.scrollHeight + 'px';
              }}
              rows={1}
            />

            {/* Tag Input Area */}
            <div className="flex flex-wrap items-center gap-2 group">
              {tags.map((tag) => (
                <div 
                  key={tag} 
                  className="flex items-center gap-1.5 px-3 py-1 bg-neutral-100 rounded-lg text-xs font-medium text-neutral-600 border border-transparent hover:border-neutral-300 transition-all cursor-pointer"
                  onClick={() => handleRemoveTag(tag)}
                >
                  <span className="material-symbols-outlined text-[16px]">tag</span>
                  <span>{tag}</span>
                  <span className="material-symbols-outlined text-[14px] hover:text-red-500">close</span>
                </div>
              ))}
              <button 
                onClick={handleAddTag}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-neutral-400 hover:text-black transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>Add tag...</span>
              </button>
            </div>

            {/* Editorial Content Area */}
            <div className="relative group min-h-[500px]">
              <textarea
                className="w-full bg-transparent border-none focus:ring-0 p-0 text-lg leading-relaxed text-neutral-600 placeholder:text-neutral-200 resize-none min-h-[500px] font-body"
                placeholder="Start curating your thoughts..."
                value={content}
                onChange={handleContentChange}
              />
              {/* Floating Action Hint */}
              <div className="absolute -left-12 top-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2">
                <button className="w-8 h-8 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-neutral-400 hover:text-black hover:shadow-sm transition-all">
                  <span className="material-symbols-outlined text-[18px]">add</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Right Sidebar - Insights */}
        <aside className="fixed right-0 top-16 h-[calc(100vh-64px)] w-72 bg-[#f9f9f9] border-l border-neutral-100 flex flex-col p-6 hidden xl:flex">
          <div className="space-y-8">
            {/* Metadata */}
            <div>
              <h4 className="font-headline text-xs uppercase tracking-widest text-neutral-500 font-bold mb-4">Metadata</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center group">
                  <span className="text-xs text-neutral-400">Words</span>
                  <span className="text-xs font-mono font-bold">{wordCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center group">
                  <span className="text-xs text-neutral-400">Reading time</span>
                  <span className="text-xs font-mono font-bold">{readingTime} min</span>
                </div>
                <div className="flex justify-between items-center group">
                  <span className="text-xs text-neutral-400">Characters</span>
                  <span className="text-xs font-mono font-bold">{(content.length).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="h-[1px] bg-neutral-100"></div>

            {/* Entry Insights */}
            <div>
              <h4 className="font-headline text-xs uppercase tracking-widest text-neutral-500 font-bold mb-4">Entry Insights</h4>
              <div className="bg-white p-4 rounded-xl border border-neutral-200/50 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-neutral-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">trending_up</span>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold">Velocity</p>
                    <p className="text-[10px] text-neutral-400">+12% from last log</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Suggested Tags */}
            <div>
              <h4 className="font-headline text-xs uppercase tracking-widest text-neutral-500 font-bold mb-4">Suggested Tags</h4>
              <div className="flex flex-wrap gap-2">
                <span className="text-[10px] px-2 py-1 bg-neutral-200 rounded text-neutral-700 font-mono">#React</span>
                <span className="text-[10px] px-2 py-1 bg-neutral-200 rounded text-neutral-700 font-mono">#UI_Design</span>
                <span className="text-[10px] px-2 py-1 bg-neutral-200 rounded text-neutral-700 font-mono">#Monochrome</span>
              </div>
            </div>
          </div>

          {/* Upload Area */}
          <div className="mt-auto">
            <div className="p-4 rounded-xl bg-white border border-dashed border-neutral-300 flex flex-col items-center text-center gap-2 cursor-pointer hover:border-neutral-400 transition-colors">
              <span className="material-symbols-outlined text-neutral-400">upload_file</span>
              <p className="text-[11px] font-medium text-neutral-500">Drag & drop images to Curator</p>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

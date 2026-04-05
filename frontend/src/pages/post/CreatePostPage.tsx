import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { LucideIcon } from 'lucide-react';
import {
  Bold,
  Code2,
  Heading1,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Plus,
  Quote,
  Tag as TagIcon,
  Upload,
  X,
} from 'lucide-react';
import { postsApi } from '@services/posts.service';
import { tagsApi } from '@services/tags.service';
import { uploadsApi } from '@services/uploads.service';
import { PostStatus } from '@/types/post';
import type { Tag } from '@/types/tag';
import {
  calculateReadTimeMinutes,
  formatReadTime,
  getCharacterCount,
  getWordCount,
} from '@/utils/read-metrics';

function buildExcerpt(content: string) {
  const normalized = content.trim();
  if (!normalized) return '';

  const maxLength = 180;
  return normalized.length <= maxLength
    ? normalized
    : `${normalized.slice(0, maxLength).trimEnd()}...`;
}

function normalizeTagName(input: string) {
  return input.trim().toLowerCase();
}

const MAX_TAG_NAME_LENGTH = 10;

interface ToolbarAction {
  key: string;
  label: string;
  icon: LucideIcon;
  onClick: () => void;
}

export function CreatePostPage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editorMode, setEditorMode] = useState<'edit' | 'preview'>('edit');

  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [tagError, setTagError] = useState<string | null>(null);

  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDraggingImage, setIsDraggingImage] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);

  const coverFileInputRef = useRef<HTMLInputElement | null>(null);
  const inlineImageInputRef = useRef<HTMLInputElement | null>(null);
  const editorTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  const wordCount = useMemo(() => getWordCount(content), [content]);
  const characterCount = useMemo(() => getCharacterCount(content), [content]);
  const readingTimeMinutes = useMemo(() => calculateReadTimeMinutes(content), [content]);

  const selectedTagIdSet = useMemo(() => new Set(selectedTags.map((tag) => tag.id)), [selectedTags]);

  const filteredTagSuggestions = useMemo(() => {
    const keyword = normalizeTagName(tagInput);
    if (!keyword) return [];

    return availableTags
      .filter((tag) => !selectedTagIdSet.has(tag.id))
      .filter((tag) => tag.name.toLowerCase().includes(keyword))
      .slice(0, 8);
  }, [availableTags, selectedTagIdSet, tagInput]);

  const suggestedTags = useMemo(() => {
    const source = content.toLowerCase();
    if (!source.trim()) return [];

    return availableTags
      .filter((tag) => !selectedTagIdSet.has(tag.id))
      .map((tag) => {
        const normalized = tag.name.toLowerCase();
        const pieces = normalized.split(/[-_\s]+/).filter(Boolean);

        let score = 0;
        if (source.includes(normalized)) {
          score += 3;
        }

        for (const piece of pieces) {
          if (piece.length > 2 && source.includes(piece)) {
            score += 1;
          }
        }

        return { tag, score };
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map((entry) => entry.tag);
  }, [availableTags, content, selectedTagIdSet]);

  const executeEditorChange = (
    callback: (
      value: string,
      selectionStart: number,
      selectionEnd: number,
    ) => {
      nextValue: string;
      nextSelectionStart: number;
      nextSelectionEnd: number;
    },
  ) => {
    const textarea = editorTextareaRef.current;
    if (!textarea) return;

    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;

    const {
      nextValue,
      nextSelectionStart,
      nextSelectionEnd,
    } = callback(content, selectionStart, selectionEnd);

    setContent(nextValue);

    window.requestAnimationFrame(() => {
      const nextTextarea = editorTextareaRef.current;
      if (!nextTextarea) return;

      nextTextarea.focus();
      nextTextarea.setSelectionRange(nextSelectionStart, nextSelectionEnd);
    });
  };

  const wrapSelection = (prefix: string, suffix = prefix, placeholder = 'text') => {
    executeEditorChange((value, selectionStart, selectionEnd) => {
      const selectedText = value.slice(selectionStart, selectionEnd);
      const body = selectedText || placeholder;
      const insert = `${prefix}${body}${suffix}`;
      const nextValue = `${value.slice(0, selectionStart)}${insert}${value.slice(selectionEnd)}`;

      if (selectedText) {
        const caret = selectionStart + insert.length;
        return {
          nextValue,
          nextSelectionStart: caret,
          nextSelectionEnd: caret,
        };
      }

      return {
        nextValue,
        nextSelectionStart: selectionStart + prefix.length,
        nextSelectionEnd: selectionStart + prefix.length + body.length,
      };
    });
  };

  const insertLink = () => {
    executeEditorChange((value, selectionStart, selectionEnd) => {
      const selectedText = value.slice(selectionStart, selectionEnd) || 'link text';
      const urlPlaceholder = 'https://';
      const insert = `[${selectedText}](${urlPlaceholder})`;
      const nextValue = `${value.slice(0, selectionStart)}${insert}${value.slice(selectionEnd)}`;
      const urlStart = selectionStart + selectedText.length + 3;

      return {
        nextValue,
        nextSelectionStart: urlStart,
        nextSelectionEnd: urlStart + urlPlaceholder.length,
      };
    });
  };

  const prefixLines = (mode: 'heading' | 'quote' | 'ordered' | 'unordered') => {
    executeEditorChange((value, selectionStart, selectionEnd) => {
      const startLineStart = value.lastIndexOf('\n', Math.max(0, selectionStart - 1)) + 1;
      const endLineBreak = value.indexOf('\n', selectionEnd);
      const endLineEnd = endLineBreak === -1 ? value.length : endLineBreak;

      const selectedBlock = value.slice(startLineStart, endLineEnd);
      const sourceLines = selectedBlock.split('\n');
      const lines: string[] = [];

      for (let lineNumber = 0; lineNumber < sourceLines.length; lineNumber += 1) {
        const rawLine = sourceLines[lineNumber];

        if (mode === 'heading') {
          lines.push(`# ${rawLine.replace(/^\s*#{1,6}\s+/, '')}`);
          continue;
        }

        if (mode === 'quote') {
          lines.push(`> ${rawLine.replace(/^\s*>\s?/, '')}`);
          continue;
        }

        if (mode === 'ordered') {
          const cleaned = rawLine.replace(/^\s*\d+\.\s+/, '').replace(/^\s*[-*+]\s+/, '');
          lines.push(`${lineNumber + 1}. ${cleaned}`);
          continue;
        }

        lines.push(`- ${rawLine.replace(/^\s*[-*+]\s+/, '').replace(/^\s*\d+\.\s+/, '')}`);
      }

      const insert = lines.join('\n');
      const nextValue = `${value.slice(0, startLineStart)}${insert}${value.slice(endLineEnd)}`;

      return {
        nextValue,
        nextSelectionStart: startLineStart,
        nextSelectionEnd: startLineStart + insert.length,
      };
    });
  };

  const insertCodeBlock = () => {
    executeEditorChange((value, selectionStart, selectionEnd) => {
      const selectedText = value.slice(selectionStart, selectionEnd);
      const insert = selectedText
        ? `\n\`\`\`\n${selectedText}\n\`\`\`\n`
        : `\n\`\`\`ts\n\n\`\`\`\n`;
      const nextValue = `${value.slice(0, selectionStart)}${insert}${value.slice(selectionEnd)}`;

      const anchor = selectedText
        ? selectionStart + insert.length
        : selectionStart + '\n```ts\n'.length;

      return {
        nextValue,
        nextSelectionStart: anchor,
        nextSelectionEnd: anchor,
      };
    });
  };

  const insertInlineImageAtCursor = (url: string) => {
    const markdownImage = `\n![image](${url})\n`;
    executeEditorChange((value, selectionStart, selectionEnd) => {
      const nextValue = `${value.slice(0, selectionStart)}${markdownImage}${value.slice(selectionEnd)}`;
      const nextCaret = selectionStart + markdownImage.length;

      return {
        nextValue,
        nextSelectionStart: nextCaret,
        nextSelectionEnd: nextCaret,
      };
    });
  };

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      try {
        const tags = await tagsApi.getAllTags();
        if (!active) return;

        const sortedTags = [...tags].sort((a, b) => a.name.localeCompare(b.name));
        setAvailableTags(sortedTags);
      } catch {
        if (!active) return;
        setAvailableTags([]);
      }
    };

    bootstrap();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!title.trim() && !content.trim() && selectedTags.length === 0 && !coverImageUrl) {
      return;
    }

    setIsSaving(true);

    const timer = window.setTimeout(() => {
      setIsSaving(false);
      setLastSaved(new Date());
    }, 700);

    return () => window.clearTimeout(timer);
  }, [title, content, selectedTags, coverImageUrl]);

  const addTag = (tag: Tag) => {
    setTagError(null);
    setSelectedTags((prev) => (prev.some((item) => item.id === tag.id) ? prev : [...prev, tag]));
  };

  const removeTag = (tagId: string) => {
    setSelectedTags((prev) => prev.filter((item) => item.id !== tagId));
  };

  const handleCreateTagFromInput = async () => {
    const normalized = normalizeTagName(tagInput);
    if (!normalized || isCreatingTag) return;

    const existing = availableTags.find((tag) => tag.name.toLowerCase() === normalized);
    if (existing) {
      addTag(existing);
      setTagInput('');
      return;
    }

    if (normalized.length > MAX_TAG_NAME_LENGTH) {
      setTagError(`Tag must be at most ${MAX_TAG_NAME_LENGTH} characters`);
      return;
    }

    try {
      setIsCreatingTag(true);
      setTagError(null);
      const created = await tagsApi.createTag({ name: normalized });
      setAvailableTags((prev) => {
        const merged = [created, ...prev.filter((tag) => tag.id !== created.id)];
        return merged.sort((a, b) => a.name.localeCompare(b.name));
      });
      addTag(created);
      setTagInput('');
    } catch (error: any) {
      const message = error?.response?.data?.message;
      if (Array.isArray(message)) {
        setTagError(message.join(', '));
      } else if (typeof message === 'string') {
        setTagError(message);
      } else {
        setTagError('Could not create tag');
      }
    } finally {
      setIsCreatingTag(false);
    }
  };

  const handleTagKeyDown = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    await handleCreateTagFromInput();
  };

  const handlePickCoverImage = () => {
    coverFileInputRef.current?.click();
  };

  const handlePickInlineImage = () => {
    inlineImageInputRef.current?.click();
  };

  const uploadFile = async (file: File, target: 'cover' | 'inline') => {
    const isAllowedType = /image\/(png|jpe?g|webp)/i.test(file.type);
    if (!isAllowedType) {
      setUploadError('Only PNG, JPG, JPEG, and WEBP are supported');
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError('Image size must be 5MB or less');
      return;
    }

    try {
      setUploadError(null);
      setIsUploadingImage(true);
      const uploaded = await uploadsApi.uploadImage(file);

      if (target === 'cover') {
        setCoverImageUrl(uploaded.url);
      } else {
        insertInlineImageAtCursor(uploaded.url);
      }
    } catch (error: any) {
      const message = error?.response?.data?.message;
      if (Array.isArray(message)) {
        setUploadError(message.join(', '));
      } else if (typeof message === 'string') {
        setUploadError(message);
      } else {
        setUploadError('Failed to upload image');
      }
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleCoverFileInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await uploadFile(file, 'cover');
    event.target.value = '';
  };

  const handleInlineImageInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await uploadFile(file, 'inline');
    event.target.value = '';
  };

  const handleDropImage = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingImage(false);

    const file = event.dataTransfer.files?.[0];
    if (!file) return;

    await uploadFile(file, 'cover');
  };

  const handlePublish = async () => {
    const normalizedTitle = title.trim();
    const normalizedContent = content.trim();

    if (!normalizedTitle || !normalizedContent || isPublishing || isUploadingImage) {
      return;
    }

    try {
      setIsPublishing(true);
      setPublishError(null);

      const created = await postsApi.createPost({
        title: normalizedTitle,
        content: normalizedContent,
        excerpt: buildExcerpt(normalizedContent),
        coverImageUrl: coverImageUrl || undefined,
        tagIds: selectedTags.map((tag) => tag.id),
        status: PostStatus.PUBLISHED,
        readTimeMinutes: readingTimeMinutes,
      });

      const createdPost = created.data;
      if (createdPost?.slug) {
        navigate(`/posts/${createdPost.slug}`);
        return;
      }

      navigate('/home');
    } catch (error: any) {
      const message = error?.response?.data?.message;
      if (Array.isArray(message)) {
        setPublishError(message.join(', '));
      } else if (typeof message === 'string') {
        setPublishError(message);
      } else {
        setPublishError('Failed to publish post. Please try again.');
      }
    } finally {
      setIsPublishing(false);
    }
  };

  const toolbarButtons: ToolbarAction[] = [
    { key: 'bold', label: 'Bold', icon: Bold, onClick: () => wrapSelection('**') },
    { key: 'italic', label: 'Italic', icon: Italic, onClick: () => wrapSelection('*') },
    { key: 'link', label: 'Link', icon: Link2, onClick: insertLink },
    { key: 'ordered', label: 'Ordered List', icon: ListOrdered, onClick: () => prefixLines('ordered') },
    { key: 'unordered', label: 'Unordered List', icon: List, onClick: () => prefixLines('unordered') },
    { key: 'heading', label: 'Heading', icon: Heading1, onClick: () => prefixLines('heading') },
    { key: 'quote', label: 'Quote', icon: Quote, onClick: () => prefixLines('quote') },
    { key: 'code', label: 'Code Block', icon: Code2, onClick: insertCodeBlock },
    { key: 'image', label: 'Upload Image', icon: ImagePlus, onClick: handlePickInlineImage },
  ];

  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#1a1c1c] font-body">
      <header className="fixed top-0 w-full flex justify-between items-center px-4 md:px-6 h-16 bg-[#f9f9f9] border-b border-neutral-200/50 z-50">
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/home'))}
            className="p-2 hover:bg-neutral-100 transition-colors duration-150 rounded-lg"
            aria-label="Back"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="h-6 w-[1px] bg-neutral-300/30" />
          <span className="text-xl md:text-2xl font-bold font-['Space_Grotesk'] truncate">DevLog</span>
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          {publishError && <span className="text-red-500 text-xs font-medium hidden md:block">{publishError}</span>}
          <span className="text-neutral-400 font-mono text-xs hidden lg:block">
            {isSaving
              ? 'SAVING...'
              : lastSaved
                ? `AUTOSAVED AT ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                : 'NOT SAVED'}
          </span>

          <div className="inline-flex items-center rounded-lg border border-neutral-300 bg-white p-1">
            <button
              onClick={() => setEditorMode('edit')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                editorMode === 'edit'
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              Edit
            </button>
            <button
              onClick={() => setEditorMode('preview')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                editorMode === 'preview'
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              Preview
            </button>
          </div>

          <button
            onClick={handlePublish}
            disabled={!title.trim() || !content.trim() || isPublishing || isUploadingImage}
            className="bg-gradient-to-br from-black to-neutral-700 text-white px-4 md:px-5 py-2 rounded-lg text-sm font-semibold tracking-wide shadow-sm active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPublishing ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </header>

      <main className="pt-16 min-h-screen xl:flex">
        <section className="flex-1 min-h-screen bg-white xl:mr-80">
          <div className="w-full max-w-4xl px-4 md:px-8 py-8 md:py-12 mx-auto flex flex-col gap-8">
            <div className="flex items-center gap-4 mb-2">
              <div className="flex items-center gap-2 px-3 py-1 bg-neutral-200 rounded-full">
                <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                <span className="text-[10px] font-mono font-bold uppercase tracking-tighter">{currentDate}</span>
              </div>
              <div className="h-1 w-1 bg-neutral-300 rounded-full" />
              <span className="text-[11px] text-neutral-400 font-mono uppercase tracking-widest">Draft Entry</span>
            </div>

            <textarea
              className="w-full bg-transparent border-none focus:ring-0 p-0 text-4xl md:text-6xl font-['Space_Grotesk'] font-bold tracking-tight text-black placeholder:text-neutral-200 resize-none overflow-hidden"
              placeholder="Untitled Entry"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              onInput={(event) => {
                const target = event.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = `${target.scrollHeight}px`;
              }}
              rows={1}
            />

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2 min-h-8">
                {selectedTags.map((tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-neutral-100 rounded-md text-xs font-medium text-neutral-700 border border-neutral-200"
                  >
                    <TagIcon className="h-3.5 w-3.5" />
                    <span>{tag.name}</span>
                    <button
                      onClick={() => removeTag(tag.id)}
                      className="text-neutral-400 hover:text-red-500"
                      aria-label={`Remove tag ${tag.name}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}

                <div className="relative">
                  <div className="flex items-center gap-2">
                    <input
                      value={tagInput}
                      onChange={(event) => {
                        setTagInput(event.target.value);
                        setTagError(null);
                      }}
                      onKeyDown={handleTagKeyDown}
                      placeholder="Add tag"
                      maxLength={MAX_TAG_NAME_LENGTH}
                      className="h-8 w-40 sm:w-48 border border-neutral-300 rounded-md px-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200"
                    />
                    <button
                      onClick={handleCreateTagFromInput}
                      disabled={!tagInput.trim() || isCreatingTag}
                      className="h-8 px-2.5 rounded-md border border-neutral-300 text-xs font-medium text-neutral-700 hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="inline-flex items-center gap-1">
                        <Plus className="h-3.5 w-3.5" />
                        Add
                      </span>
                    </button>
                    {isCreatingTag && <span className="text-xs text-neutral-500">Creating...</span>}
                  </div>

                  {tagInput.trim().length > 0 && filteredTagSuggestions.length > 0 && (
                    <div className="absolute top-full mt-1 left-0 w-56 bg-white border border-neutral-200 rounded-lg shadow-md z-20 max-h-48 overflow-y-auto">
                      {filteredTagSuggestions.map((tag) => (
                        <button
                          key={tag.id}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-100"
                          onClick={() => {
                            addTag(tag);
                            setTagInput('');
                          }}
                        >
                          #{tag.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {tagError && <p className="text-xs text-red-500">{tagError}</p>}
            </div>

            <div className="border border-neutral-200 rounded-xl overflow-hidden">
              <input
                ref={inlineImageInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleInlineImageInputChange}
              />

              <div className="flex flex-wrap items-center gap-1 p-2 bg-neutral-50 border-b border-neutral-200">
                {toolbarButtons.map((action) => {
                  const Icon = action.icon;

                  return (
                    <button
                      key={action.key}
                      title={action.label}
                      aria-label={action.label}
                      onClick={action.onClick}
                      disabled={editorMode !== 'edit' || isUploadingImage}
                      className="h-9 w-9 rounded-md border border-transparent hover:border-neutral-300 hover:bg-white text-neutral-700 disabled:text-neutral-300 disabled:hover:bg-transparent disabled:hover:border-transparent disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                    >
                      <Icon className="h-4 w-4" />
                    </button>
                  );
                })}
              </div>

              {editorMode === 'edit' ? (
                <textarea
                  ref={editorTextareaRef}
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  className="w-full min-h-[520px] max-h-[620px] p-4 md:p-6 resize-y outline-none bg-white text-[15px] leading-7 text-neutral-800 font-mono"
                  placeholder="Write your post content here..."
                />
              ) : (
                <div className="min-h-[520px] max-h-[620px] overflow-y-auto p-4 md:p-6 bg-[#fcfcfc]">
                  {content.trim() ? (
                    <div className="max-w-none text-[15px] leading-7 text-neutral-800 [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:leading-tight [&_h1]:mt-6 [&_h1]:mb-3 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-5 [&_h3]:mb-2 [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_blockquote]:border-l-4 [&_blockquote]:border-neutral-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_pre]:mb-4 [&_pre]:rounded-lg [&_pre]:bg-neutral-900 [&_pre]:p-4 [&_pre]:text-neutral-100 [&_pre]:overflow-x-auto [&_pre_code]:bg-transparent [&_pre_code]:text-neutral-100 [&_pre_code]:px-0 [&_pre_code]:py-0 [&_:not(pre)>code]:rounded [&_:not(pre)>code]:bg-neutral-100 [&_:not(pre)>code]:px-1.5 [&_:not(pre)>code]:py-0.5 [&_img]:rounded-xl [&_img]:my-4">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-sm text-neutral-400">
                      Nothing to preview yet.
                    </div>
                  )}
                </div>
              )}
            </div>

            <p className="text-xs text-neutral-500">
              {editorMode === 'edit'
                ? 'Use the toolbar to format your content quickly.'
                : 'Preview renders markdown exactly as readers will see it.'}
            </p>
            <p className="text-xs text-neutral-500">
              {lastSaved
                ? 'Autosave active for this draft.'
                : 'Start writing to enable autosave indicator.'}
            </p>
            {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}
            {publishError && <p className="text-xs text-red-500 md:hidden">{publishError}</p>}
          </div>
        </section>

        <aside className="w-full bg-[#f9f9f9] p-4 md:p-6 border-t border-neutral-200 xl:fixed xl:right-0 xl:top-16 xl:h-[calc(100vh-64px)] xl:w-80 xl:flex xl:flex-col xl:border-l xl:border-t-0 xl:border-neutral-100 xl:overflow-y-auto">
          <div className="space-y-8">
            <div>
              <h4 className="text-xs uppercase tracking-widest text-neutral-500 font-bold mb-4">Metadata</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-neutral-500">Words</span>
                  <span className="text-xs font-mono font-bold">{wordCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-neutral-500">Reading time</span>
                  <span className="text-xs font-mono font-bold">{readingTimeMinutes} min</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-neutral-500">Characters</span>
                  <span className="text-xs font-mono font-bold">{characterCount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="h-[1px] bg-neutral-200" />

            <div>
              <h4 className="text-xs uppercase tracking-widest text-neutral-500 font-bold mb-4">Suggested Tags</h4>
              <div className="flex flex-wrap gap-2">
                {suggestedTags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => addTag(tag)}
                    className="text-[11px] px-2.5 py-1.5 bg-white border border-neutral-200 rounded-full text-neutral-700 hover:border-neutral-400 transition-colors"
                  >
                    #{tag.name}
                  </button>
                ))}
                {suggestedTags.length === 0 && (
                  <span className="text-[11px] text-neutral-500">No suggestions yet. Keep writing to unlock suggestions.</span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 xl:mt-auto space-y-3">
            <input
              ref={coverFileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleCoverFileInputChange}
            />

            <div
              className={`p-4 rounded-xl bg-white border border-dashed flex flex-col items-center text-center gap-2 cursor-pointer transition-colors ${
                isDraggingImage ? 'border-blue-500 bg-blue-50' : 'border-neutral-300 hover:border-neutral-500'
              }`}
              onClick={handlePickCoverImage}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDraggingImage(true);
              }}
              onDragLeave={(event) => {
                event.preventDefault();
                setIsDraggingImage(false);
              }}
              onDrop={handleDropImage}
            >
              <Upload className="h-4 w-4 text-neutral-500" />
              <p className="text-[11px] font-medium text-neutral-600">
                {isUploadingImage ? 'Uploading image...' : 'Drag and drop cover image or click to upload'}
              </p>
              <p className="text-[10px] text-neutral-400">PNG, JPG, WEBP up to 5MB</p>
            </div>

            {coverImageUrl && (
              <div className="bg-white border border-neutral-200 rounded-xl p-3 space-y-2">
                <img
                  src={coverImageUrl}
                  alt="Cover preview"
                  className="w-full h-32 object-cover rounded-lg"
                  referrerPolicy="no-referrer"
                />
                <button
                  onClick={() => setCoverImageUrl('')}
                  className="text-xs text-red-500 hover:text-red-600"
                >
                  Remove cover image
                </button>
              </div>
            )}

            {!uploadError && coverImageUrl && (
              <p className="text-[11px] text-neutral-500">Post read time preview: {formatReadTime(readingTimeMinutes)}</p>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}

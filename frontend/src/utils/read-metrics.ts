export function getWordCount(content?: string | null) {
  if (!content) return 0;
  return content.trim().split(/\s+/).filter(Boolean).length;
}

export function getCharacterCount(content?: string | null) {
  return (content ?? '').length;
}

export function calculateReadTimeMinutes(content?: string | null) {
  const words = getWordCount(content);
  return Math.max(1, Math.ceil(words / 200));
}

export function formatReadTime(minutes?: number | null, fallbackContent?: string | null) {
  const resolved =
    typeof minutes === 'number' && Number.isFinite(minutes) && minutes > 0
      ? Math.ceil(minutes)
      : calculateReadTimeMinutes(fallbackContent);

  return `${resolved} min read`;
}

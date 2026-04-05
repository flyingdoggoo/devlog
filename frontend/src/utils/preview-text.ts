interface PreviewTextOptions {
  fallback?: string;
  maxLength?: number;
}

function stripMarkdownToText(input: string) {
  return input
    .replace(/```[a-zA-Z0-9_-]*\n?/g, ' ')
    .replace(/```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*>\s?/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/~~(.*?)~~/g, '$1')
    .replace(/(^|[\s(])(\*|_)([^*_]+)\2(?=[\s).,!?:;]|$)/g, '$1$3')
    .replace(/^\s*([-*_]\s*){3,}$/gm, '')
    .replace(/\r?\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getPostPreviewText(
  excerpt?: string | null,
  content?: string | null,
  options?: PreviewTextOptions,
) {
  const fallback = options?.fallback ?? 'No excerpt';
  const maxLength = options?.maxLength ?? 220;

  const source = (excerpt ?? '').trim() || (content ?? '').trim();
  const plainText = source ? stripMarkdownToText(source) : '';

  if (!plainText) {
    return fallback;
  }

  return plainText.length <= maxLength
    ? plainText
    : `${plainText.slice(0, maxLength).trimEnd()}...`;
}

export function buildPostShareUrl(slug: string) {
  const base = (import.meta.env.VITE_APP_URL as string | undefined)?.trim() || window.location.origin;
  const normalizedBase = base.replace(/\/+$/, '');
  return `${normalizedBase}/posts/${slug}`;
}

export async function copyPostShareLink(slug: string) {
  const shareUrl = buildPostShareUrl(slug);
  await navigator.clipboard.writeText(shareUrl);
  return shareUrl;
}

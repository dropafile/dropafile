const SHARE_MESSAGE = "Join my live file session on dropafile";

export function buildSessionShareMessage(shareUrl: string): string {
  return `${SHARE_MESSAGE}\n\n${shareUrl}`;
}

export function buildMailShareUrl(shareUrl: string): string {
  const subject = encodeURIComponent("Join my dropafile session");
  const body = encodeURIComponent(buildSessionShareMessage(shareUrl));
  return `mailto:?subject=${subject}&body=${body}`;
}

export function buildWhatsAppShareUrl(shareUrl: string): string {
  const text = encodeURIComponent(buildSessionShareMessage(shareUrl));
  return `https://wa.me/?text=${text}`;
}

export function openShareUrl(url: string): void {
  window.open(url, "_blank", "noopener,noreferrer");
}

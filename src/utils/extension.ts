export function extensionFromName(filename: string): string | null {
  const lastDot = filename.lastIndexOf(".");
  if (lastDot <= 0) {
    return null;
  }
  return filename.slice(lastDot + 1).toLowerCase();
}

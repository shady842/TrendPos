export function apiBase(): string {
  const u = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  return u.replace(/\/$/, "");
}

export function apiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${apiBase()}${p}`;
}

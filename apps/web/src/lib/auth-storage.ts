const KEY = "trendpos_access_token";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(KEY);
}

export function setAccessToken(token: string) {
  window.localStorage.setItem(KEY, token);
}

export function clearAccessToken() {
  window.localStorage.removeItem(KEY);
}

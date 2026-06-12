const TOKEN_KEY = 'vendit_token';

export function getToken(): string | null {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }
  } catch {
    // malformed token — treat as absent
    localStorage.removeItem(TOKEN_KEY);
    return null;
  }
  return token;
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

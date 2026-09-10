export type Role = "agricultor" | "acopio" | "exportadora";

export type AuthUser = {
  id: string;
  email: string;
  nombre: string;
  role: Role;
  loteId: string | null;
  comunidad: string;
  dni?: string | null;
  acopioId?: string | null;
  acopioNombre?: string | null;
  socio?: boolean;
};

const TOKEN_KEY = "at360_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(path, { ...init, headers });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error || `Error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

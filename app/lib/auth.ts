// ===================================================
//  Auth Utilities — JWT Token & User Management
//  Stores token + user in localStorage
// ===================================================

export interface AuthUser {
  id: number;
  username: string;
  role: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

const TOKEN_KEY = "chacotuto_token";
const USER_KEY = "chacotuto_user";

/**
 * Detecta dinámicamente la URL de la API basándose en el host actual.
 * Facilita el despliegue unificado (mismo host/puerto) y el desarrollo local.
 */
export function getApiUrl(): string {
  if (typeof window !== "undefined") {
    const { hostname, port, protocol } = window.location;

    // Si estamos en desarrollo local con Next (3000), apuntamos al backend (8080)
    if (hostname === "localhost" && port === "3000") {
      return "http://localhost:8080";
    }

    // En producción o servido por el backend Go, usamos el mismo origen
    return `${protocol}//${hostname}${port ? ":" + port : ""}`;
  }

  // Fallback para SSR o variables de entorno
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
}

/**
 * Login against the backend API.
 * POST /api/auth/login
 */
export async function loginApi(
  username: string,
  password: string
): Promise<LoginResponse> {
  const res = await fetch(`${getApiUrl()}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    // Try to extract error message from response
    let message = "Credenciales inválidas. Verifique usuario y contraseña.";
    try {
      const body = await res.json();
      if (body.error) message = body.error;
      if (body.message) message = body.message;
    } catch {
      // If response isn't JSON, use status text
      if (res.status === 401) {
        message = "Usuario o contraseña incorrectos.";
      } else if (res.status === 500) {
        message = "Error interno del servidor. Intente más tarde.";
      } else if (res.status === 0 || !res.status) {
        message =
          "No se pudo conectar al servidor. Verifique que el backend esté activo.";
      }
    }
    throw new Error(message);
  }

  const data: LoginResponse = await res.json();
  return data;
}

/**
 * Save authentication data to localStorage.
 */
export function saveAuth(token: string, user: AuthUser): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * Retrieve stored JWT token.
 */
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Retrieve stored user data.
 */
export function getUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

/**
 * Check if the current session might be invalid (e.g., token format).
 */
export function isTokenValid(token: string | null): boolean {
  if (!token) return false;
  // Basic check: JWT should have 2 dots
  return token.split(".").length === 3;
}

/**
 * Clear all auth data (logout).
 */
export function clearAuth(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  
  // Optional: Trigger a storage event to sync other tabs
  window.dispatchEvent(new Event("storage"));
}

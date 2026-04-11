"use client";

// ===================================================
//  AuthContext — Global Authentication State
//  Provides user, token, login, and logout to all
//  client components via React Context.
// ===================================================

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  AuthUser,
  loginApi,
  saveAuth,
  getToken,
  getUser,
  clearAuth,
} from "../lib/auth";

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean; // true while checking initial auth state
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Hook to access auth context.
 * Throws if used outside AuthProvider.
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  }
  return ctx;
}

/**
 * AuthProvider wraps the app and handles:
 * - Hydrating auth state from localStorage on mount
 * - Redirecting unauthenticated users away from /dashboard
 * - Redirecting authenticated users away from /login
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- Hydrate on mount ---
  useEffect(() => {
    const storedToken = getToken();
    const storedUser = getUser();
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  // --- Route protection ---
  useEffect(() => {
    if (isLoading) return; // Don't redirect while still hydrating

    const isDashboard = pathname.startsWith("/dashboard");
    const isLogin = pathname === "/login";
    const isRoot = pathname === "/";

    if (!token && (isDashboard || isRoot)) {
      // Not authenticated → kick to login
      router.replace("/login");
    } else if (token && (isLogin || isRoot)) {
      // Already authenticated → send to dashboard
      router.replace("/dashboard");
    }
  }, [isLoading, token, pathname, router]);

  // --- Login ---
  const login = useCallback(
    async (username: string, password: string) => {
      const data = await loginApi(username, password);
      saveAuth(data.token, data.user);
      setToken(data.token);
      setUser(data.user);
      router.replace("/dashboard");
    },
    [router]
  );

  // --- Logout ---
  const logout = useCallback(() => {
    clearAuth();
    setToken(null);
    setUser(null);
    router.replace("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

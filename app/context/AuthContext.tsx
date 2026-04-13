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
  isTokenValid,
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

  // --- Route protection & Content Guard ---
  useEffect(() => {
    if (isLoading) return;

    const isLoginPath = pathname === "/login";
    const isRootPath = pathname === "/";
    // Define private routes (anything that starts with /dashboard or /visor-vuelo)
    const isPrivatePath = pathname.startsWith("/dashboard") || pathname.startsWith("/visor-vuelo");

    if (!token && (isPrivatePath || isRootPath)) {
      router.replace("/login");
    } else if (token && (isLoginPath || isRootPath)) {
      router.replace("/dashboard");
    }
  }, [isLoading, token, pathname, router]);

  // Determine if we should show the content or a loader
  const isDashboard = pathname.startsWith("/dashboard");
  const isVisor = pathname.startsWith("/visor-vuelo");
  const isLogin = pathname === "/login";
  const isRootPath = pathname === "/";

  // Logic to prevent content flicker
  const shouldShowContent = 
    !isLoading && !isRootPath && (
      (token && (isDashboard || isVisor)) ||
      (!token && isLogin) ||
      (!isDashboard && !isVisor && !isLogin) // Other neutral paths
    );

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

  if (!shouldShowContent) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#05070a", color: "#00e5cc" }}>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", fontFamily: "monospace", fontSize: "12px", letterSpacing: "1px" }}>
          <div className="spinner" style={{ width: "16px", height: "16px", border: "2px solid rgba(0, 229, 204, 0.2)", borderTopColor: "#00e5cc", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
          <span>AUTENTICANDO SISTEMA...</span>
        </div>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

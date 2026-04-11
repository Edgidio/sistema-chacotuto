"use client";

import { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar/Sidebar";
import styles from "./layout.module.css";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { token, isLoading } = useAuth();

  // While checking auth state, show a loading indicator instead of nothing
  if (isLoading) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--hud-cyan)", background: "var(--void)" }}>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", fontFamily: "var(--font-mono), monospace", fontSize: "12px", letterSpacing: "1px" }}>
          <div className="spinner" style={{ width: "16px", height: "16px", border: "2px solid rgba(0, 229, 204, 0.2)", borderTopColor: "var(--hud-cyan)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
          <span>CARGANDO PANEL DE CONTROL...</span>
        </div>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  // If not authenticated, show nothing — AuthContext will redirect to /login
  if (!token) return null;

  return (
    <div className={styles.dashShell}>
      <Sidebar />
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}

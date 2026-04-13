"use client";

import { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar/Sidebar";
import styles from "./layout.module.css";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { token } = useAuth();

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

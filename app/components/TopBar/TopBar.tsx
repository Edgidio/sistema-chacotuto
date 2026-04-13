import { ReactNode } from "react";
import Link from "next/link";
import styles from "./TopBar.module.css";

interface TopBarProps {
  title: string;
  station?: string;
  unit?: string;
  backHref?: string;
  actions?: ReactNode;
}

export default function TopBar({ title, station = "GCS-01", unit, backHref, actions }: TopBarProps) {
  return (
    <header className={styles.topBar}>
      <div className={styles.headerLeft}>
        {backHref && (
          <Link href={backHref} className={styles.backBtn} title="Volver">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </Link>
        )}
        <div className={styles.headerContent}>
          <h2 className={styles.pageTitle}>{title}</h2>
          <div className={styles.tagGroup}>
            <div className={styles.tagItem}>
              ESTACIÓN: <span className={styles.serialTag}>{station}</span>
            </div>
            {unit && (
              <div className={styles.tagItem}>
                SISTEMA: <span className={styles.serialTag}>{unit}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className={styles.topBarRight}>
        {actions}
        
        <div className={styles.statusPill}>
          <span className={styles.statusDot} />
          Enlace Activo
        </div>
      </div>
    </header>
  );
}

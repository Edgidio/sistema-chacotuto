import { ReactNode } from "react";
import styles from "./TopBar.module.css";

interface TopBarProps {
  title: string;
  subtitle: string;
  actions?: ReactNode;
}

export default function TopBar({ title, subtitle, actions }: TopBarProps) {
  return (
    <header className={styles.topBar}>
      <div>
        <h2 className={styles.pageTitle}>{title}</h2>
        <p className={styles.pageSubtitle}>{subtitle}</p>
      </div>
      <div className={styles.topBarRight}>
        {actions}
        
        <div className={styles.statusPill}>
          <span className={styles.statusDot} />
          Sistema Operativo
        </div>
      </div>
    </header>
  );
}

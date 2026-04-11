import Link from "next/link";
import styles from "./DroneCard.module.css";

export interface DroneData {
  droneId: string;
  name: string;
  isOnline: boolean;
  status: string; // e.g. "idle"
  currentMission?: string; // ID of the mission if active
  lastAlt: number;
  lastLat: number;
  lastLng: number;
  lastHeartbeat: string;
  createdAt: string;
}

interface DroneCardProps {
  drone: DroneData;
}

export default function DroneCard({ drone }: DroneCardProps) {
  return (
    <div className={styles.droneCard} data-status={drone.isOnline ? "online" : "offline"}>
      <div className={styles.cardHeader}>
        <div className={styles.cardIdGroup}>
          <span className={styles.droneModelIcon}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
          </span>
          <h3 className={styles.droneId}>{drone.droneId.substring(0, 18)}...</h3>
        </div>
        <span className={styles.statusBadge} data-status={drone.isOnline ? "online" : "offline"}>
          {drone.isOnline ? "EN LÍNEA" : "OFFLINE"}
        </span>
      </div>

      <div className={styles.cardMetrics}>
        <div className={styles.metricBlock}>
          <span className={styles.metricLabel}>ESTADO</span>
          <span className={styles.metricValue}>
            <span style={{ color: drone.isOnline ? 'var(--telemetry-green)' : 'var(--ink-muted)', textTransform: 'uppercase' }}>
              {drone.status || "DESCONOCIDO"}
            </span>
          </span>
        </div>
        <div className={styles.metricBlock}>
          <span className={styles.metricLabel}>COORD T</span>
          <span className={styles.metricValue}>
             {drone.lastLat.toFixed(2)}, {drone.lastLng.toFixed(2)}
          </span>
        </div>
        <div className={styles.metricBlock}>
          <span className={styles.metricLabel}>ALTITUD</span>
          <span className={styles.metricValue}>{drone.lastAlt.toFixed(1)}m</span>
        </div>
        <div className={styles.metricBlock}>
          <span className={styles.metricLabel}>LATIDO</span>
          <span className={styles.metricValue} style={{ color: 'var(--ink-tertiary)', fontSize: '10px' }}>
            {new Date(drone.lastHeartbeat).toLocaleTimeString('en-US', { hour12: false }) || "--"}
          </span>
        </div>
      </div>

      <div className={styles.cardActions}>
        <Link 
          href={`/dashboard/flota/mision?droneId=${drone.droneId}`} 
          className={styles.btnSecondary} 
          style={!drone.isOnline ? { pointerEvents: 'none', opacity: 0.5 } : {}}
          aria-disabled={!drone.isOnline}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m12 16 4-4-4-4"/><path d="M8 12h8"/></svg>
          Orden de Misión
        </Link>
        <Link 
          href={`/visor-vuelo?droneId=${drone.droneId}`} 
          className={styles.btnIcon} 
          aria-label="Visor Táctico 3D (Horizonte Artificial)"
          style={(!drone.isOnline || !drone.currentMission) ? { pointerEvents: 'none', opacity: 0.5, filter: 'grayscale(1)' } : {color: 'var(--hud-cyan)', borderColor: 'rgba(14, 165, 233, 0.3)'}}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
        </Link>
        <Link href={`/dashboard/flota/historial?droneId=${drone.droneId}`} className={styles.btnIcon} aria-label="Historial de misiones">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </Link>
      </div>
    </div>
  );
}

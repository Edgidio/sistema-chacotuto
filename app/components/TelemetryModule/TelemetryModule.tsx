import styles from "./TelemetryModule.module.css";

// Mock data representing global fleet telemetry or a selected drone
const telemetryStats = {
  signalStrength: "-42 dBm",
  linkQuality: "98%",
  gpsSatellites: 18,
  packetLoss: "0.02%",
};

export default function TelemetryModule() {
  return (
    <div className={styles.telemetryContainer}>
      
      {/* Top metrics row */}
      <div className={styles.metricsRow}>
        <div className={styles.metricPanel}>
          <div className={styles.panelHeader}>
            <h3 className={styles.panelTitle}>Signal Strength</h3>
            <svg className={styles.panelIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20h.01"/><path d="M7 20v-4"/><path d="M12 20v-8"/><path d="M17 20V8"/><path d="M22 4v16"/></svg>
          </div>
          <div className={styles.mainValue}>{telemetryStats.signalStrength}</div>
          <div className={styles.subValue}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
            Excelente
          </div>
        </div>

        <div className={styles.metricPanel}>
          <div className={styles.panelHeader}>
            <h3 className={styles.panelTitle}>Link Quality</h3>
            <svg className={styles.panelIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2v4"/><path d="M12 18v4"/><path d="M4.93 4.93l2.83 2.83"/><path d="M16.24 16.24l2.83 2.83"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="M4.93 19.07l2.83-2.83"/><path d="M16.24 7.76l2.83-2.83"/></svg>
          </div>
          <div className={styles.mainValue}>{telemetryStats.linkQuality}</div>
          <div className={styles.subValue}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
            Estable
          </div>
        </div>

        <div className={styles.metricPanel}>
          <div className={styles.panelHeader}>
            <h3 className={styles.panelTitle}>GPS Lock</h3>
            <svg className={styles.panelIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
          </div>
          <div className={styles.mainValue}>{telemetryStats.gpsSatellites}</div>
          <div className={styles.subValue}>
            satélites en vista
          </div>
        </div>

        <div className={styles.metricPanel}>
          <div className={styles.panelHeader}>
            <h3 className={styles.panelTitle}>Packet Loss</h3>
            <svg className={styles.panelIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
          </div>
          <div className={styles.mainValue}>{telemetryStats.packetLoss}</div>
          <div className={`${styles.subValue} ${styles.warn}`}>
            Marginal
          </div>
        </div>
      </div>

      {/* Main chart layout */}
      <div className={styles.chartSection}>
        <div className={styles.panelHeader}>
          <h3 className={styles.panelTitle}>Integridad de Enlace de Radio (MavLink)</h3>
        </div>
        
        {/* Abstract mock chart via pure CSS */}
        <div className={styles.chartCanvas}>
          <div className={styles.chartGrid} />
          <div className={styles.chartLine} />
          <span className={styles.chartPlaceholder}>[ GRÁFICO ESPECTRAL RESERVADO PARA WEBSOCKET ]</span>
        </div>
      </div>

    </div>
  );
}

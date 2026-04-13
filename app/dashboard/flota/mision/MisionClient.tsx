"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MapWrapper from "../../../components/MissionMap/MapWrapper";
import { Waypoint } from "../../../components/MissionMap/MissionMap";
import { getApiUrl, getToken } from "../../../lib/auth";
import TopBar from "../../../components/TopBar/TopBar";
import styles from "./Mision.module.css";

export default function MisionClient({ droneId }: { droneId: string }) {
  const router = useRouter();

  const [startPoint, setStartPoint] = useState<Waypoint | null>(null);
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleMapClick = (lat: number, lng: number) => {
    if (!startPoint) {
      setStartPoint({ lat, lng, alt: 0, action: "start", index: 0 });
      return;
    }

    const isFirstWaypoint = waypoints.length === 0;
    const newIdx = waypoints.length + 1;
    const action = isFirstWaypoint ? "takeoff" : "waypoint";
    
    setWaypoints([
      ...waypoints, 
      { lat, lng, alt: 50, action, index: newIdx }
    ]);
  };

  const updateWaypoint = (indexToUpdate: number, field: keyof Waypoint, value: any) => {
    setWaypoints(waypoints.map(wp => 
      wp.index === indexToUpdate ? { ...wp, [field]: value } : wp
    ));
  };

  const removeWaypoint = (indexToRemove: number) => {
    const filtered = waypoints.filter(wp => wp.index !== indexToRemove);
    const reindexed = filtered.map((wp, i) => ({ ...wp, index: i + 1 }));
    setWaypoints(reindexed);
  };

  const sendMission = async () => {
    if (!startPoint || waypoints.length === 0) {
      setErrorMsg("Error: Se requiere punto HOME y al menos un Waypoint operacional.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    const payload = {
      droneId,
      startPoint,
      waypoints
    };

    try {
      const token = getToken();
      const res = await fetch(`${getApiUrl()}/api/missions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error("Transmisión de misión interrumpida por el servidor.");
      }

      setShowSuccessModal(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Error Crítico en el Enlace de Radio");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <TopBar 
        title="Planificador de Vuelo Táctico" 
        unit={`TARGET-${droneId.slice(-6).toUpperCase()}`}
        backHref="/dashboard/flota"
        actions={
          <div className={styles.actionBtns}>
            <button 
              className={styles.resetBtn}
              onClick={() => { setStartPoint(null); setWaypoints([]); setErrorMsg(""); }}
            >
              ABORTAR / RESET
            </button>
            <button 
              className={styles.dispatchBtn}
              onClick={sendMission}
              disabled={isSubmitting || !startPoint || waypoints.length === 0}
            >
              {isSubmitting ? "TRANSMITIENDO..." : "DESPACHAR MISIÓN"}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        }
      />

      <div className={styles.content}>
        <aside className={styles.sidebar}>
          {errorMsg && (
            <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid var(--telemetry-red)", color: "var(--telemetry-red)", padding: "12px", borderRadius: "4px", fontSize: "11px", marginBottom: "16px", fontFamily: "var(--font-mono)" }}>
              &gt; ALERT: {errorMsg}
            </div>
          )}

          <div className={styles.hintBox}>
             <h3 className={styles.sectionTitle} style={{marginTop: 0}}>Procedimiento</h3>
             <p className={styles.hintText}>
               Pulse en el mapa para establecer el punto <strong>HOME</strong>. 
               Defina la ruta operativa añadiendo Waypoints secuenciales.
             </p>
          </div>

          <h3 className={styles.sectionTitle}>Secuencia de Vuelo</h3>
          
          {/* HOME CARD */}
          <div className={`${styles.taskCard} ${styles.taskCardHome}`}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle} style={{color: "var(--telemetry-green)"}}>00. UNIT_HOME / TAKEOFF</span>
            </div>
            {startPoint ? (
              <div style={{ fontSize: "11px", color: "var(--ink-secondary)", fontFamily: "var(--font-mono)", lineHeight: 1.6 }}>
                GPS_LAT: {startPoint.lat.toFixed(6)}<br/>
                GPS_LNG: {startPoint.lng.toFixed(6)}<br/>
                ALT_REF: MSL (0.00m)
              </div>
            ) : (
              <div style={{ fontSize: "11px", color: "var(--ink-muted)", fontStyle: "italic" }}>Esperando señal GPS en mapa...</div>
            )}
          </div>

          {/* WAYPOINTS LIST (REVERSED) */}
          {[...waypoints].reverse().map((wp) => (
            <div key={wp.index} className={styles.taskCard}>
              <div className={styles.cardHeader}>
                <span className={styles.cardTitle}>
                  {wp.index.toString().padStart(2, '0')}. OPERATIONAL_WP
                </span>
                <button className={styles.removeBtn} onClick={() => removeWaypoint(wp.index)} title="Remover Tarea">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>

              <div className={styles.fieldRow}>
                <label className={styles.label}>ACCIÓN:</label>
                <select 
                  className={styles.select}
                  value={wp.action}
                  onChange={(e) => updateWaypoint(wp.index, "action", e.target.value)}
                >
                  <option value="takeoff">Takeoff</option>
                  <option value="waypoint">Waypoint</option>
                  <option value="loiter">Loiter (Circle)</option>
                  <option value="land">Land</option>
                </select>
              </div>

              <div className={styles.fieldRow}>
                <label className={styles.label}>ALT (m):</label>
                <input 
                  type="number" 
                  className={styles.input}
                  value={wp.alt}
                  onChange={(e) => updateWaypoint(wp.index, "alt", parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          ))}

          {waypoints.length === 0 && startPoint && (
             <div style={{ textAlign: "center", padding: "32px 0", color: "var(--ink-muted)", fontSize: "12px" }}>
                Pulse en el mapa para añadir waypoints...
             </div>
          )}
        </aside>

        <main className={styles.mapArea}>
          <MapWrapper 
            waypoints={waypoints} 
            startPoint={startPoint} 
            onMapClick={handleMapClick} 
          />
        </main>
      </div>

      {showSuccessModal && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <div className={styles.pulsar} />
              <h3 className={styles.modalTitle}>ENLACE DE DATOS CONFIRMADO</h3>
            </div>
            
            <div className={styles.modalBody}>
              <p className={styles.modalText}>
                La planificación táctica ha sido inyectada correctamente en la memoria de abordo del dron 
                <strong style={{ color: "var(--hud-cyan)", fontFamily: "var(--font-mono)", marginLeft: "4px" }}>
                  {droneId}
                </strong>.
              </p>
              
              <div className={styles.statusLog}>
                <span className={styles.logLine}>&gt; TRANSMISSION: VERIFIED_OK</span>
                <span className={styles.logLine}>&gt; PROTOCOL: MAVLINK_V2_ENC</span>
                <span className={styles.logLine}>&gt; PAYLOAD_SIZE: {JSON.stringify({startPoint, waypoints}).length} bytes</span>
                <span className={styles.logLine}>&gt; TASKS_COUNT: {waypoints.length + 1} points</span>
              </div>
            </div>
            
            <div className={styles.modalFooter}>
              <button 
                className={styles.finishBtn}
                onClick={() => router.push("/dashboard/flota")}
              >
                PROCESAR A ESTACIÓN DE MANDO &rarr;
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

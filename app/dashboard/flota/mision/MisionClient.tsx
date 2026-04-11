"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MapWrapper from "../../../components/MissionMap/MapWrapper";
import { Waypoint } from "../../../components/MissionMap/MissionMap";
import { getApiUrl, getToken } from "../../../lib/auth";

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
      setErrorMsg("Debe definir un punto de inicio y al menos un waypoint.");
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
        throw new Error("Error enviando la misión terrestre");
      }

      setShowSuccessModal(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Error desconocido");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <header style={{ 
        display: "flex", alignItems: "center", justifyContent: "space-between", 
        padding: "var(--space-4) var(--space-6)", borderBottom: "1px solid var(--wire)", background: "var(--void)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
          <Link href="/dashboard/flota" style={{ color: "var(--ink-muted)", textDecoration: "none", fontSize: "14px" }}>
            &larr; Volver
          </Link>
          <div style={{ width: "1px", height: "24px", background: "var(--wire)" }} />
          <div>
            <h2 style={{ fontSize: "16px", fontWeight: 600, color: "var(--ink-primary)", margin: 0 }}>Planificador de Vuelo</h2>
            <p style={{ fontSize: "12px", color: "var(--ink-tertiary)", margin: "4px 0 0", fontFamily: "var(--font-mono)" }}>
              TARGET: <span style={{ color: "var(--hud-cyan)" }}>{droneId}</span>
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "var(--space-3)" }}>
          <button 
            onClick={() => { setStartPoint(null); setWaypoints([]); setErrorMsg(""); }}
            style={{ 
              background: "transparent", border: "1px solid var(--control-border)", 
              color: "var(--ink-secondary)", padding: "0 var(--space-4)", borderRadius: "var(--radius-sm)",
              fontSize: "12px", fontFamily: "var(--font-mono)", cursor: "pointer"
            }}
          >
            RESETEAR
          </button>
          <button 
            onClick={sendMission}
            disabled={isSubmitting || !startPoint || waypoints.length === 0}
            style={{ 
              background: "rgba(0, 229, 204, 0.1)", border: "1px solid var(--hud-cyan)", 
              color: "var(--hud-cyan)", padding: "8px 16px", borderRadius: "100px",
              fontSize: "12px", fontFamily: "var(--font-mono)", fontWeight: 600, cursor: "pointer",
              opacity: isSubmitting || !startPoint || waypoints.length === 0 ? 0.5 : 1,
              display: "flex", alignItems: "center", gap: "8px"
            }}
          >
            {isSubmitting ? "ENVIANDO..." : "DESPACHAR MISIÓN"}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      </header>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <aside style={{ 
          width: "320px", background: "var(--surface-flat)", borderRight: "1px solid var(--wire)",
          display: "flex", flexDirection: "column", overflowY: "auto", padding: "var(--space-4)"
        }}>
          {errorMsg && (
            <div style={{ background: "rgba(220, 38, 38, 0.1)", border: "1px solid var(--telemetry-red)", color: "var(--telemetry-red)", padding: "var(--space-3)", borderRadius: "var(--radius-sm)", fontSize: "12px", marginBottom: "var(--space-4)" }}>
              {errorMsg}
            </div>
          )}

          <div style={{ marginBottom: "var(--space-6)" }}>
            <h3 style={{ fontSize: "11px", color: "var(--ink-tertiary)", letterSpacing: "1px", margin: "0 0 var(--space-2) 0" }}>INSTRUCCIONES</h3>
            <p style={{ fontSize: "13px", color: "var(--ink-secondary)", lineHeight: 1.5, margin: 0 }}>
              Da clic en el mapa para marcar el punto HOME.
              Sucesivos clics añadirán nuevos Waypoints a la ruta operativa.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            <div style={{ 
              background: startPoint ? "rgba(34, 197, 94, 0.05)" : "var(--void)", 
              border: `1px solid ${startPoint ? "rgba(34, 197, 94, 0.3)" : "var(--wire)"}`,
              padding: "var(--space-3)", borderRadius: "var(--radius-sm)", borderLeft: "3px solid var(--telemetry-green)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-2)" }}>
                <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--telemetry-green)" }}>HOME / TAKEOFF</span>
              </div>
              {startPoint ? (
                <div style={{ fontSize: "11px", color: "var(--ink-secondary)", fontFamily: "var(--font-mono)" }}>
                  LAT: {startPoint.lat.toFixed(5)}<br/>
                  LNG: {startPoint.lng.toFixed(5)}<br/>
                  ALT: Suelo (0m)
                </div>
              ) : (
                <div style={{ fontSize: "11px", color: "var(--ink-muted)", fontStyle: "italic" }}>Esperando coordenadas...</div>
              )}
            </div>

            {waypoints.map((wp) => (
              <div key={wp.index} style={{ 
                background: "var(--void)", border: "1px solid var(--wire)",
                padding: "var(--space-3)", borderRadius: "var(--radius-sm)", borderLeft: `3px solid var(--hud-cyan)`
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-3)" }}>
                  <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--ink-primary)" }}>
                    WAYPOINT {wp.index}
                  </span>
                  <button 
                    onClick={() => removeWaypoint(wp.index)}
                    style={{ background: "transparent", border: "none", color: "var(--ink-tertiary)", cursor: "pointer", padding: "4px" }}
                    title="Eliminar WP"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <label style={{ fontSize: "10px", color: "var(--ink-tertiary)", width: "50px" }}>ACCIÓN:</label>
                    <select 
                      value={wp.action}
                      onChange={(e) => updateWaypoint(wp.index, "action", e.target.value)}
                      style={{ 
                        flex: 1, background: "var(--control-bg)", border: "1px solid var(--control-border)", 
                        color: "var(--ink-primary)", fontSize: "12px", padding: "4px 8px", borderRadius: "md",
                        fontFamily: "var(--font-mono)"
                      }}
                    >
                      <option value="takeoff">Takeoff</option>
                      <option value="waypoint">Waypoint</option>
                      <option value="loiter">Loiter (Rotar)</option>
                      <option value="land">Land</option>
                    </select>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <label style={{ fontSize: "10px", color: "var(--ink-tertiary)", width: "50px" }}>ALT (m):</label>
                    <input 
                      type="number" 
                      value={wp.alt}
                      onChange={(e) => updateWaypoint(wp.index, "alt", parseFloat(e.target.value) || 0)}
                      style={{ 
                        flex: 1, background: "var(--control-bg)", border: "1px solid var(--control-border)", 
                        color: "var(--ink-primary)", fontSize: "12px", padding: "4px 8px", borderRadius: "md",
                        fontFamily: "var(--font-mono)"
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>

        <main style={{ flex: 1, position: "relative" }}>
          <MapWrapper 
            waypoints={waypoints} 
            startPoint={startPoint} 
            onMapClick={handleMapClick} 
          />
        </main>
      </div>

      {showSuccessModal && (
        <div style={{ 
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, 
          display: "flex", alignItems: "center", justifyContent: "center", 
          background: "rgba(2, 4, 10, 0.8)", backdropFilter: "blur(4px)" 
        }}>
          <div style={{ 
            width: "420px", background: "var(--surface-flat)", border: "1px solid var(--wire)", 
            borderRadius: "4px", display: "flex", flexDirection: "column",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)"
          }}>
            <div style={{ padding: "var(--space-4)", borderBottom: "1px solid var(--wire)", display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--telemetry-green)", boxShadow: "0 0 8px var(--telemetry-green)", animation: "pulse 2s infinite" }} />
              <h3 style={{ margin: 0, fontSize: "14px", color: "var(--ink-primary)", fontFamily: "var(--font-mono)", letterSpacing: "1px" }}>ENLACE ESTABLECIDO</h3>
            </div>
            
            <div style={{ padding: "var(--space-6) var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
              <p style={{ margin: 0, fontSize: "14px", color: "var(--ink-secondary)", lineHeight: 1.5 }}>
                La misión terrestre ha sido transmitida y verificada exitosamente en la computadora de abordo del dron <strong style={{ color: "var(--hud-cyan)", fontFamily: "var(--font-mono)" }}>{droneId}</strong>.
              </p>
              
              <div style={{ background: "rgba(16, 185, 129, 0.05)", border: "1px dashed var(--telemetry-green)", padding: "var(--space-3)", borderRadius: "2px" }}>
                <span style={{ fontSize: "12px", color: "var(--telemetry-green)", fontFamily: "var(--font-mono)", display: "block", marginBottom: "4px" }}>&gt; ESTADO: RECIBIDA_Y_CONFIRMADA</span>
                <span style={{ fontSize: "12px", color: "var(--telemetry-green)", fontFamily: "var(--font-mono)", display: "block", marginBottom: "4px" }}>&gt; TIPO PROTOCOLO: MAVLINK / WEBSOCKET</span>
                <span style={{ fontSize: "12px", color: "var(--telemetry-green)", fontFamily: "var(--font-mono)", display: "block" }}>&gt; TOTAL WAYPOINTS: {waypoints.length + 1}</span>
              </div>
            </div>
            
            <div style={{ padding: "var(--space-4)", background: "var(--void)", borderTop: "1px solid var(--wire)", display: "flex", justifyContent: "flex-end" }}>
              <button 
                onClick={() => router.push("/dashboard/flota")}
                style={{ 
                  background: "var(--ink-primary)", border: "none", color: "var(--void)", 
                  padding: "8px 24px", borderRadius: "100px", fontSize: "12px", fontFamily: "var(--font-mono)", 
                  fontWeight: 600, cursor: "pointer", transition: "opacity 0.2s"
                }}
              >
                PROCESAR A FLOTA &rarr;
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

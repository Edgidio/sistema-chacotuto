"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { TBox } from "../TacticalUI/layout/TBox";
import { MButton } from "../TacticalUI/layout/MButton";
import { PrimaryFlightDisplay } from "../TacticalUI/PrimaryFlightDisplay";
import { MiniHUD } from "../TacticalUI/MiniHUD";
import { HSICompass } from "../TacticalUI/HSICompass";

// Lazy load del pesado WebGL (Regla Vercel: bundle-dynamic-imports)
const DroneTacticalNav = dynamic(() => import("../TacticalUI/DroneTacticalNav"), {
  ssr: false,
  loading: () => <div style={{ height: "220px", display: "flex", alignItems: "center", justifyContent: "center", background: "#06080d", color: "var(--ink-secondary)", fontSize: "11px" }}>Loading 3D...</div>
});

const TacticalMapLive = dynamic(() => import("../TacticalUI/TacticalMapLive"), {
  ssr: false,
  loading: () => <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#02040a", color: "var(--hud-cyan)" }}>CARGANDO MAPA TÁCTICO...</div>
});

import { TelemetryDataDashboard } from "../TacticalUI/TelemetryDataDashboard";
import { TacticalGPSDashboard } from "../TacticalUI/TacticalGPSDashboard";

export default function FlightViewer3D({
  droneId, pitch, roll, yaw, altitude, speed, waitingAcceptance,
  gps, waypoints, startPoint, currentWaypointIndex, battery, isOnline
}: {
  droneId: string; pitch: number; roll: number; yaw: number; altitude: number; speed: number; waitingAcceptance?: boolean;
  gps?: { lat: number; lng: number }; waypoints?: any[]; startPoint?: any; currentWaypointIndex?: number;
  battery?: { level: number; isCharging: boolean }; isOnline?: boolean;
}) {
  const [activeTab, setActiveTab] = useState("Cabina");
  const [time, setTime] = useState("00:00:00");
  const [showMap, setShowMap] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "warn" } | null>(null);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    const i = setInterval(() => setTime(new Date().toLocaleTimeString('en-US', { hour12: true })), 1000);
    return () => clearInterval(i);
  }, []);

  const showToast = (msg: string, type: "success" | "warn") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleCamera = () => {
    showToast("SISTEMA DE CÁMARA PRINCIPAL AÚN NO IMPLEMENTADO", "warn");
  };

  const handleCapture = () => {
    setFlash(true);
    setTimeout(() => setFlash(false), 150);

    // Generate Tactical Snapshot
    const canvas = document.createElement("canvas");
    canvas.width = 600; canvas.height = 400;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#02040a";
      ctx.fillRect(0, 0, 600, 400);
      ctx.strokeStyle = "rgba(0, 229, 204, 0.2)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for(let i=0; i<600; i+=40) { ctx.moveTo(i, 0); ctx.lineTo(i, 400); }
      for(let i=0; i<400; i+=40) { ctx.moveTo(0, i); ctx.lineTo(600, i); }
      ctx.stroke();

      ctx.fillStyle = "#00e5cc";
      ctx.font = "bold 16px monospace";
      ctx.fillText("PEVITE TACTICAL SNAPSHOT", 20, 30);
      ctx.font = "12px monospace";
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.fillText(`DRONE ID: ${droneId}`, 20, 60);
      ctx.fillText(`COORDENADAS: ${gps?.lat.toFixed(6) || 0}, ${gps?.lng.toFixed(6) || 0}`, 20, 80);
      ctx.fillText(`ALTITUD ACTUAL: ${altitude.toFixed(1)} m`, 20, 100);
      ctx.fillText(`VELOCIDAD TIERRA: ${speed.toFixed(1)} km/h`, 20, 120);
      ctx.fillText(`FECHA/HORA: ${new Date().toISOString()}`, 20, 140);
    }
    
    // Trigger download target
    const link = document.createElement("a");
    link.download = `captura-tactica-${droneId}-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();

    showToast("CAPTURA GEOESPACIAL GUARDADA EN DISCO LOCAL", "success");
  };

  return (
    <div style={{
      width: "100%", height: "100vh", backgroundColor: "#02040a",
      display: "flex", flexDirection: "column", fontFamily: "var(--font-mono)",
      color: "var(--ink-primary)", overflow: "hidden", userSelect: "none", position: "relative"
    }}>

      {/* FLASH SCREEN EFFECT */}
      {flash && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.8)", zIndex: 9999, pointerEvents: "none" }} />
      )}

      {/* TACTICAL TOAST NOTIFICATION */}
      {toast && (
        <div style={{ 
          position: "absolute", top: 80, left: "50%", transform: "translateX(-50%)", zIndex: 9998,
          background: toast.type === "success" ? "rgba(22, 101, 52, 0.9)" : "rgba(180, 83, 9, 0.9)",
          border: `1px solid ${toast.type === "success" ? "#4ade80" : "#fbbf24"}`,
          boxShadow: `0 0 20px ${toast.type === "success" ? "rgba(74, 222, 128, 0.2)" : "rgba(251, 191, 36, 0.2)"}`,
          padding: "12px 24px", borderRadius: "4px", display: "flex", alignItems: "center", gap: "12px",
          color: "white", fontSize: "12px", fontWeight: "bold", letterSpacing: "1px",
          animation: "slide-down 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards"
        }}>
          {toast.type === "success" ? (
             <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 8px #4ade80" }} />
          ) : (
             <div style={{ width: 0, height: 0, borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderBottom: "8px solid #fbbf24" }} />
          )}
          {toast.msg}
        </div>
      )}

      {/* HEADER */}
      <header style={{ display: "flex", flexDirection: "column", background: "#0a0d14", borderBottom: "1px solid var(--wire)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button
              onClick={() => window.history.back()}
              style={{ background: "transparent", border: "1px solid var(--wire)", color: "var(--ink-secondary)", padding: "4px 8px", borderRadius: "4px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "10px" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
              ATRÁS
            </button>
            <div style={{ borderLeft: "1px solid var(--wire)", height: "24px", margin: "0 4px" }} />
            <div>
              <h1 style={{ margin: 0, fontSize: "20px", color: "var(--ink-primary)", fontWeight: "900", letterSpacing: "2px", lineHeight: 1 }}>
                <span style={{ color: "var(--hud-cyan)" }}>PE</span>VITE
                <span style={{ fontSize: "12px", marginLeft: "8px", fontWeight: "400", color: "var(--ink-muted)", verticalAlign: "middle" }}>TACTICAL GCS</span>
              </h1>
              <div style={{ fontSize: "9px", color: "var(--ink-tertiary)", fontFamily: "var(--font-mono)", marginTop: "2px" }}>ESTACIÓN DE COMANDO • {droneId}</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: isOnline ? "var(--telemetry-green)" : "var(--telemetry-red)", fontSize: "11px", fontWeight: "bold", textShadow: isOnline ? "0 0 10px rgba(0, 255, 157, 0.3)" : "none" }}>
                {isOnline ? "EN LÍNEA" : "ESPERANDO RECONEXIÓN"}
              </span>
              <div style={{ display: "flex", gap: "2px" }}>
                {[1, 2, 3, 4].map(i => <div key={i} style={{ width: 4, height: 12, background: (isOnline && i < 4) ? "var(--telemetry-green)" : "var(--wire)", borderRadius: "1px", opacity: isOnline ? 1 : 0.3 }} />)}
              </div>
            </div>

            <div style={{
              display: "flex", alignItems: "center", gap: "8px",
              background: battery && battery.level <= 20 ? "rgba(220, 38, 38, 0.1)" : "rgba(0, 229, 204, 0.1)",
              padding: "4px 10px", borderRadius: "4px", border: `1px solid ${battery && battery.level <= 20 ? "var(--telemetry-red)" : "var(--hud-cyan)"}`
            }}>
              <span style={{ fontSize: "10px", color: battery && battery.level <= 20 ? "var(--telemetry-red)" : "var(--hud-cyan)", fontWeight: "bold" }}>
                BATERÍA: {battery ? `${battery.level}%` : "--"} {battery?.isCharging ? "⚡" : ""}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "8px", color: "var(--ink-tertiary)" }}>HORA LOCAL</div>
                <div style={{ fontSize: "14px", color: "var(--hud-cyan)", fontWeight: "bold" }}>{time}</div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", padding: "0 8px", borderBottom: "1px solid var(--wire)", background: "#06080d" }}>
          {["Cabina", "Datos", "Sistema", "Conexión", "GPS", "Rastreo 3D"].map((tab) => {
            const isActive = tab === activeTab;
            return (
              <div 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "8px 16px", fontSize: "11px", fontWeight: isActive ? "bold" : "normal",
                  color: isActive ? "var(--telemetry-green)" : "var(--ink-secondary)",
                  borderBottom: isActive ? "2px solid var(--telemetry-green)" : "2px solid transparent", 
                  cursor: "pointer", transition: "all 0.2s"
              }}>
                {tab}
              </div>
            );
          })}
        </div>
      </header>

      {/* MID CONTENT AREA */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>

        {/* OVERLAY DE ESPERA / DESCONEXIÓN */}
        {(waitingAcceptance || !isOnline) && (
          <div style={{ position: "absolute", inset: 0, zIndex: 9999, background: "rgba(2, 4, 10, 0.5)", backdropFilter: "blur(2px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: !isOnline ? "var(--telemetry-red)" : "var(--telemetry-amber)", fontFamily: "var(--font-mono)" }}>
            
            {/* Si está offline, mostramos el aviso de conexión perdida */}
            {!isOnline && !waitingAcceptance ? (
              <div style={{ border: "1px dashed var(--telemetry-red)", padding: "24px 48px", borderRadius: "8px", background: "rgba(220, 38, 38, 0.1)", textAlign: "center", boxShadow: "0 0 32px rgba(220, 38, 38, 0.15)" }}>
                <div style={{ width: "48px", height: "48px", margin: "0 auto 16px", borderRadius: "50%", border: "2px solid var(--telemetry-red)", display: "flex", alignItems: "center", justifyContent: "center", animation: "pulse-red 2s infinite" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </div>
                <h2 style={{ letterSpacing: "2px", margin: 0, fontSize: "16px", textShadow: "0 0 8px rgba(220, 38, 38, 0.5)" }}>CONEXIÓN PERDIDA</h2>
                <p style={{ fontSize: "11px", color: "var(--ink-secondary)", marginTop: "12px", maxWidth: "300px", marginInline: "auto" }}>
                  Esperando reconexión. Mostrando los últimos datos de posición conocidos.
                </p>
              </div>
            ) : null}

            {/* Si estamos esperando aceptación y sí hay conexión (o si están ambas pero priorizamos aceptación) */}
            {waitingAcceptance && (
              <div style={{ border: "1px dashed var(--telemetry-amber)", padding: "24px 48px", borderRadius: "8px", background: "rgba(245, 158, 11, 0.1)", textAlign: "center", boxShadow: "0 0 32px rgba(245, 158, 11, 0.15)" }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: "16px", filter: "drop-shadow(0 0 8px rgba(245, 158, 11, 0.5))" }}>
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
                <h2 style={{ letterSpacing: "2px", margin: 0, fontSize: "16px", textShadow: "0 0 8px rgba(245, 158, 11, 0.5)" }}>ESPERANDO ACEPTACIÓN DEL OPERADOR</h2>
                <p style={{ fontSize: "11px", color: "var(--ink-secondary)", marginTop: "12px", maxWidth: "300px", marginInline: "auto" }}>
                  La telemetría y el enlace 3D en vivo iniciarán en cuanto el dron confirme la recepción de la orden de misión.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "Datos" ? (
          <TelemetryDataDashboard 
             droneId={droneId} roll={roll} pitch={pitch} yaw={yaw} 
             altitude={altitude} speed={speed} gps={gps} battery={battery} 
          />
        ) : activeTab === "Cabina" ? (
          <div style={{ display: "flex", gap: "12px", padding: "12px", width: "100%", height: "100%", opacity: (waitingAcceptance || !isOnline) ? 0.3 : 1, pointerEvents: (waitingAcceptance || !isOnline) ? "none" : "auto", transition: "opacity 0.3s ease" }}>
            {/* LEFT COMPASS PANEL */}
            <div style={{ width: "320px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <HSICompass yaw={waitingAcceptance ? 0 : yaw} />
            <TBox title="DATOS GIROSCOPIO" color="#8b5cf6">
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", background: "rgba(139, 92, 246, 0.1)", padding: "6px", borderRadius: "4px", border: "1px solid rgba(139, 92, 246, 0.3)" }}>
                  <span style={{ fontSize: "10px", color: "var(--ink-secondary)" }}>CABECEO (Θ)</span>
                  <span style={{ fontSize: "12px", color: "#c4b5fd", fontWeight: "bold" }}>{waitingAcceptance ? "0.00" : pitch.toFixed(2)}°</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", background: "rgba(139, 92, 246, 0.1)", padding: "6px", borderRadius: "4px", border: "1px solid rgba(139, 92, 246, 0.3)" }}>
                  <span style={{ fontSize: "10px", color: "var(--ink-secondary)" }}>ALABEO (Φ)</span>
                  <span style={{ fontSize: "12px", color: "#c4b5fd", fontWeight: "bold" }}>{waitingAcceptance ? "0.00" : roll.toFixed(2)}°</span>
                </div>
              </div>
            </TBox>
          </div>

          {/* CENTER PANEL: PFD OR MAP */}
          {showMap ? (
            <div style={{ flex: 1, minWidth: "400px", position: "relative" }}>
              <TacticalMapLive
                dronePos={gps || { lat: 0, lng: 0 }}
                waypoints={waypoints || []}
                startPoint={startPoint || null}
                currentWaypointIndex={currentWaypointIndex || 0}
              />
              <div style={{ position: "absolute", top: 15, right: 15, zIndex: 1000, pointerEvents: "none" }}>
                 <MiniHUD pitch={waitingAcceptance ? 0 : pitch} roll={waitingAcceptance ? 0 : roll} yaw={waitingAcceptance ? 0 : yaw} />
              </div>
              <button
                onClick={() => setShowMap(false)}
                style={{ position: "absolute", top: 15, right: 180, zIndex: 1001, background: "rgba(0,0,0,0.6)", border: "1px solid var(--hud-cyan)", color: "white", padding: "6px 12px", fontSize: "12px", cursor: "pointer", borderRadius: "4px" }}
              >
                CERRAR MAPA [ESC]
              </button>
            </div>
          ) : (
            <PrimaryFlightDisplay pitch={waitingAcceptance ? 0 : pitch} roll={waitingAcceptance ? 0 : roll} speed={waitingAcceptance ? 0 : speed} altitude={waitingAcceptance ? 0 : altitude} yaw={waitingAcceptance ? 0 : yaw} gps={gps} />
          )}

          {/* RIGHT STATUS & 3D NAV PANEL */}
          <div style={{ width: "240px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <TBox title="Estado del Sistema" color={isOnline ? "var(--telemetry-green)" : "var(--telemetry-red)"}>
              <div style={{ textAlign: "center", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "12px", marginBottom: "12px" }}>
                <div style={{ color: isOnline ? "var(--telemetry-green)" : "var(--telemetry-red)", fontSize: "20px", fontWeight: "900", letterSpacing: "4px" }}>
                  {isOnline ? "ACTIVO" : "PERDIDO"}
                </div>
                <div style={{ color: "var(--ink-secondary)", fontSize: "9px", fontFamily: "var(--font-mono)", marginTop: "4px" }}>
                  {waitingAcceptance ? "MODO: PRE-VUELO" : (!isOnline ? "MODO: ESPERANDO SEÑAL" : "MODO: ENLACE ONLINE")}
                </div>
              </div>
            </TBox>

            <TBox title="Navegación Táctica (Visor 3D)" color="var(--hud-cyan)" style={{ flex: 1 }}>
              <DroneTacticalNav pitch={waitingAcceptance ? 0 : pitch} roll={waitingAcceptance ? 0 : roll} yaw={waitingAcceptance ? 0 : yaw} />
            </TBox>

            <TBox title="Detalles de Telemetría" color="var(--ink-secondary)">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "11px" }}>
                <div style={{ background: "rgba(255,255,255,0.03)", padding: "6px", borderRadius: "4px" }}>
                  <div style={{ color: "var(--ink-tertiary)", fontSize: "9px" }}>RUMBO MAG</div>
                  <div style={{ color: "var(--hud-cyan)", fontWeight: "bold" }}>{waitingAcceptance ? "--" : "147.1°"}</div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.03)", padding: "6px", borderRadius: "4px" }}>
                  <div style={{ color: "var(--ink-tertiary)", fontSize: "9px" }}>FIJO GPS 3D</div>
                  <div style={{ color: "var(--telemetry-green)", fontWeight: "bold" }}>{waitingAcceptance ? "PENDIENTE" : "FIJADO"}</div>
                </div>
                <div style={{ gridColumn: "span 2", borderTop: "1px solid var(--wire)", margin: "4px 0", paddingTop: "8px", display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ color: "var(--ink-tertiary)", fontSize: "9px" }}>DIST. ORIGEN</div>
                    <div style={{ color: "#eab308", fontWeight: "bold", fontSize: "14px" }}>{waitingAcceptance ? "0.00 km" : "2968.22 km"}</div>
                  </div>
                  <div>
                    <div style={{ color: "var(--ink-tertiary)", fontSize: "9px" }}>VEL. AIRE</div>
                    <div style={{ color: "var(--telemetry-green)", fontWeight: "bold", fontSize: "14px" }}>{waitingAcceptance ? "00.00 km/h" : "6639.96 km/h"}</div>
                  </div>
                </div>
              </div>
            </TBox>
          </div>
        </div>
        ) : activeTab === "GPS" ? (
          <TacticalGPSDashboard 
             droneId={droneId} gps={gps} waypoints={waypoints} 
             startPoint={startPoint}
             currentWaypointIndex={currentWaypointIndex} 
             speed={speed} altitude={altitude}
          />
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink-secondary)", fontFamily: "var(--font-mono)", background: "url('/noise.png'), radial-gradient(circle at center, #060a14 0%, #02040a 100%)" }}>
             <div style={{ border: "1px dashed var(--telemetry-amber)", padding: "24px 48px", borderRadius: "8px", background: "rgba(245, 158, 11, 0.05)", textAlign: "center", boxShadow: "0 0 32px rgba(245, 158, 11, 0.1)" }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--telemetry-amber)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: "16px", filter: "drop-shadow(0 0 8px rgba(245, 158, 11, 0.4))", opacity: 0.8 }}>
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                <h2 style={{ letterSpacing: "2px", margin: 0, fontSize: "16px", color: "var(--telemetry-amber)" }}>MÓDULO NO DISPONIBLE</h2>
                <p style={{ fontSize: "11px", color: "var(--ink-secondary)", marginTop: "12px", maxWidth: "300px", marginInline: "auto" }}>
                  El enlace táctico para la vista <strong style={{ color: "var(--ink-primary)" }}>{activeTab.toUpperCase()}</strong> no está operando o espera una actualización de firmware en la estación de control terrestre.
                </p>
             </div>
          </div>
        )}
      </div>

      {/* FOOTER CONTROLS */}
      <footer style={{
        background: "#06080d", borderTop: "1px solid var(--wire)", padding: "12px",
        display: "flex", alignItems: "center", gap: "8px", overflowX: "auto"
      }}>
        <MButton label="Conectar" color="var(--telemetry-green)" />
        <MButton label="Desconectar" color="var(--telemetry-red)" />
        <div style={{ width: "1px", height: "20px", background: "var(--wire)", margin: "0 8px" }} />
        <MButton label="Cámara" onClick={handleCamera} />
        <MButton label="Capturar" onClick={handleCapture} />
        <MButton label="GPS" onClick={() => setShowMap(!showMap)} active={showMap} />
        <div style={{ flex: 1, margin: "0 10px" }} />
      </footer>
      <style>{`
        @keyframes pulse-red {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(220, 38, 38, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
        }
        @keyframes slide-down {
          from { transform: translate(-50%, -20px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
      `}</style>

    </div>
  );
}

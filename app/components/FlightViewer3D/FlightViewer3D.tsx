"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { TBox } from "../TacticalUI/layout/TBox";
import { MButton } from "../TacticalUI/layout/MButton";
import { PrimaryFlightDisplay } from "../TacticalUI/PrimaryFlightDisplay";
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

export default function FlightViewer3D({ 
  droneId, pitch, roll, yaw, altitude, speed, waitingAcceptance,
  gps, waypoints, currentWaypointIndex
}: { 
  droneId: string; pitch: number; roll: number; yaw: number; altitude: number; speed: number; waitingAcceptance?: boolean;
  gps?: { lat: number; lng: number }; waypoints?: any[]; currentWaypointIndex?: number;
}) {
  const [time, setTime] = useState("00:00:00");
  const [showMap, setShowMap] = useState(false);
  
  useEffect(() => {
    const i = setInterval(() => setTime(new Date().toLocaleTimeString('en-US', { hour12: true })), 1000);
    return () => clearInterval(i);
  }, []);

  return (
    <div style={{ 
      width: "100%", height: "100vh", backgroundColor: "#02040a",
      display: "flex", flexDirection: "column", fontFamily: "var(--font-mono)",
      color: "var(--ink-primary)", overflow: "hidden", userSelect: "none"
    }}>
      
      {/* HEADER */}
      <header style={{ display: "flex", flexDirection: "column", background: "#0a0d14", borderBottom: "1px solid var(--wire)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--telemetry-red)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white" stroke="none"><path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z"/></svg>
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: "16px", color: "var(--ink-primary)", fontWeight: "bold", letterSpacing: "1px" }}>PEVITE_AERO_V1</h1>
              <div style={{ fontSize: "9px", color: "var(--ink-muted)" }}>Estación de Control Terrestre • {droneId}</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "var(--telemetry-green)", fontSize: "11px", fontWeight: "bold" }}>En línea</span>
              <div style={{ display: "flex", gap: "2px" }}>
                {[1,2,3,4].map(i => <div key={i} style={{ width: 4, height: 12, background: i < 4 ? "var(--telemetry-green)" : "var(--wire)", borderRadius: "1px" }}/>)}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(220, 38, 38, 0.1)", padding: "4px 8px", borderRadius: "100px", border: "1px solid var(--telemetry-red)" }}>
              <span style={{ fontSize: "10px", color: "var(--telemetry-red)", fontWeight: "bold" }}>BATERÍA BAJA: 9.16V</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
               <div style={{ textAlign: "right" }}>
                 <div style={{ fontSize: "8px", color: "var(--ink-tertiary)" }}>HORA LOCAL</div>
                 <div style={{ fontSize: "14px", color: "var(--hud-cyan)", fontWeight: "bold" }}>{time}</div>
               </div>
               <div style={{ padding: "4px 12px", background: "rgba(0, 229, 204, 0.1)", border: "1px solid var(--hud-cyan)", borderRadius: "100px", color: "var(--hud-cyan)", fontSize: "10px", fontWeight: "bold" }}>MODO INT.</div>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", padding: "0 8px", borderBottom: "1px solid var(--wire)", background: "#06080d" }}>
            {["Cabina", "Datos", "Sistema", "Conexión", "GPS", "Rastreo 3D"].map((tab, idx) => (
              <div key={tab} style={{ 
                padding: "8px 16px", fontSize: "11px", fontWeight: idx === 0 ? "bold" : "normal",
                color: idx === 0 ? "var(--telemetry-green)" : "var(--ink-secondary)",
                borderBottom: idx === 0 ? "2px solid var(--telemetry-green)" : "2px solid transparent", cursor: "pointer"
              }}>{tab}</div>
            ))}
        </div>
      </header>

      {/* MID CONTENT AREA */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>

        {/* OVERLAY DE ESPERA */}
        {waitingAcceptance && (
          <div style={{ position: "absolute", inset: 0, zIndex: 9999, background: "rgba(2, 4, 10, 0.75)", backdropFilter: "blur(6px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--telemetry-amber)", fontFamily: "var(--font-mono)" }}>
            <div style={{ border: "1px dashed var(--telemetry-amber)", padding: "24px 48px", borderRadius: "8px", background: "rgba(245, 158, 11, 0.1)", textAlign: "center", boxShadow: "0 0 32px rgba(245, 158, 11, 0.15)" }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: "16px", filter: "drop-shadow(0 0 8px rgba(245, 158, 11, 0.5))" }}>
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <h2 style={{ letterSpacing: "2px", margin: 0, fontSize: "16px", textShadow: "0 0 8px rgba(245, 158, 11, 0.5)" }}>ESPERANDO ACEPTACIÓN DEL OPERADOR</h2>
              <p style={{ fontSize: "11px", color: "var(--ink-secondary)", marginTop: "12px", maxWidth: "300px", marginInline: "auto" }}>
                La telemetría y el enlace 3D en vivo iniciarán en cuanto el dron confirme la recepción de la orden de misión.
              </p>
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: "12px", padding: "12px", width: "100%", height: "100%", opacity: waitingAcceptance ? 0.3 : 1, pointerEvents: waitingAcceptance ? "none" : "auto", transition: "opacity 0.3s ease" }}>
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
                 currentWaypointIndex={currentWaypointIndex || 0} 
               />
               <button 
                 onClick={() => setShowMap(false)}
                 style={{ position: "absolute", top: 10, right: 10, zIndex: 1001, background: "rgba(0,0,0,0.6)", border: "1px solid var(--hud-cyan)", color: "white", padding: "4px 8px", fontSize: "10px", cursor: "pointer", borderRadius: "4px" }}
               >
                 CERRAR MAPA [ESC]
               </button>
            </div>
          ) : (
            <PrimaryFlightDisplay pitch={waitingAcceptance ? 0 : pitch} roll={waitingAcceptance ? 0 : roll} speed={waitingAcceptance ? 0 : speed} altitude={waitingAcceptance ? 0 : altitude} yaw={waitingAcceptance ? 0 : yaw} />
          )}

          {/* RIGHT STATUS & 3D NAV PANEL */}
          <div style={{ width: "320px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <TBox title="Estado del Sistema" color="var(--telemetry-green)">
              <div style={{ border: "2px solid var(--telemetry-green)", background: "rgba(0, 255, 157, 0.1)", borderRadius: "6px", textAlign: "center", padding: "12px", margin: "4px 0", color: "var(--telemetry-green)", fontSize: "18px", fontWeight: "bold", textShadow: "0 0 8px rgba(0, 255, 157, 0.5)" }}>
                {waitingAcceptance ? "EN ESPERA" : "ACTIVO"}
              </div>
              <div style={{ fontSize: "11px", color: "var(--ink-secondary)", textAlign: "center", marginTop: "4px" }}>
                {waitingAcceptance ? "MODO: PRE-VUELO" : "MODO: ENLACE ONLINE"}
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
      </div>

      {/* FOOTER CONTROLS */}
      <footer style={{ 
        background: "#06080d", borderTop: "1px solid var(--wire)", padding: "12px",
        display: "flex", alignItems: "center", gap: "8px", overflowX: "auto"
      }}>
        <MButton label="Conectar" color="var(--telemetry-green)" />
        <MButton label="Desconectar" color="var(--telemetry-red)" />
        <div style={{ width: "1px", height: "20px", background: "var(--wire)", margin: "0 8px" }} />
        <MButton label="Cámara" />
        <MButton label="Capturar" />
        <MButton label="Ocultar PFD" onClick={() => setShowMap(!showMap)} active={showMap} />
        <MButton label="GPS" onClick={() => setShowMap(!showMap)} active={showMap} />
        <div style={{ flex: 1, borderTop: "1px dashed var(--wire)", margin: "0 10px" }} />
        <MButton label="Iniciar Sim" color="var(--telemetry-green)" active />
        <MButton label="Detener Sim" />
        <div style={{ width: "1px", height: "20px", background: "var(--wire)", margin: "0 8px" }} />
        <MButton label="Registro" color="#d946ef" />
        <MButton label="Calibrar" color="#3b82f6" />
        <MButton label="Reiniciar" />
      </footer>
    </div>
  );
}

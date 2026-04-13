"use client";

import React from "react";
import TacticalMapLive from "./TacticalMapLive";
import { Waypoint } from "../MissionMap/MissionMap";

export const TacticalGPSDashboard = ({
  droneId, gps, waypoints, currentWaypointIndex, speed, altitude
}: {
  droneId: string; gps?: { lat: number; lng: number }; waypoints?: Waypoint[]; currentWaypointIndex?: number;
  speed: number; altitude: number;
}) => {
  return (
    <div style={{ flex: 1, position: "relative", width: "100%", height: "100%", background: "#02040a" }}>
      
      {/* FULL SCREEN MAP */}
      <div style={{ position: "absolute", inset: 0 }}>
        <TacticalMapLive 
           dronePos={gps || { lat: 0, lng: 0 }} 
           waypoints={waypoints || []} 
           currentWaypointIndex={currentWaypointIndex || 0} 
        />
      </div>

      {/* TACTICAL OVERLAY LEFT PANEL */}
      <div style={{ 
        position: "absolute", top: 16, left: 16, bottom: 16, width: "320px",
        background: "rgba(2, 4, 10, 0.8)", backdropFilter: "blur(4px)",
        border: "1px solid rgba(0, 229, 204, 0.3)", borderRadius: "6px",
        display: "flex", flexDirection: "column", gap: "16px", padding: "16px",
        boxShadow: "0 0 30px rgba(0, 229, 204, 0.1)", zIndex: 1000
      }}>
        
        {/* Header */}
        <div style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "12px" }}>
           <h3 style={{ margin: 0, fontSize: "14px", color: "var(--hud-cyan)", display: "flex", alignItems: "center", gap: "8px", letterSpacing: "1px" }}>
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
             GPS & GNSS TRACKING
           </h3>
           <div style={{ fontSize: "10px", color: "var(--ink-secondary)", marginTop: "4px" }}>UNIDAD: {droneId}</div>
        </div>

        {/* Global Positioning Block */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
           <div style={{ fontSize: "10px", color: "var(--ink-tertiary)", fontWeight: "bold" }}>TELEMETRÍA EN VIVO</div>
           <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "4px", padding: "8px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              <div>
                 <div style={{ fontSize: "9px", color: "var(--ink-secondary)" }}>LATITUD</div>
                 <div style={{ fontSize: "13px", color: "var(--telemetry-green)", fontWeight: "bold" }}>{gps?.lat.toFixed(6) || "0.000000"}</div>
              </div>
              <div>
                 <div style={{ fontSize: "9px", color: "var(--ink-secondary)" }}>LONGITUD</div>
                 <div style={{ fontSize: "13px", color: "var(--telemetry-green)", fontWeight: "bold" }}>{gps?.lng.toFixed(6) || "0.000000"}</div>
              </div>
              <div>
                 <div style={{ fontSize: "9px", color: "var(--ink-secondary)" }}>ALTITUD MSL</div>
                 <div style={{ fontSize: "13px", color: "#3b82f6", fontWeight: "bold" }}>{altitude.toFixed(1)} m</div>
              </div>
              <div>
                 <div style={{ fontSize: "9px", color: "var(--ink-secondary)" }}>VEL. TIERRA</div>
                 <div style={{ fontSize: "13px", color: "var(--telemetry-amber)", fontWeight: "bold" }}>{speed.toFixed(1)} km/h</div>
              </div>
           </div>
        </div>

        {/* Satellite Link Status */}
        <div style={{ padding: "12px", background: "rgba(74, 222, 128, 0.1)", border: "1px solid var(--telemetry-green)", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
           <div>
              <div style={{ fontSize: "12px", color: "var(--telemetry-green)", fontWeight: "bold" }}>SISTEMA GNSS FIJADO</div>
              <div style={{ fontSize: "9px", color: "var(--ink-secondary)", marginTop: "2px" }}>9 SATÉLITES • DGPS ACTIVO</div>
           </div>
           <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(74, 222, 128, 0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--telemetry-green)" strokeWidth="2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
           </div>
        </div>

        {/* Waypoints Manifest */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px", overflow: "hidden" }}>
           <div style={{ fontSize: "10px", color: "var(--ink-tertiary)", fontWeight: "bold", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "4px" }}>
             PLAN DE VUELO ({waypoints?.length || 0} WP)
           </div>
           <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "4px", paddingRight: "4px" }}>
              {waypoints && waypoints.length > 0 ? waypoints.map((wp, idx) => {
                 const isCompleted = idx < (currentWaypointIndex || 0);
                 const isActive = idx === (currentWaypointIndex || 0);
                 const statusColor = isCompleted ? "var(--telemetry-green)" : isActive ? "var(--hud-cyan)" : "var(--ink-tertiary)";
                 
                 return (
                   <div key={wp.index} style={{ 
                     display: "flex", alignItems: "center", justifyContent: "space-between",
                     background: isActive ? "rgba(0, 229, 204, 0.1)" : "rgba(255,255,255,0.02)",
                     border: `1px solid ${isActive ? "var(--hud-cyan)" : "rgba(255,255,255,0.05)"}`,
                     padding: "8px", borderRadius: "4px"
                   }}>
                     <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "16px", height: "16px", borderRadius: "50%", background: statusColor, color: "#000", fontSize: "10px", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {wp.index}
                        </div>
                        <div>
                           <div style={{ fontSize: "10px", color: isActive ? "white" : "var(--ink-secondary)", fontWeight: isActive ? "bold" : "normal" }}>WP-{wp.index}</div>
                           <div style={{ fontSize: "8px", color: "var(--ink-tertiary)" }}>ALT: {wp.alt}m • V: AUTO</div>
                        </div>
                     </div>
                     <div style={{ fontSize: "10px", color: statusColor, fontWeight: "bold" }}>
                        {isCompleted ? "DONE" : isActive ? "EN RUTA" : "PEND."}
                     </div>
                   </div>
                 );
              }) : (
                 <div style={{ fontSize: "10px", color: "var(--ink-tertiary)", textAlign: "center", padding: "20px" }}>SIN PLAN DE VUELO CARGADO</div>
              )}
           </div>
        </div>

      </div>
    </div>
  );
};

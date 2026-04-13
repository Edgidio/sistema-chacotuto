"use client";

import React from "react";

interface TopTelemetryMetricsProps {
  roll: number;
  pitch: number;
  yaw: number;
  voltage: number;
  satellites: number;
  temp?: number;
}

/**
 * TopTelemetryMetrics
 * Muestra las métricas críticas del sistema en la barra superior del Data Dashboard.
 * Emplea "Subtle Layering" y "Token Architecture" con colores vivos sobre fondo oscuro
 * guiados por las directrices de interface-design.
 */
export const TopTelemetryMetrics = ({ roll, pitch, yaw, voltage, satellites, temp = 29.0 }: TopTelemetryMetricsProps) => {

  const MetricBox = ({ label, value, unit, color, icon }: { label: string, value: string | number, unit: string, color: string, icon: string }) => (
    <div style={{
      flex: 1,
      minWidth: "120px",
      border: `1px solid ${color}44`, // Low opacity border to prevent harshness
      borderTop: `2px solid ${color}`, // Intense top edge for hierarchy indication
      borderRadius: "4px",
      background: "rgba(2, 4, 10, 0.6)",
      padding: "10px",
      display: "flex",flexDirection: "column",
      boxShadow: `inset 0 0 10px ${color}11`
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
         <span style={{ fontSize: "10px", color: color }}>{icon}</span>
         <span style={{ fontSize: "9px", color: "var(--ink-secondary)", fontWeight: "bold", letterSpacing: "1px" }}>{label}</span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginTop: "auto" }}>
        <span style={{ fontSize: "20px", color: "white", fontWeight: "bold" }}>{value}</span>
        <span style={{ fontSize: "12px", color: "var(--ink-secondary)" }}>{unit}</span>
      </div>
    </div>
  );

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "8px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid rgba(0, 229, 204, 0.3)", paddingBottom: "4px" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--hud-cyan)" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
        <h2 style={{ margin: 0, fontSize: "12px", color: "var(--hud-cyan)", letterSpacing: "1px" }}>ADVANCED TELEMETRY & FLIGHT DATA CONSOLE</h2>
      </div>
      
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <MetricBox label="ROLL" value={roll.toFixed(1)} unit="°" color="var(--telemetry-red)" icon="⟲" />
        <MetricBox label="PITCH" value={pitch.toFixed(1)} unit="°" color="var(--hud-cyan)" icon="⤓" />
        <MetricBox label="YAW" value={yaw.toFixed(1)} unit="°" color="#fcd34d" icon="⟳" />
        <MetricBox label="TEMPERATURE" value={temp.toFixed(1)} unit="°C" color="#d946ef" icon="🌡" />
        <MetricBox label="BUS VOLTAGE" value={voltage.toFixed(2)} unit="V" color="#fcd34d" icon="⚡" />
        <MetricBox label="SATELLITES" value={satellites} unit="SATS" color="var(--telemetry-green)" icon="🛰" />
      </div>
    </div>
  );
};

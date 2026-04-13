"use client";

import React from "react";

interface TelemetryData {
  roll: number; pitch: number; yaw: number;
  accX: number; accY: number; accZ: number;
  gyrX: number; gyrY: number; gyrZ: number;
  magX: number; magY: number; magZ: number;
  altitude: number; pressure: number; temp: number;
  voltage: number; current: number; power: number;
  ch1: number; ch2: number; ch3: number; ch4: number;
  lat: number; lng: number; satellites: number;
}

export const FlightDataTerminal = ({ data }: { data: TelemetryData }) => {
  // A bar component to display normalized values
  const TerminalBar = ({ label, value, min, max, color }: { label: string, value: number, min: number, max: number, color: string }) => {
    // Calculate percentage, clamping between 0 and 100
    const rawPct = ((value - min) / (max - min)) * 100;
    const pct = Math.max(0, Math.min(100, isNaN(rawPct) ? 0 : rawPct));
    
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "10px", marginBottom: "4px" }}>
        <div style={{ width: "35px", color: "var(--ink-secondary)" }}>{label}</div>
        <div style={{ flex: 1, height: "12px", background: "rgba(255,255,255,0.05)", position: "relative", border: "1px solid rgba(255,255,255,0.1)" }}>
           <div style={{ 
             position: "absolute", top: 0, left: 0, height: "100%", width: `${pct}%`,
             background: color, transition: "width 0.1s linear"
           }} />
        </div>
        <div style={{ width: "45px", textAlign: "right", color: "var(--ink-primary)", fontWeight: "bold" }}>
          {Number.isInteger(value) ? value : value.toFixed(2)}
        </div>
      </div>
    );
  };

  const GroupTerm = ({ title, hideArrow=false, children }: { title: string, hideArrow?: boolean, children: React.ReactNode }) => (
    <div style={{ marginBottom: "12px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--hud-cyan)", fontSize: "9px", marginBottom: "6px", borderBottom: "1px solid rgba(0, 229, 204, 0.2)", paddingBottom: "2px" }}>
         {!hideArrow && <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M9 18l6-6-6-6v12z"/></svg>}
         {title}
      </div>
      <div style={{ paddingLeft: hideArrow ? "0" : "16px" }}>{children}</div>
    </div>
  );

  return (
    <div style={{ 
      background: "rgba(2, 4, 10, 0.6)", 
      border: "1px solid rgba(0, 229, 204, 0.3)", 
      borderRadius: "4px", padding: "12px",
      display: "flex", flexDirection: "column", gap: "4px",
      height: "100%", overflowY: "auto"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "8px" }}>
         <h3 style={{ margin: 0, fontSize: "11px", color: "var(--hud-cyan)", display: "flex", alignItems: "center", gap: "6px" }}>
           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16m-7 6h7"/></svg>
           FLIGHT DATA TERMINAL
         </h3>
         <div style={{ fontSize: "9px", color: "var(--telemetry-green)", border: "1px solid var(--telemetry-green)", padding: "2px 6px", borderRadius: "2px" }}>NORMAL</div>
      </div>

      <GroupTerm title="ATTITUDE">
        <TerminalBar label="ROLL" value={data.roll} min={-90} max={90} color="var(--telemetry-red)" />
        <TerminalBar label="PITCH" value={data.pitch} min={-90} max={90} color="var(--hud-cyan)" />
        <TerminalBar label="YAW" value={data.yaw} min={0} max={360} color="#fcd34d" />
      </GroupTerm>

      <GroupTerm title="ACCELERATION">
        <TerminalBar label="ACC X" value={data.accX} min={-20} max={20} color="var(--telemetry-green)" />
        <TerminalBar label="ACC Y" value={data.accY} min={-20} max={20} color="var(--telemetry-green)" />
        <TerminalBar label="ACC Z" value={data.accZ} min={-20} max={20} color="var(--telemetry-green)" />
      </GroupTerm>

      <GroupTerm title="GYROSCOPE">
        <TerminalBar label="GYR X" value={data.gyrX} min={-250} max={250} color="#f59e0b" />
        <TerminalBar label="GYR Y" value={data.gyrY} min={-250} max={250} color="#f59e0b" />
        <TerminalBar label="GYR Z" value={data.gyrZ} min={-250} max={250} color="#f59e0b" />
      </GroupTerm>

      <GroupTerm title="MAGNETOMETER">
        <TerminalBar label="MAG X" value={data.magX} min={-100} max={100} color="#c084fc" />
        <TerminalBar label="MAG Y" value={data.magY} min={-100} max={100} color="#c084fc" />
        <TerminalBar label="MAG Z" value={data.magZ} min={-100} max={100} color="#c084fc" />
      </GroupTerm>

      <GroupTerm title="NAVIGATION">
        <TerminalBar label="ALT" value={data.altitude} min={0} max={10000} color="#3b82f6" />
        <TerminalBar label="PRES" value={data.pressure} min={900} max={1100} color="#3b82f6" />
        <TerminalBar label="TEMP" value={data.temp} min={-20} max={80} color="#3b82f6" />
      </GroupTerm>
      
      <GroupTerm title="POWER SYSTEM">
        <TerminalBar label="VOLT" value={data.voltage} min={0} max={25} color="#eab308" />
        <TerminalBar label="CURR" value={data.current} min={0} max={50} color="#eab308" />
        <TerminalBar label="PWR" value={data.power} min={0} max={1250} color="#eab308" />
      </GroupTerm>
    </div>
  );
};

"use client";

import React, { useState } from "react";

interface MatrixRow {
  param: string;
  value: number;
  min: number;
  max: number;
  unit?: string;
}

export const LiveTelemetryMatrix = ({ data }: { data: Record<string, number> }) => {
  // Mock ranges matching user's image roughly where applicable
  const matrix: MatrixRow[] = [
    { param: "Roll", value: data.roll, min: -7.60, max: 15.25, unit: "°" },
    { param: "Pitch", value: data.pitch, min: -65.85, max: 19.38, unit: "°" },
    { param: "Yaw", value: data.yaw, min: 295.57, max: 947.08, unit: "°" },
    { param: "Acc X", value: data.accX, min: -2.27, max: 3.39, unit: "m/s²" },
    { param: "Acc Y", value: data.accY, min: -7.96, max: 9.05, unit: "m/s²" },
    { param: "Acc Z", value: data.accZ, min: 0.05, max: 11.61, unit: "m/s²" },
    { param: "Gyr X", value: data.gyrX, min: -2.83, max: 2.25, unit: "°/s" },
    { param: "Gyr Y", value: data.gyrY, min: -1.07, max: 1.15, unit: "°/s" },
    { param: "Gyr Z", value: data.gyrZ, min: -5.28, max: 4.20, unit: "°/s" },
  ];

  const [selectedParams, setSelectedParams] = useState<string[]>([]);

  const toggleParam = (p: string) => {
    if (selectedParams.includes(p)) {
        setSelectedParams(selectedParams.filter(x => x !== p));
    } else {
        setSelectedParams([...selectedParams, p]);
    }
  };

  const selectAll = () => setSelectedParams(matrix.map(m => m.param));
  const clearSelection = () => setSelectedParams([]);

  return (
    <div style={{
      background: "rgba(2, 4, 10, 0.6)", 
      border: "1px solid rgba(0, 229, 204, 0.3)", 
      borderRadius: "4px", padding: "12px",
      display: "flex", flexDirection: "column", gap: "10px",
      height: "100%"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "8px" }}>
         <h3 style={{ margin: 0, fontSize: "11px", color: "var(--hud-cyan)", display: "flex", alignItems: "center", gap: "6px" }}>
           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16m-7 6h7"/></svg>
           LIVE TELEMETRY DATA MATRIX
         </h3>
         <div style={{ fontSize: "9px", color: "var(--telemetry-green)", border: "1px solid var(--telemetry-green)", padding: "2px 6px", borderRadius: "2px", display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ width: 6, height: 6, background: "var(--telemetry-green)", borderRadius: "50%", display: "inline-block" }} /> REAL-TIME
         </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        <table style={{ width: "100%", fontSize: "11px", textAlign: "right", borderCollapse: "collapse" }}>
           <thead>
             <tr style={{ color: "var(--ink-secondary)", fontSize: "9px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                <th style={{ padding: "8px 4px", textAlign: "left" }}>PARAMETER</th>
                <th style={{ padding: "8px 4px", color: "var(--telemetry-green)", textAlign: "center" }}>LIVE VALUE</th>
                <th style={{ padding: "8px 4px", color: "#3b82f6" }}>MIN</th>
                <th style={{ padding: "8px 4px", color: "#ef4444" }}>MAX</th>
                <th style={{ padding: "8px 4px", color: "#d946ef" }}>RANGE</th>
                <th style={{ padding: "8px 4px", textAlign: "center" }}>TREND</th>
             </tr>
           </thead>
           <tbody>
             {matrix.map((row) => (
                <tr key={row.param} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <td style={{ padding: "6px 4px", textAlign: "left", color: "var(--ink-primary)" }}>{row.param} {row.unit}</td>
                  <td style={{ padding: "6px 4px", textAlign: "center" }}>
                    <div style={{ border: "1px solid var(--telemetry-green)", borderRadius: "12px", padding: "2px 8px", display: "inline-block", color: "var(--telemetry-green)", fontWeight: "bold" }}>
                       {row.value.toFixed(2)}
                    </div>
                  </td>
                  <td style={{ padding: "6px 4px", color: "#3b82f6" }}>{row.min.toFixed(2)}</td>
                  <td style={{ padding: "6px 4px", color: "#ef4444" }}>{row.max.toFixed(2)}</td>
                  <td style={{ padding: "6px 4px", color: "#d946ef" }}>{Math.abs(row.max - row.min).toFixed(2)}</td>
                  <td style={{ padding: "6px 4px", textAlign: "center", color: "var(--ink-secondary)" }}>
                     <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 6l-9.5 9.5-5-5L1 18"/></svg>
                  </td>
                </tr>
             ))}
           </tbody>
        </table>
      </div>

      <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "12px" }}>
        <h4 style={{ margin: "0 0 8px 0", fontSize: "10px", color: "var(--hud-cyan)" }}>EXPORT SELECTED TELEMETRY TO CSV</h4>
        <p style={{ margin: "0 0 12px 0", fontSize: "9px", color: "var(--ink-secondary)" }}>Choose fields and export a CSV snapshot of the live telemetry matrix.</p>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
            {matrix.map(row => (
                <label key={row.param} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "10px", cursor: "pointer" }}>
                   <input type="checkbox" checked={selectedParams.includes(row.param)} onChange={() => toggleParam(row.param)} style={{ accentColor: "var(--telemetry-green)" }} />
                   {row.param} {row.unit}
                </label>
            ))}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "12px" }}>
            <button onClick={selectAll} style={{ background: "transparent", border: "1px solid var(--wire)", color: "var(--ink-secondary)", fontSize: "9px", padding: "4px 8px", borderRadius: "12px", cursor: "pointer" }}>ALL</button>
            <button onClick={clearSelection} style={{ background: "transparent", border: "1px solid var(--wire)", color: "var(--ink-secondary)", fontSize: "9px", padding: "4px 8px", borderRadius: "12px", cursor: "pointer" }}>CLEAR</button>
            <button style={{ background: "transparent", border: "1px solid var(--hud-cyan)", color: "var(--hud-cyan)", fontSize: "9px", padding: "4px 12px", borderRadius: "12px", cursor: "pointer" }}>EXPORT CSV</button>
        </div>
      </div>
    </div>
  );
};

"use client";

import React from "react";
import { TBox } from "./layout/TBox";

export const HSICompass = ({ yaw }: { yaw: number }) => {
  return (
    <TBox title="SYS HSI COMPASS" color="var(--hud-cyan)">
       <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "220px" }}>
          <div style={{ width: "180px", height: "180px", borderRadius: "50%", border: "2px solid rgba(0, 229, 204, 0.3)", position: "relative" }}>
             <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 24, height: 24, zIndex: 10 }}>
               <svg viewBox="0 0 24 24" fill="none" stroke="var(--telemetry-green)" strokeWidth="2"><path d="M12 2v20m-7-7l7-7 7 7"/></svg>
             </div>
             <div style={{ width: "100%", height: "100%", transform: `rotate(${-yaw}deg)`, borderRadius: "50%" }}>
               {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(deg => {
                 const isCard = deg % 90 === 0;
                 let label = deg.toString();
                 if (deg===0) label="N"; if (deg===90) label="E"; if (deg===180) label="S"; if (deg===270) label="O";
                 return (
                   <div key={deg} style={{ position: "absolute", top: 0, left: "50%", height: "100%", width: "2px", transform: `translateX(-50%) rotate(${deg}deg)` }}>
                     <div style={{ width: isCard ? "4px" : "2px", height: isCard ? "12px" : "6px", background: "white", margin: "0 auto" }} />
                     {isCard && <div style={{ color: deg === 0 ? "var(--telemetry-red)" : "white", fontSize: "14px", fontWeight: "bold", textAlign: "center", marginTop: "2px", transform: `rotate(${-deg}deg)` }}>{label}</div>}
                   </div>
                 )
               })}
               <div style={{ position: "absolute", top: -8, left: "50%", transform: "translateX(-50%) rotate(45deg)", width: 0, height: 0, borderLeft: "8px solid transparent", borderRight: "8px solid transparent", borderBottom: "12px solid #d946ef", transformOrigin: "50% 98px" }} />
             </div>
          </div>
       </div>
       <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "4px", marginTop: "10px" }}>
         {[
           {l: "RUMBO", v: yaw.toFixed(1), c: "var(--telemetry-green)"},
           {l: "TKE", v: "-0.5", c: "white"},
           {l: "CURSO", v: "000.0", c: "#d946ef"},
           {l: "DERIVA", v: "+0.0", c: "var(--hud-cyan)"}
         ].map(x => (
           <div key={x.l} style={{ border: `1px solid ${x.c}44`, borderRadius: "4px", padding: "4px", textAlign: "center", background: "rgba(255,255,255,0.02)" }}>
             <div style={{ fontSize: "9px" }}>{x.l}</div>
             <div style={{ fontSize: "12px", color: x.c, fontWeight: "bold" }}>{x.v}°</div>
           </div>
         ))}
       </div>
    </TBox>
  );
};

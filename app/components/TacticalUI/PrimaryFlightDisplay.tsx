"use client";

import React, { useEffect, useRef } from "react";

export const PrimaryFlightDisplay = ({ pitch, roll, speed, altitude, yaw }: { pitch: number; roll: number; speed: number; altitude: number; yaw: number }) => {
  // Thresholds for critical status (Adjusted for "tolerable" sensitivity)
  const isCritical = Math.abs(pitch) > 20 || Math.abs(roll) > 30;
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!audioRef.current) {
        audioRef.current = new Audio("/Sonido De Alarma Detector De Humos.mp3");
        audioRef.current.loop = true;
      }

      if (isCritical) {
        audioRef.current.play().catch(err => console.log("Audio play blocked by browser:", err));
      } else {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [isCritical]);
  
  // Format data
  const speedStr = speed.toFixed(1);
  const altStr = altitude.toFixed(1);
  const yawStr = Math.round(yaw).toString().padStart(3, '0') + "°";
  
  return (
    <div style={{ 
      flex: 1, background: "#0284c7", borderRadius: "8px", border: `2px solid ${isCritical ? "#ef4444" : "var(--hud-cyan)"}`,
      position: "relative", overflow: "hidden", fontFamily: "var(--font-mono)", userSelect: "none",
      transition: "border-color 0.3s ease"
    }}>
      
      {/* CRITICAL ALERT OVERLAY */}
      {isCritical && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 100,
          background: "radial-gradient(circle, transparent 40%, rgba(239, 68, 68, 0.4) 100%)",
          boxShadow: "inset 0 0 100px rgba(239, 68, 68, 0.6)",
          animation: "pulse-red 1s infinite alternate",
          pointerEvents: "none"
        }} />
      )}

      <style>{`
        @keyframes pulse-red {
          from { opacity: 0.4; }
          to { opacity: 0.8; }
        }
      `}</style>
      
      {/* =========================================
          ZONA C: HORIZONTE ARTIFICIAL (LAYER FONDO MÓVIL)
         ========================================= */}
      <div style={{
        position: "absolute", top: "50%", left: "-50%", right: "-50%", height: "400%",
        transform: `translateY(calc(-50% + ${pitch}px)) rotate(${-roll}deg)`, 
        transformOrigin: "center center", transition: "transform 0.1s linear"
      }}>
        {/* Sky (Azul Cielo Brillante) */}
        <div style={{ height: "50%", width: "100%", background: "#0ea5e9", position: "relative" }}>
           {[10, 20, 30, 40].map(p => (
             <div key={p} style={{ width: "100%", position: "absolute", bottom: `${p*15}px`, display: "flex", justifyContent: "center", alignItems: "center", gap: "10px" }}>
               <span style={{ color: "white", fontSize: "12px", fontWeight: "bold" }}>{p}</span>
               <div style={{ width: p % 20 === 0 ? "80px" : "40px", height: "3px", background: "white", boxShadow: "0 1px 2px rgba(0,0,0,0.5)" }} />
               <div style={{ width: "50px", height: "3px", opacity: 0 }} />
               <div style={{ width: p % 20 === 0 ? "80px" : "40px", height: "3px", background: "white", boxShadow: "0 1px 2px rgba(0,0,0,0.5)" }} />
               <span style={{ color: "white", fontSize: "12px", fontWeight: "bold" }}>{p}</span>
             </div>
           ))}
        </div>
        
        {/* Ground (Marrón Terroso) y Linea Central (Horizonte Blanca) */}
        <div style={{ height: "50%", width: "100%", background: "#a16207", borderTop: "4px solid white", position: "relative" }}>
           {/* Lineas secundarias (Texturas más oscuras intercaladas como dice la imagen) */}
           {[...Array(20)].map((_, i) => (
             <div key={i} style={{ width: "100%", height: "2px", background: "rgba(0,0,0,0.2)", position: "absolute", top: `${(i+1)*15}px`, boxShadow: "0 1px 0 rgba(255,255,255,0.05)" }} />
           ))}
           {/* Lineas de Pitch Negativo */}
           {[10, 20, 30, 40].map(p => (
             <div key={p} style={{ width: "100%", position: "absolute", top: `${p*15}px`, display: "flex", justifyContent: "center", alignItems: "center", gap: "10px" }}>
               <span style={{ color: "white", fontSize: "12px", fontWeight: "bold", textShadow: "1px 1px 0 #000" }}>{p}</span>
               <div style={{ width: p % 20 === 0 ? "80px" : "40px", height: "3px", background: "white", boxShadow: "0 1px 2px rgba(0,0,0,0.5)" }} />
               <div style={{ width: "50px", height: "3px", opacity: 0 }} />
               <div style={{ width: p % 20 === 0 ? "80px" : "40px", height: "3px", background: "white", boxShadow: "0 1px 2px rgba(0,0,0,0.5)" }} />
               <span style={{ color: "white", fontSize: "12px", fontWeight: "bold", textShadow: "1px 1px 0 #000" }}>{p}</span>
             </div>
           ))}
        </div>
      </div>

      {/* =========================================
          ZONA C: RETICULA CENTRAL Y ARCO DE BANK
         ========================================= */}
      {/* Escala Superior (Arc) */}
      <div style={{
         position: "absolute", top: "-300px", left: "50%", transform: "translateX(-50%)", 
         width: "800px", height: "800px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0)", 
         borderBottom: "none", zIndex: 10
      }}>
        <div style={{ position: "absolute", bottom: "10%", left: "15%", right: "15%", top: "15%", borderRadius: "50%", borderTop: "2px solid white", borderLeft: "2px solid transparent", borderRight: "2px solid transparent" }} />
        {/* Ticks Blancos del arco */}
        {[-60, -45, -30, -20, -10, 0, 10, 20, 30, 45, 60].map(deg => {
           let h = deg === 0 ? "16px" : (Math.abs(deg) === 30 || Math.abs(deg) === 60 ? "16px" : "10px");
           return (
            <div key={deg} style={{
               position: "absolute", bottom: "50%", left: "50%", width: "2px", height: "250px",
               transformOrigin: "bottom center", transform: `translateX(-50%) rotate(${deg}deg)`
            }}>
              <div style={{ width: deg === 0 ? "4px" : "2px", height: h, background: "white", margin: "0 auto" }} />
             </div>
          )
        })}
        {/* Triangulo y numero en 0 grados */}
        <div style={{ position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
           <span style={{ color: "white", fontSize: "11px", fontWeight: "bold", background: "rgba(0,0,0,0.2)", padding: "0 4px", borderRadius: "4px" }}>
              {yawStr}
           </span>
           <div style={{ width: 0, height: 0, borderLeft: "8px solid transparent", borderRight: "8px solid transparent", borderTop: "12px solid #fbbf24" }} />
        </div>
      </div>

      {/* Retícula de Actitud Central (Cruz púrpura con Círculo amarillo central) */}
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 15, display: "flex", alignItems: "center", justifyContent: "center" }}>
         {/* Alas Amarillas ("W" Shape) debajo del centro */}
         <div style={{ position: "absolute", width: "100px", display: "flex", justifyContent: "space-between", marginTop: "12px" }}>
            <div style={{ width: "25px", height: "8px", borderBottom: "4px solid #fcd34d", borderRight: "4px solid #fcd34d" }} />
            <div style={{ width: "25px", height: "8px", borderBottom: "4px solid #fcd34d", borderLeft: "4px solid #fcd34d" }} />
         </div>
         {/* Cruz Magenta Central */}
         <div style={{ position: "absolute", width: "50px", height: "4px", background: "#f472b6", boxShadow: "0 0 4px rgba(0,0,0,0.5)" }} />
         <div style={{ position: "absolute", width: "4px", height: "50px", background: "#f472b6", boxShadow: "0 0 4px rgba(0,0,0,0.5)" }} />
         {/* Circulo Central Amarillo dentro de la cruz */}
         <div style={{ position: "absolute", width: "12px", height: "12px", borderRadius: "50%", border: "3px solid #fcd34d", zIndex: 16 }} />
      </div>


      {/* =========================================
          ZONA A: INDICADOR EKF Y G-LOAD (ARRIBA IZQUIERDA)
         ========================================= */}
      <div style={{ position: "absolute", top: 15, left: 95, zIndex: 20 }}>
         {/* Badge EKF con su punto */}
         <div style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: "rgba(255, 255, 255, 0.9)", color: "black", fontSize: "10px", fontWeight: "bold", padding: "2px 6px", borderRadius: "4px", marginBottom: "4px" }}>
           <div style={{ width: 4, height: 4, background: "#10b981", borderRadius: "50%" }}/> EKF
         </div>
         
         <div style={{ background: "rgba(30, 58, 138, 0.8)", border: "1px solid #38bdf8", borderRadius: "8px", padding: "8px", width: "110px", boxShadow: "0 4px 10px rgba(0,0,0,0.5)" }}>
            {/* Titulo G-LOAD */}
            <div style={{ fontSize: "10px", color: "white", display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
               <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981" }}/> G-LOAD
            </div>
            
            {/* Numero Grande */}
            <div style={{ fontSize: "20px", color: "white", fontWeight: "bold", background: "#1e3a8a", border: "1px solid #38bdf8", borderRadius: "4px", textAlign: "center", padding: "4px", marginBottom: "6px" }}>
               1.02G
            </div>
            
            {/* Barra de Progreso Interna (Verde/Azul) */}
            <div style={{ height: "6px", width: "100%", background: "rgba(255,255,255,0.2)", borderRadius: "3px", position: "relative" }}>
               <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "65%", background: "linear-gradient(90deg, #10b981, #38bdf8)", borderRadius: "3px" }} />
            </div>
            
            {/* Labels Laterales Bar */}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#60a5fa", marginTop: "4px", fontWeight: "bold" }}>
               <span>+1.2</span><span>0.7</span>
            </div>
         </div>
      </div>

      {/* =========================================
          ZONA D: INDICADORES DEL MONITOR (ARRIBA DERECHA)
         ========================================= */}
      <div style={{ position: "absolute", top: 15, right: 95, zIndex: 20 }}>
         <div style={{ padding: "4px 12px", background: "rgba(100,116,139,0.3)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "4px", color: "white", fontSize: "10px", fontWeight: "bold" }}>
            PFD
         </div>
      </div>

      {/* =========================================
          ZONA B: CINTA DE VELOCIDAD Y BARRA AoA/G-LOAD
         ========================================= */}
      <div style={{
         position: "absolute", left: 0, top: "10%", bottom: "15%", width: "80px",
         background: "rgba(15, 23, 42, 0.7)", borderRight: "2px solid rgba(255,255,255,0.2)",
         display: "flex", zIndex: 20
      }}>
         {/* BARRA EXTERNA G-LOAD/AoA (A la izquierda de la cinta de vel) */}
         <div style={{ width: "12px", position: "absolute", left: "10px", top: "10%", bottom: "10%", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ fontSize: "8px", color: "white", marginBottom: "4px" }}>AOA</div>
            <div style={{ flex: 1, width: "100%", background: "linear-gradient(180deg, #4ade80 0%, #facc15 50%, #ef4444 100%)", borderRadius: "10px", border: "1px solid rgba(0,0,0,0.5)", position: "relative" }}>
               {/* Triangulo Blanco selector */}
               <div style={{ position: "absolute", right: "-4px", top: "70%", width: 0, height: 0, borderTop: "4px solid transparent", borderBottom: "4px solid transparent", borderRight: "6px solid white" }} />
            </div>
            <div style={{ fontSize: "8px", color: "white", marginTop: "4px", fontWeight: "bold" }}>0.1°</div>
         </div>

         {/* CINTA DE VELOCIDAD DINÁMICA */}
         <div style={{ 
           position: "absolute", right: "5px", top: "calc(50% - 10px)",
           display: "flex", flexDirection: "column", gap: "40px",
           color: "white", fontSize: "14px", fontWeight: "bold",
           transform: `translateY(${speed * 4}px)`,
           transition: "transform 0.1s linear"
         }}>
           {[100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 0].map(s => (
             <span key={s} style={{ height: "20px", textAlign: "right", color: isCritical ? "#ef4444" : "white" }}>{s}</span>
           ))}
         </div>

         {/* GREEN BOX CURRENT VALUE */}
         <div style={{
            position: "absolute", right: "-10px", top: "50%", transform: "translateY(-50%)",
            background: "#111827", border: "2px solid #4ade80", padding: "6px 8px 6px 12px",
            color: "#4ade80", fontSize: "18px", fontWeight: "bold", zIndex: 25,
            boxShadow: "0 0 10px rgba(0,0,0,0.8)", display: "flex", alignItems: "center", gap: "6px"
         }}>
            {/* Flechita Up verde adentro */}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
            <span>{speedStr}</span>
         </div>
      </div>

      {/* =========================================
          ZONA E: CINTA DE ALTITUD
         ========================================= */}
      <div style={{
         position: "absolute", right: 0, top: "10%", bottom: "15%", width: "80px",
         background: "rgba(15, 23, 42, 0.7)", borderLeft: "2px solid rgba(255,255,255,0.2)",
         display: "flex", justifyContent: "flex-end", zIndex: 20
      }}>
         {/* GREEN BOX CURRENT VALUE */}
         <div style={{
             position: "absolute", left: "-10px", top: "50%", transform: "translateY(-50%)",
             background: "#111827", border: "2px solid #4ade80", padding: "6px 12px",
             color: "#4ade80", fontSize: "18px", fontWeight: "bold", zIndex: 25,
             boxShadow: "0 0 10px rgba(0,0,0,0.8)"
         }}>
            {altStr}
         </div>

         {/* Tick Marks Right Side */}
         <div style={{ width: "6px", borderRight: "2px solid rgba(255,255,255,0.4)" }} />
         
         {/* CINTA DE ALTITUD DINÁMICA */}
         <div style={{
           flex: 1, display: "flex", flexDirection: "column", gap: "40px",
           padding: "10px 4px", color: "white", fontSize: "14px", fontWeight: "bold", textAlign: "right",
           position: "absolute", right: "12px", top: "calc(50% - 10px)",
           transform: `translateY(${altitude * 1}px)`,
           transition: "transform 0.1s linear"
         }}>
           {[500, 400, 300, 200, 100, 0, -100, -200, -300].map(a => (
             <span key={a} style={{ height: "20px", color: isCritical ? "#ef4444" : "white" }}>{a}</span>
           ))}
         </div>

         {/* Caja Red Extra BOTTOM RIGHT (BUS 5.09V) */}
         <div style={{ position: "absolute", bottom: -20, right: 10, display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "10px", color: "white", fontWeight: "bold", marginBottom: "4px" }}>
               <span>1013</span> <span style={{ color: "#ef4444" }}>-0.3</span>
            </div>
            <div style={{ background: "rgba(220, 38, 38, 0.9)", border: "1px solid #fca5a5", padding: "4px", borderRadius: "4px", color: "white", fontSize: "10px", fontWeight: "bold", textAlign: "center" }}>
               <div>BUS</div>
               <div>5.09 V</div>
            </div>
         </div>
      </div>


      {/* =========================================
          ZONA G: GPS DATA (ABAJO IZQUIERDA)
         ========================================= */}
      <div style={{ position: "absolute", bottom: 45, left: 95, zIndex: 20, background: "rgba(30, 20, 0, 0.8)", border: "1px solid #fbbf24", borderRadius: "8px", width: "190px" }}>
         <div style={{ background: "linear-gradient(90deg, #b45309, transparent)", padding: "4px 8px", fontSize: "11px", fontWeight: "bold", color: "#fef08a", borderBottom: "1px solid #fbbf24", borderTopLeftRadius: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
           <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fbbf24" }}/> DATOS GPS
         </div>
         <div style={{ padding: "8px", fontSize: "11px", color: "white", display: "grid", gap: "3px", lineHeight: 1.4 }}>
            <div><span style={{color:"#fbbf24", width:"45px", display:"inline-block"}}>ESTADO</span> <span style={{color:"#4ade80"}}>FIJO 3D OK</span></div>
            <div><span style={{color:"#fbbf24", width:"45px", display:"inline-block"}}>LAT</span> -007.5618468°</div>
            <div><span style={{color:"#fbbf24", width:"45px", display:"inline-block"}}>LON</span> -025.6592220°</div>
            <div><span style={{color:"#fbbf24", width:"45px", display:"inline-block"}}>HDOP</span> 1.13</div>
            <div><span style={{color:"#fbbf24", width:"45px", display:"inline-block"}}>SATS</span> 9</div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
               <span style={{color:"#fbbf24", width:"40px", display:"inline-block"}}>SEÑAL</span>
               <div style={{ flex: 1, height: "8px", background: "rgba(255,255,255,0.1)", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ width: "80%", height: "100%", background: "#fbbf24" }} />
               </div>
            </div>
         </div>
      </div>

      {/* =========================================
          ZONA I: FLIGHT DATA (ABAJO DERECHA)
         ========================================= */}
      <div style={{ position: "absolute", bottom: 45, right: 95, zIndex: 20, background: "rgba(0, 30, 15, 0.8)", border: "1px solid #4ade80", borderRadius: "8px", width: "190px" }}>
         <div style={{ background: "linear-gradient(90deg, #166534, transparent)", padding: "4px 8px", fontSize: "11px", fontWeight: "bold", color: "#86efac", borderBottom: "1px solid #4ade80", borderTopLeftRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
           <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
             <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80" }}/> DATOS VUELO
           </div>
           <div style={{ width: 60, height: 4, background: "#4ade80", borderRadius: 4 }} />
         </div>
         <div style={{ padding: "8px", fontSize: "11px", color: "white", display: "grid", gap: "3px", lineHeight: 1.4 }}>
            <div style={{ color: "rgba(255,255,255,0.4)" }}>FASE: TIERRA</div>
            <div><span style={{color:"#86efac", width:"50px", display:"inline-block"}}>ALT</span> -3.1 m</div>
            <div><span style={{color:"#86efac", width:"50px", display:"inline-block"}}>V/S</span> -0.28 m/s</div>
            <div><span style={{color:"#86efac", width:"50px", display:"inline-block"}}>FUERZA-G</span> 1.02 G</div>
            <div><span style={{color:"#86efac", width:"50px", display:"inline-block"}}>AOA</span> <span style={{color: "#fbbf24"}}>+0.1°</span></div>
            <div><span style={{color:"#86efac", width:"50px", display:"inline-block"}}>MACH</span> <span style={{color: "#38bdf8"}}>0.003</span></div>
            <div style={{ color: "var(--ink-secondary)", fontSize: "10px", marginTop: "4px" }}>VEL. TIERRA 1.1 km/h</div>
         </div>
      </div>

      {/* =========================================
          ZONA H: COMPASS TAPE INFERIOR
         ========================================= */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "35px", background: "rgba(15, 23, 42, 0.9)", borderTop: "2px solid rgba(255,255,255,0.2)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 25, overflow: "hidden" }}>
         
         {/* Cuadro Rojo RA 0 Superior */}
         <div style={{ position: "absolute", bottom: 42, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ background: "rgba(220,38,38,0.8)", border: "1px solid white", padding: "2px 8px", borderRadius: "12px", color: "white", fontSize: "10px", fontWeight: "bold" }}>RA 0</div>
            <div style={{ color: "white", fontSize: "10px", textShadow: "0 0 2px black", marginTop: "2px" }}>(-0.4A°+0.2A°)</div>
         </div>

         {/* Triángulo selector central amarillo */}
         <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "8px solid transparent", borderRight: "8px solid transparent", borderBottom: "12px solid #bef264", zIndex: 30 }} />
         
         {/* Caja central Verde de Ground Speed */}
         <div style={{ position: "absolute", bottom: "4px", left: "50%", transform: "translateX(-50%)", background: "#bef264", padding: "2px 16px", borderRadius: "4px", color: "black", fontSize: "14px", fontWeight: "bold", zIndex: 26 }}>
            1.1
         </div>

         {/* CINTA DE RUMBO DINÁMICA (COMPASS TAPE) */}
         <div style={{ 
           display: "flex", gap: "50px", color: "white", fontSize: "12px", fontWeight: "bold", alignItems: "center",
           transform: `translateX(${-yaw * 2}px)`,
           transition: "transform 0.1s linear",
           paddingLeft: "50%" // Centro inicial en 0
         }}>
           {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 360, 390, 420].map(n => {
             const deg = n % 360;
             let label = deg.toString();
             if (deg === 0) label = "N";
             if (deg === 90) label = "E";
             if (deg === 180) label = "S";
             if (deg === 270) label = "O";
             
             const isCardinal = ["N", "E", "S", "O"].includes(label);
             
             return (
               <div key={n} style={{ 
                 minWidth: "40px", textAlign: "center",
                 background: isCardinal ? (isCritical ? "#ef4444" : "#bef264") : "transparent",
                 color: isCardinal ? "black" : (isCritical ? "#ef4444" : "white"),
                 padding: isCardinal ? "2px 10px" : "0",
                 borderRadius: "4px",
                 fontSize: isCardinal ? "14px" : "12px"
               }}>
                 {label}
               </div>
             );
           })}
         </div>
      </div>

    </div>
  );
};

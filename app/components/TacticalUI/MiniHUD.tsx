"use client";

import React from "react";
import { HSICompass } from "./HSICompass";

/**
 * MiniHUD
 * Componente sobrepuesto en el mapa táctico que muestra una mini versión
 * del Horizonte Artificial (ADI) y de la Brújula (HSI).
 */
export const MiniHUD = ({ pitch, roll, yaw }: { pitch: number; roll: number; yaw: number }) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px", pointerEvents: "none", zIndex: 1000 }}>
      {/* MINI HORIZONTE ARTIFICIAL (Círculo) */}
      <div style={{
        width: "140px", height: "140px", borderRadius: "50%",
        border: "2px solid rgba(0, 229, 204, 0.6)",
        overflow: "hidden", position: "relative",
        boxShadow: "0 0 20px rgba(0, 229, 204, 0.4)",
        background: "#0284c7" // Cielo por defecto
      }}>
        {/* Fondo Móvil (Sky / Ground) */}
        <div style={{
          position: "absolute", top: "50%", left: "-50%", right: "-50%", height: "400%",
          transform: `translateY(calc(-50% + ${pitch * 2}px)) rotate(${roll}deg)`, 
          transformOrigin: "center center", transition: "transform 0.1s linear"
        }}>
          {/* Sky Layer (Mitad superior) */}
          <div style={{ width: "100%", height: "50%", background: "#0284c7" }}>
             {[10, 20].map(p => (
               <div key={p} style={{ position: "absolute", bottom: `calc(50% + ${p * 2}px)`, left: "50%", transform: "translateX(-50%)", width: "30px", height: "1px", background: "white" }} />
             ))}
          </div>
          {/* Ground Layer (Mitad inferior) */}
          <div style={{ width: "100%", height: "50%", background: "#b45309", borderTop: "2px solid white" }}>
             {[10, 20].map(p => (
               <div key={p} style={{ position: "absolute", top: `calc(50% + ${p * 2}px)`, left: "50%", transform: "translateX(-50%)", width: "30px", height: "1px", background: "white" }} />
             ))}
          </div>
        </div>

        {/* Retícula Fija Blanca Central */}
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", display: "flex", alignItems: "center" }}>
           <div style={{ width: "15px", height: "3px", background: "#fcd34d" }} />
           <div style={{ width: "6px", height: "6px", borderRadius: "50%", border: "2px solid #fcd34d", margin: "0 4px" }} />
           <div style={{ width: "15px", height: "3px", background: "#fcd34d" }} />
        </div>
      </div>

      {/* MINI COMPASS (Reutilizando HSI y reduciendo escala con Transform) */}
      <div style={{
        width: "140px", height: "140px", borderRadius: "50%",
        border: "2px solid rgba(0, 229, 204, 0.6)",
        overflow: "hidden", position: "relative",
        boxShadow: "0 0 20px rgba(0, 229, 204, 0.4)",
        background: "rgba(10, 13, 20, 0.9)"
      }}>
         <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%) scale(0.7)", transformOrigin: "center center" }}>
            <HSICompass yaw={yaw} isMini={true} />
         </div>
      </div>
    </div>
  );
};

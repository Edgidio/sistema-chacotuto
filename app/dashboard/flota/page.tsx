"use client";

import { useState } from "react";
import useSWR from "swr";
import TopBar from "../../components/TopBar/TopBar";
import topBarStyles from "../../components/TopBar/TopBar.module.css";
import FleetList from "../../components/FleetList/FleetList";
import { DroneData } from "../../components/DroneCard/DroneCard";
import { getApiUrl, getToken } from "../../lib/auth";

type FilterType = "todos" | "online" | "offline";

interface DronesResponse {
  drones: DroneData[];
  total: number;
}

const fetcher = (url: string) => {
  const token = getToken();
  return fetch(url, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  }).then((res) => {
    if (!res.ok) throw new Error("Error fetching drones");
    return res.json();
  });
};

export default function FlotaPage() {
  const [filter, setFilter] = useState<FilterType>("todos");

  // Fetch drones using SWR. Polls every 3 seconds for real-time dashboard updates.
  const { data, error, isLoading, mutate } = useSWR<DronesResponse>(
    `${getApiUrl()}/api/drones`,
    fetcher,
    { refreshInterval: 3000 }
  );

  const rawDrones = data?.drones || [];

  // Determine connected/active drones vs offline
  const filteredDrones = rawDrones.filter(d => {
    if (filter === "online") return d.isOnline;
    if (filter === "offline") return !d.isOnline;
    return true; // "todos"
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <TopBar 
        title="Estado de la Flota" 
        subtitle={`Drones detectados: ${data?.total ?? 0}`}
        actions={
          <div style={{ display: "flex", gap: "var(--space-2)" }}>
            {/* Filter: Todos */}
            <button 
              className={topBarStyles.actionBtn}
              style={filter === "todos" ? { background: "var(--hud-cyan-mute)", borderColor: "var(--hud-cyan)", color: "var(--hud-cyan)" } : {}}
              onClick={() => setFilter("todos")}
            >
              Todos
            </button>

            {/* Filter: Activos */}
            <button 
              className={topBarStyles.actionBtn}
              style={filter === "online" ? { background: "var(--hud-cyan-mute)", borderColor: "var(--hud-cyan)", color: "var(--hud-cyan)" } : {}}
              onClick={() => setFilter("online")}
            >
              <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "var(--telemetry-green)" }} />
              Disponibles
            </button>

            {/* Filter: Inactivos */}
            <button 
              className={topBarStyles.actionBtn}
              style={filter === "offline" ? { background: "var(--hud-cyan-mute)", borderColor: "var(--hud-cyan)", color: "var(--hud-cyan)" } : {}}
              onClick={() => setFilter("offline")}
            >
              <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "var(--ink-muted)" }} />
              Desconectados
            </button>

            <div style={{ width: "1px", background: "var(--wire)", margin: "0 var(--space-2)" }} />

            {/* Manual Sync */}
            <button className={topBarStyles.actionBtn} onClick={() => mutate()}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
              Sincronizar
            </button>
          </div>
        }
      />

      <div style={{ flex: 1, position: "relative" }}>
        {isLoading ? (
           <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--ink-tertiary)" }}>
             <div className="spinner" style={{ width: "24px", height: "24px", border: "2px solid rgba(0, 229, 204, 0.2)", borderTopColor: "var(--hud-cyan)", borderRadius: "50%", animation: "spin 1s linear infinite", marginBottom: "var(--space-4)" }} />
             <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "12px", letterSpacing: "2px" }}>BARRIDO DE TRANSMISIÓN...</span>
           </div>
        ) : error ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--telemetry-red)", fontFamily: "var(--font-mono), monospace" }}>
             <span style={{ fontSize: "24px", marginBottom: "var(--space-2)" }}>⚠️</span>
             Error conectando con los enlaces de radio
          </div>
        ) : rawDrones.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--ink-tertiary)", fontFamily: "var(--font-mono), monospace" }}>
             <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3, marginBottom: "var(--space-4)" }}>
               <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
             </svg>
             <p style={{ letterSpacing: "1px", margin: 0 }}>NO HAY DRONES DETECTADOS EN EL ESPECTRO</p>
             <p style={{ fontSize: "11px", opacity: 0.5, marginTop: "var(--space-2)" }}>Esperando señales de telemetría...</p>
          </div>
        ) : filteredDrones.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--ink-muted)", fontFamily: "var(--font-mono), monospace" }}>
             <p style={{ letterSpacing: "1px" }}>NO SE ENCONTRARON RESULTADOS PARA ESTE FILTRO</p>
          </div>
        ) : (
          <FleetList drones={filteredDrones} />
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

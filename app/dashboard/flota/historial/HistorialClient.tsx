"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import useSWR from "swr";
import dynamic from "next/dynamic";
import MapWrapper from "../../../components/MissionMap/MapWrapper";
import { Waypoint } from "../../../components/MissionMap/MissionMap";
import { getApiUrl, getToken } from "../../../lib/auth";

interface APIMission {
  missionId: string;
  droneId: string;
  status: string;
  waypoints: Waypoint[];
  startLat: number;
  startLng: number;
  startAlt: number;
  createdAt: string;
}

interface MissionsResponse {
  missions: APIMission[];
  total: number;
}

interface TelemetryPoint {
  lat: number;
  lng: number;
  alt: number;
  timestamp: number;
  pitch: number;
  roll: number;
  yaw: number;
}

interface TelemetryResponse {
  telemetry: TelemetryPoint[];
  total: number;
}

const fetcher = (url: string) => {
  const token = getToken();
  return fetch(url, { headers: { "Authorization": `Bearer ${token}` } }).then((res) => {
    if (!res.ok) throw new Error("Error fetching");
    return res.json();
  });
};

const DynamicThreeDIndicator = dynamic(() => import("../../../components/ThreeDIndicator/ThreeDIndicator"), {
  ssr: false,
  loading: () => <div style={{width: "280px", height: "220px", background: "var(--void)", border: "1px solid var(--wire)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--hud-cyan)", fontFamily: "var(--font-mono)", fontSize: "10px"}}>INICIALIZANDO MOTOR 3D...</div>
});

function calculateDistanceAndSpeed(t1: TelemetryPoint, t2: TelemetryPoint) {
  if (!t1 || !t2) return { distance: 0, speed: 0 };
  const R = 6371e3; // meters
  const f1 = t1.lat * Math.PI/180;
  const f2 = t2.lat * Math.PI/180;
  const df = (t2.lat - t1.lat) * Math.PI/180;
  const dl = (t2.lng - t1.lng) * Math.PI/180;
  const a = Math.sin(df/2) * Math.sin(df/2) + Math.cos(f1) * Math.cos(f2) * Math.sin(dl/2) * Math.sin(dl/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const d = R * c; // distance in meters

  const dt = Math.abs(t2.timestamp - t1.timestamp) / 1000; // seconds
  const speed = dt > 0 ? (d / dt) : 0; // m/s

  return { distance: d, speed };
}

export default function HistorialClient({ droneId }: { droneId: string }) {
  const [selectedMission, setSelectedMission] = useState<APIMission | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackIndex, setPlaybackIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [totalDistance, setTotalDistance] = useState(0);
  const [elapsedTimeStr, setElapsedTimeStr] = useState("00:00");

  const { data, error, isLoading } = useSWR<MissionsResponse>(
    `${getApiUrl()}/api/missions?droneId=${droneId}`,
    fetcher
  );

  const { data: telemetryData, isValidating: isLoadingTelem } = useSWR<TelemetryResponse>(
    selectedMission ? `${getApiUrl()}/api/drones/${droneId}/telemetry?mission=${selectedMission.missionId}&limit=2000` : null,
    fetcher
  );

  const missions = data?.missions || [];
  const rawTelemetry = Array.isArray(telemetryData?.telemetry) ? [...telemetryData.telemetry].reverse() : [];
  
  const telemetryList: TelemetryPoint[] = rawTelemetry.map((t: any) => ({
    lat: t.gps?.lat ?? t.lat ?? 0,
    lng: t.gps?.lng ?? t.lng ?? 0,
    alt: t.gps?.alt ?? t.alt ?? 0,
    pitch: t.orientation?.pitch ?? t.pitch ?? 0,
    roll: t.orientation?.roll ?? t.roll ?? 0,
    yaw: t.orientation?.yaw ?? t.yaw ?? 0,
    timestamp: t.timestamp || Date.now(),
  }));

  useEffect(() => {
    setIsPlaying(false);
    setPlaybackIndex(0);
    setCurrentSpeed(0);
    setTotalDistance(0);
    setElapsedTimeStr("00:00");
  }, [selectedMission]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && telemetryList.length > 0) {
      interval = setInterval(() => {
        setPlaybackIndex(prev => {
          if (prev >= telemetryList.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          const next = prev + 1;
          
          if (next > 0) {
             const t1 = telemetryList[next - 1];
             const t2 = telemetryList[next];
             const { distance, speed } = calculateDistanceAndSpeed(t1, t2);
             
             setCurrentSpeed(speed);
             setTotalDistance(d => d + distance);

             const tStart = telemetryList[0].timestamp;
             const diffSecs = Math.floor(Math.abs(t2.timestamp - tStart) / 1000);
             const m = Math.floor(diffSecs / 60).toString().padStart(2, '0');
             const s = (diffSecs % 60).toString().padStart(2, '0');
             setElapsedTimeStr(`${m}:${s}`);
          }
          
          return next;
        });
      }, 100 / playbackSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, telemetryList, playbackSpeed]);

  const mapStartPoint = selectedMission ? {
    lat: selectedMission.startLat,
    lng: selectedMission.startLng,
    alt: selectedMission.startAlt,
    action: "takeoff",
    index: 0
  } : null;

  const replayTrajectory = telemetryList.slice(0, playbackIndex + 1).map(p => [p.lat, p.lng] as [number, number]);
  const replayDronePosition = telemetryList[playbackIndex] ? [telemetryList[playbackIndex].lat, telemetryList[playbackIndex].lng] as [number, number] : undefined;

  const currentPitch = telemetryList[playbackIndex]?.pitch || 0;
  const currentRoll = telemetryList[playbackIndex]?.roll || 0;
  const currentYaw = telemetryList[playbackIndex]?.yaw || 0;

  const togglePlayback = () => {
    if (playbackIndex >= telemetryList.length - 1) {
      setPlaybackIndex(0);
      setTotalDistance(0);
      setCurrentSpeed(0);
      setElapsedTimeStr("00:00");
    }
    setIsPlaying(!isPlaying);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'var(--telemetry-green)';
      case 'cancelled': return 'var(--telemetry-red)';
      case 'in_progress': return 'var(--hud-cyan)';
      case 'pending': return 'var(--telemetry-amber)';
      default: return 'var(--ink-muted)';
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <header style={{ 
        display: "flex", alignItems: "center", justifyContent: "space-between", 
        padding: "var(--space-4) var(--space-6)", borderBottom: "1px solid var(--wire)", background: "var(--void)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
          <Link href="/dashboard/flota" style={{ color: "var(--ink-primary)", textDecoration: "none", fontSize: "14px", fontWeight: 500, padding: "6px 12px", border: "1px solid var(--wire)", borderRadius: "var(--radius-sm)" }}>
            &larr; Volver
          </Link>
          <div style={{ width: "1px", height: "24px", background: "var(--wire)" }} />
          <div>
            <h2 style={{ fontSize: "16px", fontWeight: 600, color: "var(--ink-primary)", margin: 0 }}>Historial de Misiones (Black Box)</h2>
            <p style={{ fontSize: "12px", color: "var(--ink-tertiary)", margin: "4px 0 0", fontFamily: "var(--font-mono)" }}>
              UNIDAD: <span style={{ color: "var(--hud-cyan)" }}>{droneId}</span>
            </p>
          </div>
        </div>
      </header>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <aside style={{ 
          width: "320px", background: "var(--surface-flat)", borderRight: "1px solid var(--wire)",
          display: "flex", flexDirection: "column", overflowY: "auto"
        }}>
          {isLoading ? (
            <div style={{ padding: "var(--space-6)", textAlign: "center", color: "var(--ink-tertiary)", fontFamily: "var(--font-mono)", fontSize: "11px" }}>CARGANDO...</div>
          ) : missions.length === 0 ? (
            <div style={{ padding: "var(--space-6)", textAlign: "center", color: "var(--ink-muted)", fontSize: "13px" }}>Sin Registros de Vuelo</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {missions.map(mission => (
                <button
                  key={mission.missionId}
                  onClick={() => setSelectedMission(mission)}
                  style={{
                    display: "flex", flexDirection: "column", gap: "6px", textAlign: "left",
                    padding: "var(--space-4)", borderBottom: "1px solid var(--wire)",
                    background: selectedMission?.missionId === mission.missionId ? "rgba(0, 229, 204, 0.05)" : "transparent",
                    borderLeft: selectedMission?.missionId === mission.missionId ? "3px solid var(--hud-cyan)" : "3px solid transparent",
                    cursor: "pointer", transition: "all 0.2s"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)", color: "var(--ink-primary)", fontWeight: 600 }}>
                      {mission.missionId.split("-")[1]?.toUpperCase() || mission.missionId}
                    </span>
                    <span style={{ 
                      fontSize: "9px", fontFamily: "var(--font-mono)", padding: "2px 6px", borderRadius: "2px",
                      color: getStatusColor(mission.status), border: `1px solid ${getStatusColor(mission.status)}4010`,
                      backgroundColor: `${getStatusColor(mission.status)}10`
                    }}>
                      {mission.status.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--ink-tertiary)" }}>FECHA: {new Date(mission.createdAt).toLocaleString('es-VE')}</div>
                  <div style={{ fontSize: "11px", color: "var(--ink-muted)" }}>Waypoints: {mission.waypoints?.length || 0}</div>
                </button>
              ))}
            </div>
          )}
        </aside>

        <main style={{ flex: 1, position: "relative" }}>
          {selectedMission ? (
            <>
              <MapWrapper 
                waypoints={selectedMission.waypoints} 
                startPoint={mapStartPoint} 
                onMapClick={() => {}} 
                replayTrajectory={replayTrajectory}
                replayDronePosition={replayDronePosition}
              />
              <div style={{ position: "absolute", top: "var(--space-6)", right: "var(--space-6)", zIndex: 1000 }}>
                <DynamicThreeDIndicator pitch={currentPitch} roll={currentRoll} yaw={currentYaw} />
              </div>

              <div style={{
                position: "absolute", bottom: "var(--space-6)", left: "50%", transform: "translateX(-50%)",
                background: "rgba(10, 10, 10, 0.85)", backdropFilter: "blur(8px)",
                border: "1px solid var(--wire-emphasis)", borderRadius: "var(--radius-md)",
                padding: "var(--space-4) var(--space-5)", display: "flex", gap: "var(--space-6)", alignItems: "center",
                boxShadow: "0 8px 32px rgba(0,0,0,0.5)", zIndex: 9999
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                  <button onClick={togglePlayback} disabled={isLoadingTelem || telemetryList.length === 0} style={{ width: "40px", height: "40px", borderRadius: "50%", border: "none", cursor: "pointer", background: isPlaying ? "var(--wire-emphasis)" : "var(--hud-cyan)", color: isPlaying ? "var(--ink-primary)" : "var(--control-bg)", display: "flex", alignItems: "center", justifyContent: "center", opacity: (isLoadingTelem || telemetryList.length === 0) ? 0.5 : 1 }}>
                    {isPlaying ? <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> : <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: "4px" }}><polygon points="5 3 19 12 5 21 5 3"/></svg>}
                  </button>
                  <div style={{ display: "flex", background: "var(--control-bg)", border: "1px solid var(--wire)", borderRadius: "4px", overflow: "hidden" }}>
                    {[1, 4, 10].map(speed => <button key={speed} onClick={() => setPlaybackSpeed(speed)} style={{ background: playbackSpeed === speed ? "var(--wire)" : "transparent", color: playbackSpeed === speed ? "var(--ink-primary)" : "var(--ink-muted)", border: "none", padding: "4px 8px", fontSize: "11px", fontFamily: "var(--font-mono)", cursor: "pointer" }}>{speed}x</button>)}
                  </div>
                </div>
                <div style={{ width: "1px", height: "32px", background: "var(--wire-soft)" }} />
                <div style={{ display: "flex", gap: "var(--space-6)" }}>
                  <div style={{ display: "flex", flexDirection: "column" }}><span style={{ fontSize: "10px", color: "var(--ink-tertiary)", fontFamily: "var(--font-mono)" }}>TIEMPO</span><span style={{ fontSize: "16px", color: "var(--ink-primary)", fontFamily: "var(--font-mono)", fontWeight: 600 }}>{elapsedTimeStr}</span></div>
                  <div style={{ display: "flex", flexDirection: "column" }}><span style={{ fontSize: "10px", color: "var(--ink-tertiary)", fontFamily: "var(--font-mono)" }}>VELOCIDAD</span><span style={{ fontSize: "16px", color: "var(--text-accent)", fontFamily: "var(--font-mono)", fontWeight: 600 }}>{currentSpeed.toFixed(1)} <span style={{ fontSize: "10px", color: "var(--ink-muted)" }}>m/s</span></span></div>
                  <div style={{ display: "flex", flexDirection: "column" }}><span style={{ fontSize: "10px", color: "var(--ink-tertiary)", fontFamily: "var(--font-mono)" }}>DISTANCIA</span><span style={{ fontSize: "16px", color: "var(--telemetry-amber)", fontFamily: "var(--font-mono)", fontWeight: 600 }}>{totalDistance.toFixed(0)} <span style={{ fontSize: "10px", color: "var(--ink-muted)" }}>m</span></span></div>
                </div>
                <div style={{ width: "1px", height: "32px", background: "var(--wire-soft)" }} />
                <div style={{ display: "flex", flexDirection: "column", minWidth: "120px" }}>
                   <span style={{ fontSize: "10px", color: "var(--ink-tertiary)", fontFamily: "var(--font-mono)" }}>PROGRESO CAJA NEGRA</span>
                   <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                      <div style={{ flex: 1, height: "4px", background: "var(--wire)", borderRadius: "2px", overflow: "hidden" }}><div style={{ width: `${telemetryList.length > 0 ? (playbackIndex / (telemetryList.length - 1)) * 100 : 0}%`, height: "100%", background: "var(--hud-cyan)", transition: "width 0.2s linear" }} /></div>
                      <span style={{ fontSize: "11px", color: "var(--ink-muted)", fontFamily: "var(--font-mono)" }}>{playbackIndex}/{telemetryList.length}</span>
                   </div>
                </div>
                {isLoadingTelem && <div style={{ position: "absolute", top: -30, right: 0, fontSize: "10px", color: "var(--hud-cyan)", fontFamily: "var(--font-mono)" }}>DESCARGANDO TELEMETRÍA...</div>}
              </div>
            </>
          ) : (
             <div style={{ height: "100%", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--void)", color: "var(--ink-tertiary)" }}>
               <div style={{ fontFamily: "var(--font-mono)", fontSize: "12px", letterSpacing: "2px" }}>SELECCIONE UNA MISIÓN PARA VISUALIZAR EL TRAZADO</div>
             </div>
          )}
        </main>
      </div>
    </div>
  );
}

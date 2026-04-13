"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import useSWR from "swr";
import dynamic from "next/dynamic";
import MapWrapper from "../../../components/MissionMap/MapWrapper";
import { Waypoint } from "../../../components/MissionMap/MissionMap";
import styles from "./Historial.module.css";
import TopBar from "../../../components/TopBar/TopBar";
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
    if (!res.ok) throw new Error("Error");
    return res.json();
  });
};

const DynamicThreeDIndicator = dynamic(() => import("../../../components/ThreeDIndicator/ThreeDIndicator"), {
  ssr: false,
  loading: () => <div className={styles.spinner} />
});

function calculateDistanceAndSpeed(t1: TelemetryPoint, t2: TelemetryPoint) {
  if (!t1 || !t2) return { distance: 0, speed: 0 };
  const R = 6371e3;
  const f1 = t1.lat * Math.PI/180;
  const f2 = t2.lat * Math.PI/180;
  const df = (t2.lat - t1.lat) * Math.PI/180;
  const dl = (t2.lng - t1.lng) * Math.PI/180;
  const a = Math.sin(df/2) * Math.sin(df/2) + Math.cos(f1) * Math.cos(f2) * Math.sin(dl/2) * Math.sin(dl/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const d = R * c;
  const dt = Math.abs(t2.timestamp - t1.timestamp) / 1000;
  const speed = dt > 0 ? (d / dt) : 0;
  return { distance: d, speed };
}

const STATUS_MAP: Record<string, { label: string, color: string }> = {
  completed: { label: "Completada", color: "var(--telemetry-green)" },
  cancelled: { label: "Cancelada", color: "var(--telemetry-red)" },
  in_progress: { label: "En Vuelo", color: "var(--hud-cyan)" },
  pending: { label: "Pendiente", color: "var(--telemetry-amber)" },
};

export default function HistorialClient({ droneId }: { droneId: string }) {
  const [selectedMission, setSelectedMission] = useState<APIMission | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackIndex, setPlaybackIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [totalDistance, setTotalDistance] = useState(0);
  const [elapsedTimeStr, setElapsedTimeStr] = useState("00:00");

  const { data, isLoading } = useSWR<MissionsResponse>(
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
      setElapsedTimeStr("00:00");
    }
    setIsPlaying(!isPlaying);
  };

  const shortId = droneId.split('-')[0].toUpperCase() + '...' + droneId.split('-').pop()?.slice(-4).toUpperCase();

  return (
    <div className={styles.container}>
      <TopBar 
        title="Registro de caja negra" 
        unit={selectedMission ? `MISN-${selectedMission.missionId.slice(-4).toUpperCase()}` : `UNIDAD-${droneId.slice(-4).toUpperCase()}`}
        backHref="/dashboard/flota"
      />

      <div className={styles.content}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>Historial de Misiones</div>
          <div className={styles.missionList}>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={styles.missionCard} style={{ opacity: 0.5 }}>
                  <div className={styles.spinner} />
                </div>
              ))
            ) : missions.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>📂</div>
                <div className={styles.emptyText}>SIN REGISTROS DE VUELO DISPONIBLES</div>
              </div>
            ) : (
              missions.map(mission => {
                const status = STATUS_MAP[mission.status] || { label: mission.status, color: "var(--ink-muted)" };
                const date = new Date(mission.createdAt).toLocaleDateString("es-ES", {
                  day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
                });
                return (
                  <button
                    key={mission.missionId}
                    onClick={() => setSelectedMission(mission)}
                    className={`${styles.missionCard} ${selectedMission?.missionId === mission.missionId ? styles.missionCardActive : ""}`}
                  >
                    <div className={styles.cardHeader}>
                      <span className={styles.missionName}>MISIÓN #{mission.missionId.slice(-4).toUpperCase()}</span>
                      <span className={styles.cardStatus} style={{ color: status.color, border: `1px solid ${status.color}30`, background: `${status.color}10` }}>
                        {status.label}
                      </span>
                    </div>
                    <div className={styles.cardMeta}>
                      <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>Fecha</span>
                        <span className={styles.metaVal}>{date}</span>
                      </div>
                      <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>Puntos</span>
                        <span className={styles.metaVal}>{mission.waypoints?.length || 0}</span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <main className={styles.main}>
          {selectedMission ? (
            <>
              <MapWrapper 
                waypoints={selectedMission.waypoints} 
                startPoint={mapStartPoint} 
                onMapClick={() => {}} 
                replayTrajectory={replayTrajectory}
                replayDronePosition={replayDronePosition}
              />
              
              <div className={styles.hudOverlay}>
                <DynamicThreeDIndicator pitch={currentPitch} roll={currentRoll} yaw={currentYaw} />
              </div>

              <div className={styles.scrubber}>
                <div className={styles.playSection}>
                  <button onClick={togglePlayback} disabled={isLoadingTelem || telemetryList.length === 0} className={styles.playBtn}>
                    {isPlaying ? 
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> : 
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: "4px" }}><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    }
                  </button>
                  <div className={styles.speedSelector}>
                    {[1, 4, 10].map(speed => (
                      <button 
                        key={speed} 
                        onClick={() => setPlaybackSpeed(speed)} 
                        className={`${styles.speedBtn} ${playbackSpeed === speed ? styles.speedBtnActive : ""}`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.statsSection}>
                  <div className={styles.statBlock}>
                    <span className={styles.statLabel}>TIEMPO</span>
                    <span className={styles.statVal}>{elapsedTimeStr}</span>
                  </div>
                  <div className={styles.statBlock}>
                    <span className={styles.statLabel}>VELOCIDAD</span>
                    <span className={styles.statVal}>{currentSpeed.toFixed(1)} <small style={{ fontSize: "10px", opacity: 0.5 }}>m/s</small></span>
                  </div>
                  <div className={styles.statBlock}>
                    <span className={styles.statLabel}>DISTANCIA</span>
                    <span className={styles.statVal}>{totalDistance.toFixed(0)} <small style={{ fontSize: "10px", opacity: 0.5 }}>m</small></span>
                  </div>
                </div>

                <div className={styles.progressSection}>
                  <div className={styles.progressStats}>
                    <span>REPRODUCCIÓN</span>
                    <span>{playbackIndex} / {telemetryList.length}</span>
                  </div>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill} 
                      style={{ width: `${telemetryList.length > 0 ? (playbackIndex / (telemetryList.length - 1)) * 100 : 0}%` }} 
                    />
                  </div>
                </div>
                {isLoadingTelem && <div style={{ position: "absolute", top: -20, right: 20, fontSize: "10px", color: "var(--hud-cyan)", fontFamily: "var(--font-mono)" }}>CARGANDO DATOS...</div>}
              </div>
            </>
          ) : (
             <div className={styles.emptyState}>
               <div className={styles.emptyIcon}>🛰️</div>
               <div className={styles.emptyText}>SELECCIONE UNA MISIÓN PARA ANALIZAR LA TELEMETRÍA</div>
             </div>
          )}
        </main>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import useSWR from "swr";
import dynamic from "next/dynamic";
import { Waypoint } from "../../../components/MissionMap/MissionMap";
import styles from "./Historial.module.css";
import TopBar from "../../../components/TopBar/TopBar";
import { getApiUrl, getToken } from "../../../lib/auth";

const TacticalMapLive = dynamic(() => import("../../../components/TacticalUI/TacticalMapLive"), {
  ssr: false,
  loading: () => (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#02040a", color: "var(--hud-cyan)", fontFamily: "var(--font-mono)" }}>
      CARGANDO MAPA TÁCTICO...
    </div>
  ),
});

const DynamicThreeDIndicator = dynamic(() => import("../../../components/ThreeDIndicator/ThreeDIndicator"), {
  ssr: false,
  loading: () => <div className={styles.spinner} />,
});

// ─── Tipos ────────────────────────────────────────────────────────────────────
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

// ─── Config ───────────────────────────────────────────────────────────────────
const PAGE_SIZE = 2000;

// ─── Fetcher autenticado ──────────────────────────────────────────────────────
const fetcher = (url: string) => {
  const token = getToken();
  return fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then((res) => {
    if (!res.ok) throw new Error("Error");
    return res.json();
  });
};

// ─── Parse raw telemetry ──────────────────────────────────────────────────────
function parsePoint(t: any): TelemetryPoint {
  return {
    lat: t.gps?.lat ?? t.lat ?? 0,
    lng: t.gps?.lng ?? t.lng ?? 0,
    alt: t.gps?.alt ?? t.alt ?? 0,
    pitch: t.orientation?.pitch ?? t.pitch ?? 0,
    roll: t.orientation?.roll ?? t.roll ?? 0,
    yaw: t.orientation?.yaw ?? t.yaw ?? 0,
    timestamp: t.timestamp || Date.now(),
  };
}

// ─── Hook: carga progresiva completa de telemetría ───────────────────────────
// El backend ordena DESC (más nuevo primero).
// Descargamos todas las páginas en paralelo → concatenamos → invertimos → ASC
function useAllTelemetry(droneId: string, missionId: string | null) {
  const [points, setPoints] = useState<TelemetryPoint[]>([]);
  const [total, setTotal] = useState(0);
  const [pagesLoaded, setPagesLoaded] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!missionId) {
      setPoints([]);
      setTotal(0);
      setPagesLoaded(0);
      setTotalPages(0);
      return;
    }

    if (abortRef.current) abortRef.current.abort();
    const abort = new AbortController();
    abortRef.current = abort;

    setPoints([]);
    setTotal(0);
    setPagesLoaded(0);
    setTotalPages(0);
    setIsLoading(true);

    const token = getToken();
    const headers = { Authorization: `Bearer ${token}` };
    const base = `${getApiUrl()}/api/drones/${droneId}/telemetry?mission=${missionId}&limit=${PAGE_SIZE}`;

    async function load() {
      try {
        const res1 = await fetch(`${base}&page=1`, { headers, signal: abort.signal });
        if (!res1.ok) return;
        const data1 = await res1.json();
        const grandTotal: number = data1.total ?? 0;
        const nPages = Math.ceil(grandTotal / PAGE_SIZE);

        setTotal(grandTotal);
        setTotalPages(nPages);
        setPagesLoaded(1);

        const pageResults: any[][] = new Array(nPages);
        pageResults[0] = Array.isArray(data1.telemetry) ? data1.telemetry : [];

        if (nPages > 1) {
          const remaining = Array.from({ length: nPages - 1 }, (_, i) => i + 2);
          await Promise.all(
            remaining.map(async (page) => {
              const res = await fetch(`${base}&page=${page}`, { headers, signal: abort.signal });
              if (!res.ok) return;
              const d = await res.json();
              pageResults[page - 1] = Array.isArray(d.telemetry) ? d.telemetry : [];
              setPagesLoaded((prev) => prev + 1);
            })
          );
        }

        if (abort.signal.aborted) return;

        // Concat todas las páginas (DESC) → reverse → ASC cronológico
        const all = pageResults.flatMap((p) => p ?? []);
        setPoints(all.reverse().map(parsePoint));
      } catch (e: any) {
        if (e.name !== "AbortError") console.error("Error cargando telemetría", e);
      } finally {
        if (!abort.signal.aborted) setIsLoading(false);
      }
    }

    load();
    return () => { abort.abort(); };
  }, [droneId, missionId]);

  return { points, total, pagesLoaded, totalPages, isLoading };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function calcDistSpeed(t1: TelemetryPoint, t2: TelemetryPoint) {
  if (!t1 || !t2) return { distance: 0, speed: 0 };
  const R = 6371e3;
  const f1 = (t1.lat * Math.PI) / 180;
  const f2 = (t2.lat * Math.PI) / 180;
  const df = ((t2.lat - t1.lat) * Math.PI) / 180;
  const dl = ((t2.lng - t1.lng) * Math.PI) / 180;
  const a = Math.sin(df / 2) ** 2 + Math.cos(f1) * Math.cos(f2) * Math.sin(dl / 2) ** 2;
  const d = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const dt = Math.abs(t2.timestamp - t1.timestamp) / 1000;
  return { distance: d, speed: dt > 0 ? d / dt : 0 };
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  completed:   { label: "Completada", color: "var(--telemetry-green)" },
  cancelled:   { label: "Cancelada",  color: "var(--telemetry-red)"   },
  in_progress: { label: "En Vuelo",   color: "var(--hud-cyan)"        },
  pending:     { label: "Pendiente",  color: "var(--telemetry-amber)" },
};

// ─── Componente principal ─────────────────────────────────────────────────────
export default function HistorialClient({ droneId }: { droneId: string }) {
  const [selectedMission, setSelectedMission] = useState<APIMission | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackIndex, setPlaybackIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [totalDistance, setTotalDistance] = useState(0);
  const [elapsedTimeStr, setElapsedTimeStr] = useState("00:00");

  // ── WP completados (estado monotónico, O(1) por frame) ───────────────────
  // Convención igual al backend en vivo:
  //   replayWpIdx = próximo WP por alcanzar
  //   WP con index < replayWpIdx → completado (verde)
  //   WP con index === replayWpIdx → en ruta (cyan)
  const [replayWpIdx, setReplayWpIdx] = useState(1);

  // Lista de misiones
  const { data, isLoading: isLoadingMissions } = useSWR<MissionsResponse>(
    `${getApiUrl()}/api/missions?droneId=${droneId}`,
    fetcher
  );
  const missions = data?.missions || [];

  // Carga progresiva de telemetría completa
  const { points: telemetryList, total: telemTotal, pagesLoaded, totalPages, isLoading: isLoadingTelem } =
    useAllTelemetry(droneId, selectedMission?.missionId ?? null);

  const loadPercent = totalPages > 0 ? Math.round((pagesLoaded / totalPages) * 100) : 0;

  // Reset al cambiar misión
  useEffect(() => {
    setIsPlaying(false);
    setPlaybackIndex(0);
    setCurrentSpeed(0);
    setTotalDistance(0);
    setElapsedTimeStr("00:00");
    setReplayWpIdx(selectedMission?.waypoints?.[0]?.index ?? 1);
  }, [selectedMission]);

  // Reset replayWpIdx cuando llegan nuevos datos de telemetría
  useEffect(() => {
    setReplayWpIdx(selectedMission?.waypoints?.[0]?.index ?? 1);
    setPlaybackIndex(0);
  }, [telemetryList, selectedMission]);

  // Bucle de reproducción
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && telemetryList.length > 0) {
      interval = setInterval(() => {
        setPlaybackIndex((prev) => {
          if (prev >= telemetryList.length - 1) { setIsPlaying(false); return prev; }
          const next = prev + 1;
          const prevP = telemetryList[prev];
          const nextP = telemetryList[next];

          // Acumular distancia de forma granular (micro-pasos)
          const microStep = calcDistSpeed(prevP, nextP);
          setTotalDistance((d) => d + microStep.distance);

          // Calcular velocidad de forma suavizada (ventana de 1.5 segundos)
          // Esto evita que salte a 0 constante cuando el GPS no se ha refrescado en milisegundos
          let backIdx = next;
          while (backIdx > 0 && nextP.timestamp - telemetryList[backIdx - 1].timestamp <= 1500) {
            backIdx--;
          }
          if (backIdx < next && (nextP.timestamp - telemetryList[backIdx].timestamp > 0)) {
            const smoothed = calcDistSpeed(telemetryList[backIdx], nextP);
            setCurrentSpeed(smoothed.speed);
          } else {
            setCurrentSpeed(microStep.speed);
          }

          const diffSecs = Math.floor(Math.abs(nextP.timestamp - telemetryList[0].timestamp) / 1000);
          setElapsedTimeStr(
            `${Math.floor(diffSecs / 60).toString().padStart(2, "0")}:${(diffSecs % 60).toString().padStart(2, "0")}`
          );
          return next;
        });
      }, 100 / playbackSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, telemetryList, playbackSpeed]);

  // Detectar paso por el siguiente WP (O(1) por frame — estado monotónico)
  const currentPoint = telemetryList[playbackIndex];
  useEffect(() => {
    if (!currentPoint || !selectedMission?.waypoints?.length) return;
    const wps = selectedMission.waypoints;
    const nextWp = wps.find((wp) => wp.index === replayWpIdx);
    if (!nextWp) return;
    
    // Calculamos la distancia exacta en metros entre el dron y el waypoint
    const { distance } = calcDistSpeed(currentPoint as any, { lat: nextWp.lat, lng: nextWp.lng, timestamp: currentPoint.timestamp } as any);
    
    const THRESHOLD_METERS = 6; // Radio de 6 metros a la redonda
    if (distance < THRESHOLD_METERS) {
      // El WP replayWpIdx fue alcanzado → pasa a completado, el siguiente es el nuevo "en ruta"
      setReplayWpIdx((prev) => prev + 1);
    }
  }, [playbackIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // Datos del mapa
  const mapStartPoint: Waypoint | null = selectedMission?.startLat
    ? { lat: selectedMission.startLat, lng: selectedMission.startLng, alt: selectedMission.startAlt, action: "start", index: 0 }
    : null;

  const replayDronePos = currentPoint
    ? { lat: currentPoint.lat, lng: currentPoint.lng }
    : mapStartPoint
    ? { lat: mapStartPoint.lat, lng: mapStartPoint.lng }
    : null;

  const replayTrajectory: [number, number][] = telemetryList
    .slice(0, playbackIndex + 1)
    .map((p) => [p.lat, p.lng]);

  const currentPitch = currentPoint?.pitch || 0;
  const currentRoll  = currentPoint?.roll  || 0;
  const currentYaw   = currentPoint?.yaw   || 0;

  const togglePlayback = () => {
    if (playbackIndex >= telemetryList.length - 1) {
      setPlaybackIndex(0);
      setTotalDistance(0);
      setElapsedTimeStr("00:00");
      setReplayWpIdx(0);
    }
    setIsPlaying((p) => !p);
  };

  return (
    <div className={styles.container}>
      <TopBar
        title="Registro de caja negra"
        unit={selectedMission ? `MISN-${selectedMission.missionId.slice(-4).toUpperCase()}` : `UNIDAD-${droneId.slice(-4).toUpperCase()}`}
        backHref="/dashboard/flota"
      />

      <div className={styles.content}>
        {/* ── Sidebar ── */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>Historial de Misiones</div>
          <div className={styles.missionList}>
            {isLoadingMissions ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={styles.missionCard} style={{ opacity: 0.5 }}><div className={styles.spinner} /></div>
              ))
            ) : missions.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>📂</div>
                <div className={styles.emptyText}>SIN REGISTROS DE VUELO DISPONIBLES</div>
              </div>
            ) : (
              missions.map((mission) => {
                const status = STATUS_MAP[mission.status] || { label: mission.status, color: "var(--ink-muted)" };
                const date = new Date(mission.createdAt).toLocaleDateString("es-ES", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
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
                        <span className={styles.metaLabel}>WPs</span>
                        <span className={styles.metaVal}>{mission.waypoints?.length || 0}</span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* ── Main ── */}
        <main className={styles.main}>
          {selectedMission ? (
            <>
              {/* Mapa táctico */}
              <div style={{ position: "absolute", inset: 0, bottom: "100px" }}>
                {replayDronePos && (
                  <TacticalMapLive
                    dronePos={replayDronePos}
                    waypoints={selectedMission.waypoints || []}
                    startPoint={mapStartPoint}
                    currentWaypointIndex={replayWpIdx}
                    replayTrajectory={replayTrajectory}
                  />
                )}
              </div>

              {/* Visor 3D */}
              <div className={styles.hudOverlay}>
                <DynamicThreeDIndicator pitch={currentPitch} roll={currentRoll} yaw={currentYaw} />
              </div>

              {/* Barra de carga progresiva */}
              {isLoadingTelem && (
                <div style={{
                  position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)",
                  background: "rgba(2,4,10,0.9)", border: "1px solid var(--hud-cyan)",
                  borderRadius: 6, padding: "8px 20px", zIndex: 2000, fontFamily: "var(--font-mono)",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: 260
                }}>
                  <div style={{ fontSize: 10, color: "var(--hud-cyan)", letterSpacing: 1 }}>
                    DESCARGANDO TELEMETRÍA — {pagesLoaded}/{totalPages} páginas ({loadPercent}%)
                  </div>
                  <div style={{ width: "100%", height: 4, background: "rgba(255,255,255,0.05)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ width: `${loadPercent}%`, height: "100%", background: "var(--hud-cyan)", transition: "width 0.3s ease", boxShadow: "0 0 8px var(--hud-cyan)" }} />
                  </div>
                  <div style={{ fontSize: 9, color: "var(--ink-tertiary)" }}>{telemTotal.toLocaleString()} puntos totales</div>
                </div>
              )}

              {/* Scrubber */}
              <div className={styles.scrubber}>
                <div className={styles.playSection}>
                  <button onClick={togglePlayback} disabled={isLoadingTelem || telemetryList.length === 0} className={styles.playBtn}>
                    {isPlaying
                      ? <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                      : <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: "4px" }}><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    }
                  </button>
                  <div className={styles.speedSelector}>
                    {[1, 4, 10, 50].map((speed) => (
                      <button key={speed} onClick={() => setPlaybackSpeed(speed)} className={`${styles.speedBtn} ${playbackSpeed === speed ? styles.speedBtnActive : ""}`}>
                        {speed}x
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.statsSection}>
                  <div className={styles.statBlock}>
                    <span className={styles.statLabel}>TIEMPO</span>
                    <span className={styles.statVal} style={{ whiteSpace: "nowrap" }}>{elapsedTimeStr}</span>
                  </div>
                  <div className={styles.statBlock}>
                    <span className={styles.statLabel}>VELOCIDAD</span>
                    <span className={styles.statVal} style={{ whiteSpace: "nowrap" }}>
                      {(currentSpeed * 3.6).toFixed(1)} <small style={{ fontSize: "12px", opacity: 0.6 }}>km/h</small>
                    </span>
                    <span style={{ fontSize: "10px", color: "var(--ink-tertiary)", marginTop: "1px", whiteSpace: "nowrap", fontFamily: "var(--font-mono)" }}>
                      {currentSpeed.toFixed(1)} m/s
                    </span>
                  </div>
                  <div className={styles.statBlock}>
                    <span className={styles.statLabel}>DISTANCIA</span>
                    <span className={styles.statVal} style={{ whiteSpace: "nowrap" }}>
                      {totalDistance.toFixed(0)} <small style={{ fontSize: "12px", opacity: 0.6 }}>m</small>
                    </span>
                  </div>
                </div>

                <div className={styles.progressSection} style={{ minWidth: "220px" }}>
                  <div className={styles.progressStats}>
                    <span style={{ whiteSpace: "nowrap" }}>REPRODUCCIÓN</span>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                      <span style={{ whiteSpace: "nowrap" }}>
                        {playbackIndex.toLocaleString()} / {telemetryList.length.toLocaleString()}
                      </span>
                      {telemTotal > 0 && (
                        <span style={{ color: "var(--ink-tertiary)", fontSize: "9px", whiteSpace: "nowrap" }}>
                          ({telemTotal.toLocaleString()} total)
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: `${telemetryList.length > 0 ? (playbackIndex / (telemetryList.length - 1)) * 100 : 0}%` }} />
                  </div>
                </div>
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

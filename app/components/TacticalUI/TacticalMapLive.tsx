"use client";

import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useMemo, useState } from "react";
import { Waypoint } from "../MissionMap/MissionMap";

// ─── Drone icon (gold pin) ────────────────────────────────────────────────────
const droneIcon =
  typeof window !== "undefined"
    ? L.icon({
        iconUrl:
          "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png",
        iconRetinaUrl:
          "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      } as L.IconOptions)
    : null;

// ─── Numbered waypoint DivIcon factory ───────────────────────────────────────
function createWaypointIcon(
  index: number,
  state: "completed" | "active" | "pending"
) {
  // Color scheme matching the mobile app
  const colors = {
    completed: { bg: "#22c55e", border: "#16a34a", text: "#fff" },   // green
    active:    { bg: "#00e5cc", border: "#00b5a0", text: "#000" },   // cyan
    pending:   { bg: "rgba(2,4,10,0.85)", border: "#00e5cc", text: "#00e5cc" }, // dark + cyan border
  };
  const c = colors[state];

  const size = state === "active" ? 30 : 26;
  const fontSize = index >= 100 ? 8 : index >= 10 ? 10 : 12;

  return L.divIcon({
    className: "",
    html: `
      <div style="
        width:${size}px;
        height:${size}px;
        border-radius:50%;
        background:${c.bg};
        border:2.5px solid ${c.border};
        color:${c.text};
        font-size:${fontSize}px;
        font-weight:700;
        font-family:monospace;
        display:flex;
        align-items:center;
        justify-content:center;
        box-shadow:${state === "active" ? `0 0 10px ${c.border}, 0 0 20px ${c.border}` : state === "completed" ? "0 0 6px #22c55e" : "none"};
        transition:all 0.3s ease;
        pointer-events:auto;
      ">${index}</div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 4)],
  });
}

// ─── HOME / Start Point DivIcon ─────────────────────────────────────────────
function createHomeIcon() {
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width:30px;
        height:30px;
        border-radius:50%;
        background:rgba(2,4,10,0.85);
        border:2.5px solid #00e5cc;
        color:#00e5cc;
        font-size:13px;
        font-weight:700;
        font-family:monospace;
        display:flex;
        align-items:center;
        justify-content:center;
        box-shadow:none;
      ">S</div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -19],
  });
}

// ─── Auto center / follow ────────────────────────────────────────────────────
interface TacticalMapLiveProps {
  dronePos: { lat: number; lng: number };
  waypoints: Waypoint[];
  startPoint: Waypoint | null;
  currentWaypointIndex: number;
  replayTrajectory?: [number, number][]; // rastro histórico opcional (caja negra)
}

function MapAutoCenter({ center }: { center: [number, number] }) {
  const map = useMap();
  const [isFollowing, setIsFollowing] = useState(true);

  useEffect(() => {
    const handleDrag = () => setIsFollowing(false);
    map.on("dragstart", handleDrag);
    return () => { map.off("dragstart", handleDrag); };
  }, [map]);

  useEffect(() => {
    if (isFollowing && center[0] !== 0 && center[1] !== 0) {
      map.setView(center, map.getZoom(), { animate: true, duration: 0.5 });
    }
  }, [center, map, isFollowing]);

  return null;
}

// ─── Helper: determine waypoint state ────────────────────────────────────────
function getWaypointState(
  wpIndex: number,
  currentWaypointIndex: number
): "completed" | "active" | "pending" {
  if (wpIndex < currentWaypointIndex) return "completed";
  if (wpIndex === currentWaypointIndex) return "active";
  return "pending";
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function TacticalMapLive({
  dronePos,
  waypoints,
  startPoint,
  currentWaypointIndex,
  replayTrajectory,
}: TacticalMapLiveProps) {
  const droneCenter: [number, number] = [dronePos.lat, dronePos.lng];

  // Path segments: completed → green solid, pending → cyan dashed
  const segments = useMemo(() => {
    const res: { positions: [number, number][]; color: string; dashed?: boolean }[] = [];
    if (waypoints.length < 2) return res;

    for (let i = 0; i < waypoints.length - 1; i++) {
      const p1 = waypoints[i];
      const p2 = waypoints[i + 1];
      // segment i→i+1 is "completed" when we are past p2
      const isVisited = p2.index <= currentWaypointIndex;

      res.push({
        positions: [
          [p1.lat, p1.lng],
          [p2.lat, p2.lng],
        ],
        color: isVisited ? "#22c55e" : "#00e5cc",
        dashed: !isVisited,
      });
    }
    return res;
  }, [waypoints, currentWaypointIndex]);

  const completedCount = waypoints.filter(
    (wp) => wp.index < currentWaypointIndex
  ).length;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        borderRadius: "8px",
        overflow: "hidden",
        border: "2px solid var(--hud-cyan)",
      }}
    >
      <MapContainer
        center={
          droneCenter[0] !== 0 ? droneCenter : [10.4806, -66.9036]
        }
        zoom={18}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
          attribution="&copy; Google Maps"
          maxZoom={22}
        />

        <MapAutoCenter center={droneCenter} />

        {/* Replay Trajectory Trail (caja negra) */}
        {replayTrajectory && replayTrajectory.length > 1 && (
          <Polyline
            positions={replayTrajectory}
            color="#fbbf24"
            weight={3}
            opacity={0.75}
            dashArray={undefined}
          />
        )}

        {/* Mission Path Segments */}
        {segments.map((seg, idx) => (
          <Polyline
            key={idx}
            positions={seg.positions}
            color={seg.color}
            weight={3}
            dashArray={seg.dashed ? "8, 8" : undefined}
            opacity={0.85}
          />
        ))}

        {/* HOME / Start Point Marker */}
        {startPoint && (
          <Marker
            position={[startPoint.lat, startPoint.lng]}
            icon={createHomeIcon()}
            zIndexOffset={500}
          >
            <Popup>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  background: "#02040a",
                  color: "#fff",
                  padding: "6px",
                  borderRadius: "4px",
                }}
              >
                <strong style={{ color: "#22c55e" }}>🏠 HOME / TAKEOFF</strong>
                <br />
                LAT: {startPoint.lat.toFixed(6)}
                <br />
                LNG: {startPoint.lng.toFixed(6)}
                <br />
                ALT: {startPoint.alt}m
              </div>
            </Popup>
          </Marker>
        )}

        {/* Numbered Waypoint Markers */}
        {waypoints.map((wp) => {
          const state = getWaypointState(wp.index, currentWaypointIndex);
          const icon = createWaypointIcon(wp.index, state);
          return (
            <Marker key={wp.index} position={[wp.lat, wp.lng]} icon={icon}>
              <Popup>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    background: "#02040a",
                    color: "#fff",
                    padding: "6px",
                    borderRadius: "4px",
                  }}
                >
                  <strong style={{ color: state === "completed" ? "#22c55e" : state === "active" ? "#00e5cc" : "#fff" }}>
                    WP {wp.index}
                  </strong>
                  <br />
                  ALT: {wp.alt}m
                  <br />
                  {state === "completed" ? "✅ COMPLETADO" : state === "active" ? "📍 EN RUTA" : "⏳ PENDIENTE"}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Drone Position */}
        {droneCenter[0] !== 0 && droneIcon && (
          <Marker position={droneCenter} icon={droneIcon} zIndexOffset={1000}>
            <Popup>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", background: "#02040a", color: "#fff", padding: "6px", borderRadius: "4px" }}>
                <strong style={{ color: "#fbbf24" }}>DRON POSICIÓN</strong>
                <br />
                LAT: {dronePos.lat.toFixed(6)}
                <br />
                LNG: {dronePos.lng.toFixed(6)}
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* ── Bottom-right overlay stats ── */}
      <div
        style={{
          position: "absolute",
          bottom: 10,
          right: 10,
          background: "rgba(2, 4, 10, 0.85)",
          padding: "8px 12px",
          borderRadius: "6px",
          border: "1px solid var(--hud-cyan)",
          zIndex: 1000,
          pointerEvents: "none",
          display: "flex",
          flexDirection: "column",
          gap: "2px",
        }}
      >
        <div style={{ fontSize: "9px", color: "var(--ink-tertiary)", letterSpacing: "1px" }}>
          MODO MAPA TÁCTICO
        </div>
        <div style={{ fontSize: "11px", color: "var(--hud-cyan)", fontWeight: "bold" }}>
          SIGUIENDO UNIDAD
        </div>
        {waypoints.length > 0 && (
          <div style={{ fontSize: "10px", color: "#22c55e", fontWeight: "bold", marginTop: "2px" }}>
            WP {currentWaypointIndex}/{waypoints.length} •{" "}
            <span style={{ color: "#22c55e" }}>{completedCount} OK</span>
          </div>
        )}
      </div>

      {/* ── Legend ── */}
      {waypoints.length > 0 && (
        <div
          style={{
            position: "absolute",
            bottom: 10,
            left: 10,
            background: "rgba(2, 4, 10, 0.85)",
            padding: "8px 10px",
            borderRadius: "6px",
            border: "1px solid rgba(255,255,255,0.1)",
            zIndex: 1000,
            pointerEvents: "none",
            display: "flex",
            flexDirection: "column",
            gap: "5px",
          }}
        >
          <LegendDot color="#22c55e" label="Completado" />
          <LegendDot color="#00e5cc" label="En ruta" pulse />
          <LegendDot color="rgba(2,4,10,0.85)" border="#00e5cc" label="Pendiente" />
        </div>
      )}
    </div>
  );
}

function LegendDot({
  color,
  border,
  label,
  pulse,
}: {
  color: string;
  border?: string;
  label: string;
  pulse?: boolean;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <div
        style={{
          width: "11px",
          height: "11px",
          borderRadius: "50%",
          background: color,
          border: border ? `2px solid ${border}` : "none",
          boxShadow: pulse ? `0 0 6px #00e5cc` : "none",
          flexShrink: 0,
        }}
      />
      <span style={{ fontSize: "9px", color: "var(--ink-secondary)", letterSpacing: "0.5px" }}>
        {label}
      </span>
    </div>
  );
}

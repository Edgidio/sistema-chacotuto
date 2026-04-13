"use client";

import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useMemo, useState } from "react";
import { Waypoint } from "../MissionMap/MissionMap";

// Leaflet icon fix for Next.js
const iconOptions = {
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41] as [number, number],
  iconAnchor: [12, 41] as [number, number],
  popupAnchor: [1, -34] as [number, number],
  shadowSize: [41, 41] as [number, number]
};

const droneIcon = typeof window !== 'undefined' ? L.icon({
  ...iconOptions,
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png",
}) : null;

const waypointIcon = typeof window !== 'undefined' ? L.icon({
  ...iconOptions,
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  iconSize: [20, 32] as [number, number],
}) : null;

interface TacticalMapLiveProps {
  dronePos: { lat: number; lng: number };
  waypoints: Waypoint[];
  currentWaypointIndex: number;
}

function MapAutoCenter({ center }: { center: [number, number] }) {
  const map = useMap();
  const [isFollowing, setIsFollowing] = useState(true);

  useEffect(() => {
    const handleDrag = () => setIsFollowing(false);
    map.on("dragstart", handleDrag);
    return () => { map.off("dragstart", handleDrag); }
  }, [map]);

  useEffect(() => {
    if (isFollowing && center[0] !== 0 && center[1] !== 0) {
      map.setView(center, map.getZoom(), { animate: true, duration: 0.5 });
    }
  }, [center, map, isFollowing]);

  return null;
}

export default function TacticalMapLive({ dronePos, waypoints, currentWaypointIndex }: TacticalMapLiveProps) {
  const droneCenter: [number, number] = [dronePos.lat, dronePos.lng];

  // Logic to calculate segments:
  // We draw lines between waypoints. 
  // If a segment is between WP(i) and WP(i+1), and i+1 <= currentWaypointIndex, it's RED.
  // Otherwise it's BLUE.
  
  const segments = useMemo(() => {
    const res: { positions: [number, number][]; color: string; dashed?: boolean }[] = [];
    if (waypoints.length < 2) return res;

    for (let i = 0; i < waypoints.length - 1; i++) {
      const p1 = waypoints[i];
      const p2 = waypoints[i + 1];
      const isVisited = p2.index <= currentWaypointIndex;

      res.push({
        positions: [[p1.lat, p1.lng], [p2.lat, p2.lng]],
        color: isVisited ? "#ef4444" : "#00e5cc", // Red if visited, Cyan/Blue if pending
        dashed: !isVisited
      });
    }
    return res;
  }, [waypoints, currentWaypointIndex]);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", borderRadius: "8px", overflow: "hidden", border: "2px solid var(--hud-cyan)" }}>
      <MapContainer 
        center={droneCenter[0] !== 0 ? droneCenter : [10.4806, -66.9036]} 
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

        {/* Path Segments */}
        {segments.map((seg, idx) => (
          <Polyline 
            key={idx} 
            positions={seg.positions} 
            color={seg.color} 
            weight={4} 
            dashArray={seg.dashed ? "10, 10" : undefined}
            opacity={0.8}
          />
        ))}

        {/* Waypoints */}
        {waypoints.map((wp) => (
          <Marker 
            key={wp.index} 
            position={[wp.lat, wp.lng]} 
            icon={waypointIcon!}
          >
            <Popup>
               <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                  <strong>WAYPOINT {wp.index}</strong><br/>
                  ALT: {wp.alt}m
               </div>
            </Popup>
          </Marker>
        ))}

        {/* Drone Position */}
        {droneCenter[0] !== 0 && droneIcon && (
          <Marker position={droneCenter} icon={droneIcon} zIndexOffset={1000}>
            <Popup>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                 <strong>DRON POSICIÓN</strong><br/>
                 LAT: {dronePos.lat.toFixed(6)}<br/>
                 LNG: {dronePos.lng.toFixed(6)}
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Map Overlay Stats */}
      <div style={{ position: "absolute", bottom: 10, right: 10, background: "rgba(2, 4, 10, 0.8)", padding: "8px 12px", borderRadius: "4px", border: "1px solid var(--hud-cyan)", zIndex: 1000, pointerEvents: "none" }}>
         <div style={{ fontSize: "9px", color: "var(--ink-tertiary)" }}>MODO MAPA TÁCTICO</div>
         <div style={{ fontSize: "11px", color: "var(--hud-cyan)", fontWeight: "bold" }}>SIGUIENDO UNIDAD</div>
      </div>
    </div>
  );
}

"use client";

import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";

// TACTICAL DROP ICONS (PINS) - MAX VISIBILITY
const waypointIcon = typeof window !== 'undefined' ? L.divIcon({
  className: 'custom-div-icon',
  html: `
    <svg width="32" height="42" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 0 6px rgba(0,229,204,0.8));">
      <path d="M12 0C5.37258 0 0 5.37258 0 12C0 21 12 32 12 32C12 32 24 21 24 12C24 5.37258 18.6274 0 12 0Z" fill="var(--hud-cyan)" />
      <circle cx="12" cy="12" r="5" fill="white" />
    </svg>`,
  iconSize: [32, 42],
  iconAnchor: [16, 42],
  popupAnchor: [0, -42]
}) : null;

const startIcon = typeof window !== 'undefined' ? L.divIcon({
  className: 'custom-div-icon',
  html: `
    <svg width="40" height="52" viewBox="0 0 30 40" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 0 8px rgba(34,197,94,0.8));">
      <path d="M15 0C6.71573 0 0 6.71573 0 15C0 26.25 15 40 15 40C15 40 30 26.25 30 15C30 6.71573 23.2843 0 15 0Z" fill="var(--telemetry-green)" />
      <text x="15" y="20" fill="white" font-size="14" font-weight="900" text-anchor="middle" font-family="var(--font-mono)">H</text>
    </svg>`,
  iconSize: [40, 52],
  iconAnchor: [20, 52],
  popupAnchor: [0, -52]
}) : null;

const droneIcon = typeof window !== 'undefined' ? L.divIcon({
  className: 'custom-div-icon',
  html: `
    <div style="transform: rotate(45deg);">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L15 9H9L12 2Z" fill="var(--telemetry-amber)" />
        <circle cx="12" cy="12" r="4" fill="var(--telemetry-amber)" stroke="white" stroke-width="1.5" />
      </svg>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
}) : null;

export interface Waypoint {
  lat: number;
  lng: number;
  alt: number;
  action: string;
  index: number;
}

interface MissionMapProps {
  waypoints: Waypoint[];
  startPoint: Waypoint | null;
  onMapClick: (lat: number, lng: number) => void;
  replayTrajectory?: [number, number][];
  replayDronePosition?: [number, number];
}

function MapClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, map.getZoom(), {
      animate: true,
      duration: 1.5,
    });
  }, [center[0], center[1], map]);
  return null;
}

export default function MissionMap({ waypoints, startPoint, onMapClick, replayTrajectory, replayDronePosition }: MissionMapProps) {
  const center: [number, number] = startPoint ? [startPoint.lat, startPoint.lng] : [10.4806, -66.9036];

  const polylinePositions = [];
  if (startPoint) polylinePositions.push([startPoint.lat, startPoint.lng]);
  waypoints.forEach(wp => polylinePositions.push([wp.lat, wp.lng]));

  return (
    <MapContainer 
      center={center} 
      zoom={16} 
      style={{ height: "100%", width: "100%", background: "var(--void)", zIndex: 1 }}
      zoomControl={false}
    >
      {startPoint && <MapUpdater center={[startPoint.lat, startPoint.lng]} />}
      
      <TileLayer
        url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
        attribution="&copy; Google Maps"
        maxZoom={20}
      />

      <MapClickHandler onClick={onMapClick} />

      {startPoint && startIcon && (
        <Marker position={[startPoint.lat, startPoint.lng]} icon={startIcon}>
          <Popup>HOME / TAKEOFF <br/> {startPoint.lat.toFixed(5)}, {startPoint.lng.toFixed(5)}</Popup>
        </Marker>
      )}

      {waypoints.map((wp, i) => (
        <Marker key={wp.index} position={[wp.lat, wp.lng]} icon={waypointIcon!}>
          <Popup>
            <div style={{ fontFamily: 'var(--font-mono)' }}>
              <strong>WAYPOINT {wp.index}</strong> <br/> 
              ALT: {wp.alt}m <br/>
              ACCIÓN: {wp.action}
            </div>
          </Popup>
        </Marker>
      ))}

      {polylinePositions.length > 1 && (
        <Polyline 
          positions={polylinePositions as [number, number][]} 
          color="#ff5500" 
          weight={6}
          opacity={1}
        />
      )}

      {replayTrajectory && replayTrajectory.length > 1 && (
        <Polyline 
          positions={replayTrajectory} 
          color="var(--telemetry-amber)" 
          weight={3}
          opacity={0.8}
        />
      )}

      {replayDronePosition && droneIcon && (
        <Marker position={replayDronePosition} icon={droneIcon} zIndexOffset={1000}>
          <Popup>POSICIÓN ACTUAL</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}

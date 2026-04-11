"use client";

import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";

// Leaflet icon fix for Next.js
const iconOptions = {
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41] as [number, number],
  iconAnchor: [12, 41] as [number, number],
  popupAnchor: [1, -34] as [number, number],
  tooltipAnchor: [16, -28] as [number, number],
  shadowSize: [41, 41] as [number, number]
};

const defaultIcon = typeof window !== 'undefined' ? L.icon(iconOptions) : null;

// Custom start icon using a green marker
const startIcon = typeof window !== 'undefined' ? L.icon({
  ...iconOptions,
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
}) : null;

// Drone icon for replay
const droneIcon = typeof window !== 'undefined' ? L.icon({
  ...iconOptions,
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png",
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
  // Center map on Caracas, Venezuela as assumed for default, or startPoint
  const center: [number, number] = startPoint ? [startPoint.lat, startPoint.lng] : [10.4806, -66.9036];

  // Positions for polyline (startPoint + waypoints)
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
      <MapUpdater center={center} />
      
      {/* Google Maps Hybrid Tiles */}
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
        <Marker key={wp.index} position={[wp.lat, wp.lng]} icon={defaultIcon!}>
          <Popup>
            <div style={{ fontFamily: 'var(--font-mono)' }}>
              <strong>WP {wp.index}</strong> <br/> 
              Lat: {wp.lat.toFixed(5)} <br/>
              Lng: {wp.lng.toFixed(5)} <br/>
              Alt: {wp.alt}m <br/>
              Acción: {wp.action}
            </div>
          </Popup>
        </Marker>
      ))}

      {polylinePositions.length > 1 && (
        <Polyline 
          positions={polylinePositions as [number, number][]} 
          color="#00e5cc" 
          weight={3}
          dashArray="10, 10" 
        />
      )}

      {/* Replay Trajectory - Solid Amber Line */}
      {replayTrajectory && replayTrajectory.length > 1 && (
        <Polyline 
          positions={replayTrajectory} 
          color="#f59e0b" 
          weight={4}
          opacity={0.8}
        />
      )}

      {/* Drone Active Marker during Playback */}
      {replayDronePosition && droneIcon && (
        <Marker position={replayDronePosition} icon={droneIcon} zIndexOffset={1000}>
          <Popup>Posición Actual (Telemetría)</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}

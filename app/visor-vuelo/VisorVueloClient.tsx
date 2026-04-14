"use client";

import { useEffect, useState } from "react";
import FlightViewer3D from "../components/FlightViewer3D/FlightViewer3D";
import useSWR from "swr";
import { getToken, getApiUrl } from "../lib/auth";
import { Waypoint } from "../components/MissionMap/MissionMap";

// Hook de telemetría real por WebSockets
function useDroneTelemetry(droneId: string) {
  const [telemetry, setTelemetry] = useState({
    pitch: 0,
    roll: 0,
    yaw: 0,
    altitude: 0,
    speed: 0,
    status: "unknown",
    gps: { lat: 0, lng: 0, alt: 0 },
    currentWaypointIndex: 0,
    currentMissionId: "",
    battery: { level: 0, isCharging: false },
    isOnline: false,
    lastSeen: 0,
  });

  useEffect(() => {
    // Fetch initial status
    fetch(`${getApiUrl()}/api/drones`, { headers: { "Authorization": `Bearer ${getToken()}` } })
      .then(res => res.json())
      .then(data => {
        const drone = data.drones?.find((d: any) => d.droneId === droneId);
        if (drone) {
          setTelemetry(prev => ({
            ...prev,
            status: drone.status,
            isOnline: drone.isOnline,
            currentMissionId: drone.currentMission || "",
            lastSeen: Date.now()
          }));
        }
      })
      .catch(console.error);
  }, [droneId]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = getToken();
    if (!token) return;

    // Convert http(s):// url to ws(s)://
    const baseUrl = getApiUrl();
    const wsUrl = baseUrl.replace(/^http/, "ws") + `/ws/gcs?token=${token}`;

    let ws: WebSocket;
    let isConnected = false;

    const connect = () => {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("Visor 3D: Conectado al stream de telemetría GCS");
        isConnected = true;
        setTelemetry(prev => ({ ...prev, isOnline: true }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // Solo actualizamos si el tipo es telemetry y el droneId coincide con nuestro target
          if (data.droneId === droneId) {
            if (data.type === "telemetry") {
              setTelemetry((prev) => ({
                ...prev,
                pitch: data.orientation?.pitch || 0,
                roll: data.orientation?.roll || 0,
                yaw: data.orientation?.yaw || 0,
                altitude: data.gps?.alt || 0,
                speed: data.gps?.vel || data.speed || 0,
                status: (prev.status === "mission_received" || prev.status === "unknown") ? "in_progress" : prev.status,
                gps: {
                  lat: data.gps?.lat || 0,
                  lng: data.gps?.lng || 0,
                  alt: data.gps?.alt || 0,
                },
                currentWaypointIndex: data.mission?.currentWaypointIndex || 0,
                battery: data.battery || prev.battery,
                isOnline: true,
                lastSeen: Date.now()
              }));
            } else if (data.type === "drone_status" || data.type === "drone_online" || data.type === "mission_ack" || data.type === "mission_ready") {
              setTelemetry((prev) => ({
                ...prev,
                status: (data.type === "mission_ready") ? "in_progress" : (data.status || prev.status),
                isOnline: true,
                lastSeen: Date.now(),
                currentMissionId: data.missionId || prev.currentMissionId,
              }));
            } else if (data.type === "mission_assigned") {
              setTelemetry((prev) => ({
                ...prev,
                status: "mission_received",
                currentMissionId: data.missionId,
              }));
            } else if (data.type === "drone_offline") {
              setTelemetry((prev) => ({
                ...prev,
                isOnline: false,
              }));
            }
          }
        } catch (e) {
          console.error("Error parseando telemetría WS", e);
        }
      };

      ws.onclose = () => {
        console.log("Visor 3D: Desconectado del stream. Reconectando en 3s...");
        isConnected = false;
        setTelemetry(prev => ({ ...prev, isOnline: false }));
        setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      if (ws && isConnected) {
        ws.close();
      }
    };
  }, [droneId]);

  return telemetry;
}

export default function VisorVueloClient({ droneId }: { droneId: string }) {
  const telemetry = useDroneTelemetry(droneId);

  // Fetch Mission Waypoints
  const { data: missionData } = useSWR(
    telemetry.currentMissionId ? `${getApiUrl()}/api/missions/${telemetry.currentMissionId}` : null,
    (url) => fetch(url, { headers: { "Authorization": `Bearer ${getToken()}` } }).then(r => r.json())
  );

  const waypoints: Waypoint[] = missionData?.mission?.waypoints || [];

  // El backend guarda el punto HOME como campos planos: startLat, startLng, startAlt
  const mission = missionData?.mission;
  const startPoint: Waypoint | null =
    mission?.startLat && mission?.startLng
      ? { lat: mission.startLat, lng: mission.startLng, alt: mission.startAlt ?? 0, action: "start", index: 0 }
      : null;
  const waitingAcceptance = telemetry.status === "mission_received" || telemetry.status === "unknown";

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", background: "#02040a" }}>
      <FlightViewer3D
        droneId={droneId}
        pitch={telemetry.pitch}
        roll={telemetry.roll}
        yaw={telemetry.yaw}
        altitude={telemetry.altitude}
        speed={telemetry.speed}
        gps={telemetry.gps}
        waypoints={waypoints}
        startPoint={startPoint}
        currentWaypointIndex={telemetry.currentWaypointIndex}
        waitingAcceptance={waitingAcceptance}
        battery={telemetry.battery}
        isOnline={telemetry.isOnline}
      />
    </div>
  );
}

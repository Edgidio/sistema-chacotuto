"use client";

import React from "react";
import { TopTelemetryMetrics } from "./DataDashboard/TopTelemetryMetrics";
import { FlightDataTerminal } from "./DataDashboard/FlightDataTerminal";
import { LiveTelemetryMatrix } from "./DataDashboard/LiveTelemetryMatrix";

export const TelemetryDataDashboard = ({
  droneId, roll, pitch, yaw, altitude, speed, gps, battery
}: {
  droneId: string; roll: number; pitch: number; yaw: number; altitude: number; speed: number;
  gps?: { lat: number; lng: number }; battery?: { level: number; isCharging: boolean };
}) => {
  // Generate some synthetic simulation data for the extra graphs
  const telemetryData = {
    roll, pitch, yaw,
    accX: -0.40, accY: 10.00, accZ: -0.00,
    gyrX: 0.12, gyrY: -0.05, gyrZ: 0.01,
    magX: -25.0, magY: -23.5, magZ: -29.6,
    altitude, pressure: 64746, temp: 29.0,
    voltage: battery?.level ? (battery.level / 100) * 12.6 : 5.10, 
    current: 0.25, power: 0.61,
    ch1: 1500, ch2: 1500, ch3: 1000, ch4: 1500,
    lat: gps?.lat || 0, lng: gps?.lng || 0, satellites: 9
  };

  return (
    <div style={{ flex: 1, padding: "16px", display: "flex", flexDirection: "column", gap: "16px", background: "url('/noise.png'), radial-gradient(circle at center, #060a14 0%, #02040a 100%)", overflow: "hidden" }}>
       
       {/* TOP STRIP */}
       <TopTelemetryMetrics 
         roll={roll} pitch={pitch} yaw={yaw} 
         voltage={telemetryData.voltage} 
         satellites={telemetryData.satellites}
         temp={telemetryData.temp}
       />

       {/* MAIN MATRIX GRID */}
       <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", minHeight: 0 }}>
          {/* LEFT: PROGRESS BARS */}
          <FlightDataTerminal data={telemetryData} />

          {/* RIGHT: DATA TABLE */}
          <LiveTelemetryMatrix data={telemetryData as any} />
       </div>
    </div>
  );
};

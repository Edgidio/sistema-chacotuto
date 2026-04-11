"use client";

import { useSearchParams } from "next/navigation";
import VisorVueloClient from "./VisorVueloClient";
import { Suspense } from "react";

function VisorVueloPageContent() {
  const searchParams = useSearchParams();
  const droneId = searchParams.get("droneId") || "default";

  return <VisorVueloClient droneId={droneId} />;
}

export default function VisorVueloPage() {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#000", color: "var(--hud-cyan)" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "14px", letterSpacing: "2px" }}>INICIALIZANDO HUD TÁCTICO...</div>
      </div>
    }>
      <VisorVueloPageContent />
    </Suspense>
  );
}

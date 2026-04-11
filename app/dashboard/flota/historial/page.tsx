"use client";

import { useSearchParams } from "next/navigation";
import HistorialClient from "./HistorialClient";
import { Suspense } from "react";

function HistorialPageContent() {
  const searchParams = useSearchParams();
  const droneId = searchParams.get("droneId") || "default";

  return <HistorialClient droneId={droneId} />;
}

export default function HistorialPage() {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "var(--void)", color: "var(--ink-secondary)" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "14px" }}>RECUPERANDO REGISTROS...</div>
      </div>
    }>
      <HistorialPageContent />
    </Suspense>
  );
}

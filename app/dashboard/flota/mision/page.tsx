"use client";

import { useSearchParams } from "next/navigation";
import MisionClient from "./MisionClient";
import { Suspense } from "react";

function MisionPageContent() {
  const searchParams = useSearchParams();
  const droneId = searchParams.get("droneId") || "default";

  return <MisionClient droneId={droneId} />;
}

export default function MisionPage() {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "var(--void)", color: "var(--ink-secondary)" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "14px" }}>CARGANDO ENLACE...</div>
      </div>
    }>
      <MisionPageContent />
    </Suspense>
  );
}

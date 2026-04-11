"use client";

import dynamic from "next/dynamic";

const MissionMapDynamic = dynamic(() => import("./MissionMap"), { 
  ssr: false, 
  loading: () => (
    <div style={{ height: "100%", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--void)", color: "var(--hud-cyan)", fontFamily: "var(--font-mono), monospace", letterSpacing: "2px", fontSize: "14px" }}>
      <div className="spinner" style={{ width: "24px", height: "24px", border: "2px solid rgba(0, 229, 204, 0.2)", borderTopColor: "var(--hud-cyan)", borderRadius: "50%", animation: "spin 1s linear infinite", marginRight: "16px" }} />
      SINCRONIZANDO CON SATÉLITES...
    </div>
  )
});

export default function MapWrapper(props: any) {
  return <MissionMapDynamic {...props} />;
}

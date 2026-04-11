"use client";

import React from "react";

export const MButton = ({ label, active = false, color = "var(--hud-cyan)", onClick }: any) => (
  <button 
    onClick={onClick}
    style={{
      background: active ? `${color}22` : "var(--surface-flat)",
      border: `1px solid ${active ? color : "var(--wire)"}`,
      color: active ? color : "var(--ink-secondary)",
      padding: "6px 14px", fontSize: "11px", fontFamily: "var(--font-mono)",
      borderRadius: "100px", cursor: "pointer", transition: "all 0.2s",
      boxShadow: active ? `0 0 8px ${color}44` : "none"
    }}
  >
    {label}
  </button>
);

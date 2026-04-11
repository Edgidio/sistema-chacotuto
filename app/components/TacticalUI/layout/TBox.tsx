"use client";

import React from "react";

export const TBox = ({ children, title, color = "var(--hud-cyan)", gridArea = "", style = {} }: any) => (
  <div style={{
    border: `1px solid ${color}`,
    borderRadius: "6px",
    background: "rgba(2, 4, 10, 0.6)",
    display: "flex", flexDirection: "column",
    overflow: "hidden", position: "relative",
    boxShadow: `inset 0 0 10px rgba(0, 0, 0, 0.5)`,
    gridArea,
    ...style
  }}>
    {title && (
      <div style={{
        background: `linear-gradient(90deg, ${color}22, transparent)`,
        padding: "4px 8px", fontSize: "10px", fontWeight: 600, color: color,
        borderBottom: `1px solid ${color}44`, letterSpacing: "1px"
      }}>
        {title}
      </div>
    )}
    <div style={{ flex: 1, padding: "8px", position: "relative" }}>
      {children}
    </div>
  </div>
);

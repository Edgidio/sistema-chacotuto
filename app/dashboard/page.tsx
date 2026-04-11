import TopBar from "../components/TopBar/TopBar";

export default function DashboardOverviewPage() {
  return (
    <>
      <TopBar 
        title="Dashboard General" 
        subtitle="Vista general de operaciones del sistema"
      />
      <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "var(--space-8)",
          textAlign: "center",
          color: "var(--ink-tertiary)"
      }}>
        <div style={{
          width: 80, height: 80, 
          display: "flex", alignItems: "center", justifyContent: "center",
          border: "1px solid var(--wire)", borderRadius: "var(--radius-lg)",
          background: "var(--panel)", marginBottom: "var(--space-4)"
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
        </div>
        <h3 style={{ fontSize: "16px", color: "var(--ink-secondary)", marginBottom: "var(--space-2)" }}>Centro de Operaciones PEVITE</h3>
        <p style={{ maxWidth: 400, fontSize: "14px" }}>
          Selecciona "Flota" en la barra lateral para administrar drones en tiempo real, 
          o utiliza el menú para acceder a otras funciones del GCS.
        </p>
      </div>
    </>
  );
}

import TopBar from "../../components/TopBar/TopBar";
import TelemetryModule from "../../components/TelemetryModule/TelemetryModule";

export default function TelemetryPage() {
  return (
    <>
      <TopBar 
        title="Telemetría Global" 
        subtitle="Métricas de red y calidad de enlace de radio"
      />
      <TelemetryModule />
    </>
  );
}

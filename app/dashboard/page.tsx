"use client";

import dynamic from "next/dynamic";
import useSWR from "swr";
import styles from "./Dashboard.module.css";
import TopBar from "../components/TopBar/TopBar";
import { getApiUrl, getToken } from "../lib/auth";
import { useAuth } from "../context/AuthContext";

// Dynamic import recharts to avoid SSR issues (bundle-dynamic-imports)
const BarChart = dynamic(() => import("recharts").then(m => m.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then(m => m.Bar), { ssr: false });
const XAxis = dynamic(() => import("recharts").then(m => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then(m => m.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then(m => m.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then(m => m.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then(m => m.ResponsiveContainer), { ssr: false });
const PieChart = dynamic(() => import("recharts").then(m => m.PieChart), { ssr: false });
const Pie = dynamic(() => import("recharts").then(m => m.Pie), { ssr: false });
const Cell = dynamic(() => import("recharts").then(m => m.Cell), { ssr: false });

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  accepted: "Aceptada",
  in_progress: "En Curso",
  completed: "Completada",
  rejected: "Rechazada",
  cancelled: "Cancelada",
};

const PILL_CLASS: Record<string, string> = {
  pending: "pillAmber",
  accepted: "pillGreen",
  in_progress: "pillGreen",
  completed: "pillCyan",
  rejected: "pillRed",
  cancelled: "pillRed",
};

const DONUT_COLORS = ["#22c55e", "#00e5cc", "#f59e0b", "#1a2230"];

export default function DashboardOverviewPage() {
  const { logout } = useAuth();

  const fetcher = (url: string) => {
    const token = getToken();
    return fetch(url, {
      headers: { "Authorization": `Bearer ${token}` }
    }).then((res) => {
      if (res.status === 401 || res.status === 403) {
        logout();
        throw new Error("Sesión expirada");
      }
      if (!res.ok) throw new Error("Error");
      return res.json();
    });
  };

  const { data, isLoading } = useSWR(
    `${getApiUrl()}/api/stats`,
    fetcher,
    { refreshInterval: 5000 }
  );

  const drones = data?.drones || { total: 0, online: 0, health: 0 };
  const missions = data?.missions || { total: 0, active: 0, completed: 0, failed: 0 };
  const telemetry = data?.telemetry || { dataPoints: 0 };
  const recent: any[] = data?.recentActivity || [];

  // Bar chart data
  const barData = [
    { name: "Activas", value: missions.active, fill: "#22c55e" },
    { name: "Compl.", value: missions.completed, fill: "#00e5cc" },
    { name: "Fallidas", value: missions.failed, fill: "#ef4444" },
    { name: "Pendientes", value: missions.total - missions.active - missions.completed - missions.failed, fill: "#f59e0b" },
  ];

  // Donut data
  const donutData = [
    { name: "Activas", value: missions.active || 0 },
    { name: "Completadas", value: missions.completed || 0 },
    { name: "Fallidas", value: missions.failed || 0 },
    { name: "Otras", value: Math.max(0, missions.total - missions.active - missions.completed - missions.failed) },
  ].filter(d => d.value > 0);

  // Progress bars
  const healthPct = drones.health || 0;
  const completionRate = missions.total > 0 ? (missions.completed / missions.total) * 100 : 0;
  const failRate = missions.total > 0 ? (missions.failed / missions.total) * 100 : 0;
  const coveragePct = drones.total > 0 ? (drones.online / drones.total) * 100 : 0;
  const offlineDrones = drones.total - drones.online;

  return (
    <div className={styles.page}>
      <TopBar 
        title="Centro de Operaciones Tácticas" 
        unit="CENTRAL-DSH" 
      />
      <div className={styles.body}>
        {/* =========== LEFT COLUMN =========== */}
        <div className={styles.leftCol}>

          {/* Hero Metrics */}
          <div className={styles.heroRow}>
            <div className={styles.heroMetric}>
              <span className={styles.heroLabel}>
                <span className={styles.heroDot} style={{ background: "#22c55e" }} />
                En Línea
              </span>
              <span className={styles.heroValue}>
                {isLoading ? "—" : drones.online.toLocaleString()}
              </span>
            </div>
            <div className={styles.heroMetric}>
              <span className={styles.heroLabel}>
                <span className={styles.heroDot} style={{ background: "#f59e0b" }} />
                Misiones Activas
              </span>
              <span className={styles.heroValue}>
                {isLoading ? "—" : missions.active.toLocaleString()}
              </span>
            </div>
            <div className={styles.heroMetric}>
              <span className={styles.heroLabel}>
                <span className={styles.heroDot} style={{ background: "#00e5cc" }} />
                Completadas
              </span>
              <span className={styles.heroValue}>
                {isLoading ? "—" : missions.completed.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Charts Row */}
          <div className={styles.chartsRow}>
            {/* Bar Chart */}
            <div className={styles.chartBlock}>
              <h3 className={styles.sectionTitle}>Misiones por Estado</h3>
              <div style={{ width: "100%", height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} barSize={36} barGap={8}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(138,160,195,0.08)" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "#5a6577", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{
                        background: "#131922",
                        border: "1px solid rgba(138,160,195,0.15)",
                        borderRadius: 4,
                        fontSize: 12,
                        color: "#e8edf4",
                      }}
                      cursor={{ fill: "rgba(138,160,195,0.05)" }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {barData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Donut Chart */}
            <div className={styles.chartBlock}>
              <h3 className={styles.sectionTitle}>Distribución de Misiones</h3>
              <div className={styles.donutLayout}>
                <div style={{ width: 140, height: 140 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donutData.length > 0 ? donutData : [{ name: "Vacío", value: 1 }]}
                        innerRadius={40}
                        outerRadius={65}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                      >
                        {(donutData.length > 0 ? donutData : [{ name: "Vacío", value: 1 }]).map((_, i) => (
                          <Cell key={i} fill={donutData.length > 0 ? DONUT_COLORS[i % DONUT_COLORS.length] : "#1a2230"} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "#131922",
                          border: "1px solid rgba(138,160,195,0.15)",
                          borderRadius: 4,
                          fontSize: 12,
                          color: "#e8edf4",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className={styles.donutLegend}>
                  <div className={styles.legendItem}>
                    <span className={styles.legendDot} style={{ background: "#22c55e" }} />
                    Activas
                  </div>
                  <div className={styles.legendItem}>
                    <span className={styles.legendDot} style={{ background: "#00e5cc" }} />
                    Completadas
                  </div>
                  <div className={styles.legendItem}>
                    <span className={styles.legendDot} style={{ background: "#f59e0b" }} />
                    Fallidas
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Missions Table */}
          <div>
            <h3 className={styles.sectionTitle}>Misiones Recientes</h3>
            <div className={styles.tableWrap}>
              <div className={`${styles.tableRow} ${styles.tableHeader}`}>
                <div className={styles.cell}>DRONE ID</div>
                <div className={styles.cell}>NOMBRE</div>
                <div className={styles.cell}>FECHA</div>
                <div className={styles.cell}>ESTATUS</div>
              </div>

              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className={styles.tableRow}>
                    <div className={styles.skeleton} style={{ width: 80, height: 18 }} />
                    <div className={styles.skeleton} style={{ width: 100, height: 18 }} />
                    <div className={styles.skeleton} style={{ width: 110, height: 18 }} />
                    <div className={styles.skeleton} style={{ width: 80, height: 26, borderRadius: 100 }} />
                  </div>
                ))
              ) : recent.length === 0 ? (
                <div className={styles.emptyState}>SIN MISIONES REGISTRADAS</div>
              ) : (
                recent.map((m: any, i: number) => (
                  <div key={m.missionId || `activity-${i}`} className={styles.tableRow}>
                    <div className={styles.cell}>
                      <span className={styles.droneTag}>{m.droneId}</span>
                    </div>
                    <div className={styles.cell}>Misión #{m.missionId ? m.missionId.substring(0, 8) : i}</div>
                    <div className={styles.cell}>
                      {m.createdAt ? new Date(m.createdAt).toLocaleDateString("es-ES", {
                        day: "2-digit", month: "short", year: "numeric"
                      }) : "---"}
                    </div>
                    <div className={styles.cell}>
                      <span className={`${styles.statusPill} ${styles[PILL_CLASS[m.status] || "pillAmber"]}`}>
                        {STATUS_LABELS[m.status] || m.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* =========== RIGHT COLUMN =========== */}
        <div className={styles.rightCol}>

          {/* Progress Bars */}
          <div>
            <h3 className={styles.sectionTitle}>Rendimiento del Sistema</h3>
            <div className={styles.progressList}>
              <div className={styles.progressItem}>
                <div className={styles.progressHeader}>
                  <span className={styles.progressLabel}>Operatividad</span>
                  <span className={styles.progressPct}>{healthPct.toFixed(0)}%</span>
                </div>
                <div className={styles.progressTrack}>
                  <div className={styles.progressFill} style={{ width: `${healthPct}%`, background: "#22c55e" }} />
                </div>
              </div>
              <div className={styles.progressItem}>
                <div className={styles.progressHeader}>
                  <span className={styles.progressLabel}>Tasa de Éxito</span>
                  <span className={styles.progressPct}>{completionRate.toFixed(0)}%</span>
                </div>
                <div className={styles.progressTrack}>
                  <div className={styles.progressFill} style={{ width: `${completionRate}%`, background: "#00e5cc" }} />
                </div>
              </div>
              <div className={styles.progressItem}>
                <div className={styles.progressHeader}>
                  <span className={styles.progressLabel}>Cobertura</span>
                  <span className={styles.progressPct}>{coveragePct.toFixed(0)}%</span>
                </div>
                <div className={styles.progressTrack}>
                  <div className={styles.progressFill} style={{ width: `${coveragePct}%`, background: "#f59e0b" }} />
                </div>
              </div>
              <div className={styles.progressItem}>
                <div className={styles.progressHeader}>
                  <span className={styles.progressLabel}>Tasa de Fallo</span>
                  <span className={styles.progressPct}>{failRate.toFixed(0)}%</span>
                </div>
                <div className={styles.progressTrack}>
                  <div className={styles.progressFill} style={{ width: `${failRate}%`, background: "#ef4444" }} />
                </div>
              </div>
              <div className={styles.progressItem}>
                <div className={styles.progressHeader}>
                  <span className={styles.progressLabel}>Telemetría</span>
                  <span className={styles.progressPct}>{telemetry.dataPoints.toLocaleString()}</span>
                </div>
                <div className={styles.progressTrack}>
                  <div className={styles.progressFill} style={{ width: `${Math.min(100, telemetry.dataPoints / 100)}%`, background: "#8b5cf6" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Metric Grid 2x2 */}
          <div>
            <h3 className={styles.sectionTitle}>Métricas de Operación</h3>
            <div className={styles.metricGrid}>
              <div className={styles.metricBlock} style={{ borderLeftColor: "#22c55e" }}>
                <div className={styles.metricVal}>
                  {drones.online}<span className={styles.metricUnit}> uds</span>
                </div>
                <div className={styles.metricLabel}>En línea</div>
              </div>
              <div className={styles.metricBlock} style={{ borderLeftColor: "#00e5cc" }}>
                <div className={styles.metricVal}>
                  {missions.total}<span className={styles.metricUnit}> ops</span>
                </div>
                <div className={styles.metricLabel}>Total Misiones</div>
              </div>
              <div className={styles.metricBlock} style={{ borderLeftColor: "#f59e0b" }}>
                <div className={styles.metricVal}>
                  {drones.total}<span className={styles.metricUnit}> uds</span>
                </div>
                <div className={styles.metricLabel}>Flota Registrada</div>
              </div>
              <div className={styles.metricBlock} style={{ borderLeftColor: "#3b82f6" }}>
                <div className={styles.metricVal}>
                  {offlineDrones}<span className={styles.metricUnit}> uds</span>
                </div>
                <div className={styles.metricLabel}>Desconectados</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

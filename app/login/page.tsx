"use client";

import { useState, FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import styles from "./login.module.css";

export default function LoginPage() {
  const { login, isLoading: authLoading } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  // Don't render anything while auth is still hydrating (prevents flash)
  if (authLoading) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--hud-cyan)", background: "var(--void)" }}>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", fontFamily: "var(--font-mono), monospace", fontSize: "12px", letterSpacing: "1px" }}>
          <div className="spinner" style={{ width: "16px", height: "16px", border: "2px solid rgba(0, 229, 204, 0.2)", borderTopColor: "var(--hud-cyan)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
          <span>VERIFICANDO CREDENCIALES LOCALES...</span>
        </div>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Complete todos los campos para continuar.");
      return;
    }

    setIsLoading(true);

    try {
      await login(username, password);
      // login() in AuthContext handles redirect to /dashboard
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Error de conexión. Verifique que el servidor esté activo.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.loginShell}>
      {/* === LEFT: HUD Canvas === */}
      <div className={styles.hudCanvas}>
        {/* Grid overlay */}
        <div className={styles.gridOverlay} />

        {/* Scan line animation */}
        <div className={styles.scanLine} />

        {/* Central branding cluster */}
        <div className={styles.brandCluster}>
          {/* Radar ring */}
          <div className={styles.radarRing}>
            <div className={styles.radarSweep} />
            <div className={styles.radarDot} />
            <div className={styles.radarDot} data-pos="2" />
            <div className={styles.radarDot} data-pos="3" />
          </div>

          {/* Status readout */}
          <div className={styles.statusBlock}>
            <span className={styles.statusLabel}>ESTACIÓN DE CONTROL TERRESTRE</span>
            <h1 className={styles.brandName}>
              <span className={styles.brandAccent}>PE</span>VITE
            </h1>
            <p className={styles.brandSub}>
              Sistema de Administración de Drones
            </p>
          </div>

          {/* Telemetry badges */}
          <div className={styles.telemetryRow}>
            <div className={styles.telBadge}>
              <span className={styles.telDot} data-status="online" />
              <span className={styles.telLabel}>ENLACE</span>
              <span className={styles.telValue}>ACTIVO</span>
            </div>

            <div className={styles.telBadge}>
              <span className={styles.telDot} data-status="warning" />
              <span className={styles.telLabel}>AUTENT.</span>
              <span className={styles.telValue}>PENDIENTE</span>
            </div>
          </div>
        </div>

        {/* Corner decorations */}
        <div className={styles.cornerMark} data-corner="tl" />
        <div className={styles.cornerMark} data-corner="tr" />
        <div className={styles.cornerMark} data-corner="bl" />
        <div className={styles.cornerMark} data-corner="br" />

        {/* Coordinate readout - bottom */}
        <div className={styles.coordReadout}>
          <span>LAT 18.4861° N</span>
          <span className={styles.coordSep}>|</span>
          <span>LON 69.9312° W</span>
          <span className={styles.coordSep}>|</span>
          <span>ALT 142m</span>
        </div>
      </div>

      {/* === RIGHT: Auth Form === */}
      <div className={styles.authPanel}>
        <div className={styles.authInner}>
          {/* Mobile brand (shown only on small screens) */}
          <div className={styles.mobileBrand}>
            <span className={styles.mobileBrandLabel}>GCS</span>
            <h1 className={styles.mobileBrandName}>
              <span className={styles.brandAccent}>PE</span>VITE
            </h1>
          </div>

          <div className={styles.authHeader}>
            <h2 className={styles.authTitle}>Iniciar Sesión</h2>
            <p className={styles.authSubtitle}>
              Acceso al centro de control de operaciones
            </p>
          </div>

          <form onSubmit={handleSubmit} className={styles.authForm}>
            {/* Username field */}
            <div className={styles.fieldGroup}>
              <label htmlFor="login-username" className={styles.fieldLabel}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                Usuario
              </label>
              <input
                id="login-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className={styles.fieldInput}
                autoComplete="username"
                disabled={isLoading}
              />
            </div>

            {/* Password field */}
            <div className={styles.fieldGroup}>
              <label htmlFor="login-password" className={styles.fieldLabel}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                Contraseña
              </label>
              <div className={styles.passwordWrap}>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className={styles.fieldInput}
                  autoComplete="current-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className={styles.errorMsg}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                {error}
              </div>
            )}


            {/* Submit */}
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isLoading}
              id="login-submit"
            >
              {isLoading ? (
                <span className={styles.submitLoading}>
                  <span className={styles.spinner} />
                  Autenticando...
                </span>
              ) : (
                <>
                  Acceder al Sistema
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className={styles.authFooter}>
            <span className={styles.footerCopy}>Todos los derechos reservados PEVITE © 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
}

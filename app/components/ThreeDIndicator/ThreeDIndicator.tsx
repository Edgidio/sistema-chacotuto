"use client";

import { ErrorBoundary } from "react-error-boundary";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Center, Bounds, Grid, ContactShadows } from "@react-three/drei";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { useRef, Suspense } from "react";
import * as THREE from "three";

interface DroneModelProps {
  pitch: number;
  roll: number;
  yaw: number;
}

function DroneModel({ pitch, roll, yaw }: DroneModelProps) {
  const obj = useLoader(OBJLoader, "/chaco.obj");
  const droneRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (droneRef.current) {
      const targetPitch = THREE.MathUtils.degToRad(pitch);
      const targetRoll = THREE.MathUtils.degToRad(roll);
      const targetYaw = THREE.MathUtils.degToRad(yaw);
      // Quaternion Slerp para evitar Gimbal Lock y los "saltos raros" de 360 a 0.
      // -targetYaw asegura que girar al Este (brujula positiva) rote visualmente a la derecha (negativo en Y de ThreeJS).
      const targetEuler = new THREE.Euler(targetRoll, -targetYaw, targetPitch, "YXZ");
      const targetQuat = new THREE.Quaternion().setFromEuler(targetEuler);
      
      droneRef.current.quaternion.slerp(targetQuat, 4 * delta);
    }
  });

  return (
    <group ref={droneRef}>
      {/* Ajuste base para que el modelo mire "plano" hacia adelante */}
      <group rotation={[-Math.PI / 2, 0, 0]}>
        <Center>
          <primitive object={obj} />
        </Center>
      </group>
    </group>
  );
}

function FallbackError() {
  return (
    <div style={{ height: "100%", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#0a0a0a", color: "#ff4444", fontSize: "10px", fontFamily: "var(--font-mono)", textAlign: "center", padding: "16px" }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: "8px" }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      MODELO NO ENCONTRADO:<br/>/public/chaco.obj<br/>VERIFICA EL NOMBRE
    </div>
  );
}

export default function ThreeDIndicator({ pitch = 0, roll = 0, yaw = 0 }: Partial<DroneModelProps>) {
  return (
    <div style={{
      width: "320px",
      height: "260px",
      background: "#030712",
      border: "1px solid #1f2937",
      borderRadius: "4px",
      overflow: "hidden",
      position: "relative",
      boxShadow: "0 10px 40px rgba(0,0,0,0.8)",
    }}>
      {/* HUD HEADER - Estilo "Vehicle Attitude" Técnico */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 10, pointerEvents: "none", background: "rgba(3, 7, 18, 0.9)", borderBottom: "1px solid #1f2937" }}>
        <span style={{ fontSize: "10px", color: "#38bdf8", fontFamily: "var(--font-mono)", fontWeight: "bold", letterSpacing: "1px" }}>VISOR DE ACTITUD 3D</span>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(16, 185, 129, 0.1)", padding: "2px 6px", borderRadius: "2px", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
          <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 4px #10b981" }} />
          <span style={{ fontSize: "8px", color: "#10b981", fontFamily: "var(--font-mono)" }}>MODELO EN LÍNEA</span>
        </div>
      </div>

      {/* LETRAS CARDINALES FLOTANTES EN HTML (Encima del Canvas, indestructibles y sin fallos de fuente) */}
      <div style={{ position: "absolute", top: "35px", left: "50%", transform: "translateX(-50%)", color: "#f97316", fontFamily: "var(--font-mono)", fontSize: "20px", fontWeight: "bold", zIndex: 10, pointerEvents: "none", textShadow: "0px 0px 8px rgba(0,0,0,0.8)" }}>N</div>
      <div style={{ position: "absolute", bottom: "75px", left: "50%", transform: "translateX(-50%)", color: "#f97316", fontFamily: "var(--font-mono)", fontSize: "20px", fontWeight: "bold", zIndex: 10, pointerEvents: "none", textShadow: "0px 0px 8px rgba(0,0,0,0.8)" }}>S</div>
      <div style={{ position: "absolute", top: "50%", right: "15px", transform: "translateY(-50%)", color: "#f97316", fontFamily: "var(--font-mono)", fontSize: "20px", fontWeight: "bold", zIndex: 10, pointerEvents: "none", textShadow: "0px 0px 8px rgba(0,0,0,0.8)" }}>E</div>
      <div style={{ position: "absolute", top: "50%", left: "15px", transform: "translateY(-50%)", color: "#f97316", fontFamily: "var(--font-mono)", fontSize: "20px", fontWeight: "bold", zIndex: 10, pointerEvents: "none", textShadow: "0px 0px 8px rgba(0,0,0,0.8)" }}>O</div>

      <ErrorBoundary FallbackComponent={FallbackError}>
        {/* Cámara centrada en X para que N, S, E y O queden alineados como una cruz perfecta en pantalla */}
        <Canvas camera={{ position: [0, 4, 10], fov: 40 }}>
          {/* Fondo espacial puro */}
          <color attach="background" args={['#02040a']} />
          
          {/* Iluminación estilo radar oscuro. NO usar var() aquí porque ThreeJS espera hex */}
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
          <directionalLight position={[-10, 5, -10]} intensity={2} color="#0ea5e9" />
          <pointLight position={[0, -5, 0]} intensity={1} color="#10b981" />
          
          {/* Suelo Táctico */}
          <Grid 
            position={[0, -2, 0]} 
            args={[50, 50]} 
            cellSize={1} 
            cellThickness={1.5} 
            cellColor="#475569" 
            sectionSize={5} 
            sectionThickness={2} 
            sectionColor="#64748b" 
            fadeDistance={25} 
            fadeStrength={1} 
          />
          
          {/* Ejes globales */}
          <axesHelper args={[8]} />

          <Suspense fallback={null}>
             <Bounds fit margin={1.2}>
               {/* Sombra de contacto debajo del dron */}
               <ContactShadows position={[0, -1.9, 0]} opacity={0.6} scale={10} blur={2} far={4} />
               <DroneModel pitch={pitch} roll={roll} yaw={yaw} />
             </Bounds>
          </Suspense>

          <OrbitControls 
            enableZoom={true} 
            enablePan={false} 
            maxPolarAngle={Math.PI / 2 + 0.1} 
            minPolarAngle={Math.PI / 6}
          />
        </Canvas>
      </ErrorBoundary>
      
      {/* HUD FOOTER - Controles / Data Grid */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "8px", background: "rgba(3, 7, 18, 0.9)", borderTop: "1px solid #1f2937", zIndex: 10, pointerEvents: "none" }}>
        
        {/* Retícula visual inferior */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", borderBottom: "1px dashed #334155", paddingBottom: "6px" }}>
           <span style={{ fontSize: "8px", color: "#64748b", fontFamily: "var(--font-mono)" }}>ENLACE: 100%</span>
           <span style={{ fontSize: "8px", color: "#64748b", fontFamily: "var(--font-mono)" }}>MODO: VECTOR</span>
           <span style={{ fontSize: "8px", color: "#f59e0b", fontFamily: "var(--font-mono)" }}>TIEMPO REAL</span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", padding: "0 4px" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <div style={{ width: 6, height: 2, background: "#ef4444" }}/>
              <span style={{ fontSize: "8px", color: "#94a3b8", fontFamily: "var(--font-mono)" }}>CABECEO(P)</span>
            </div>
            <span style={{ fontSize: "12px", color: "#f8fafc", fontFamily: "var(--font-mono)", fontWeight: "bold" }}>{pitch.toFixed(1)}°</span>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
               <div style={{ width: 6, height: 2, background: "#3b82f6" }}/>
               <span style={{ fontSize: "8px", color: "#94a3b8", fontFamily: "var(--font-mono)" }}>ALABEO(R)</span>
            </div>
            <span style={{ fontSize: "12px", color: "#f8fafc", fontFamily: "var(--font-mono)", fontWeight: "bold" }}>{roll.toFixed(1)}°</span>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
               <div style={{ width: 6, height: 2, background: "#10b981" }}/>
               <span style={{ fontSize: "8px", color: "#94a3b8", fontFamily: "var(--font-mono)" }}>GUIÑADA(Y)</span>
            </div>
            <span style={{ fontSize: "12px", color: "#f8fafc", fontFamily: "var(--font-mono)", fontWeight: "bold" }}>{yaw.toFixed(1)}°</span>
          </div>
        </div>
      </div>
    </div>
  );
}

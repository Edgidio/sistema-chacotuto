"use client";

import React, { useRef, Suspense } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Center, Grid, ContactShadows, OrbitControls, Bounds } from "@react-three/drei";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import * as THREE from "three";
import { ErrorBoundary } from "react-error-boundary";

function FallbackError() {
  return (
    <div style={{ height: "100%", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#0a0a0a", color: "#ff4444", fontSize: "10px", fontFamily: "var(--font-mono)", textAlign: "center", padding: "16px" }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: "8px" }}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
      MODELO NO ENCONTRADO:<br />/public/chaco.obj<br />VERIFICA EL NOMBRE
    </div>
  );
}

function DroneModel({ pitch, roll, yaw }: { pitch: number; roll: number; yaw: number }) {
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
    <group rotation={[0, Math.PI / 2, 0]}>
      <group ref={droneRef}>
        {/* Ajuste base idéntico a ThreeDIndicator para evitar ejes invertidos */}
        <group rotation={[-Math.PI / 2, 0, 0]}>
          <Center>
            {/* Se clona la escena para no mutar el cache global de Fiber en HMR */}
            <primitive object={obj.clone()} />
          </Center>
        </group>
      </group>
    </group>
  );
}

export default function DroneTacticalNav({ pitch, roll, yaw }: { pitch: number; roll: number; yaw: number }) {
  return (
    <div style={{ height: "260px", background: "#030712", borderRadius: "4px", overflow: "hidden", position: "relative", border: "1px solid var(--wire)", width: "100%", flex: 1 }}>

      {/* LETRAS CARDINALES ELIMINADAS POR SOLICITUD */}

      <ErrorBoundary FallbackComponent={FallbackError}>
        <Canvas camera={{ position: [0, 4, 10], fov: 40 }}>
          {/* Fondo espacial puro */}
          <color attach="background" args={['#02040a']} />

          {/* Iluminación radar estilo Black Box */}
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
    </div>
  );
}

import React, { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  ContactShadows,
  OrbitControls,
  PerspectiveCamera,
  Environment,
  AdaptiveDpr,
} from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import FractalGenerator from "./FractalGenerator";
import type {
  GeometryType,
  FractalRuleConfig,
  ArrangementType,
} from "../utils/FractalGeometryUtils";
import * as THREE from "three";

interface FractalViewerProps {
  depth: number;
  size: number;
  color: string;
  metalness: number;
  roughness: number;
  isWireframe: boolean;
  rotationSpeed: number;
  geometryType: GeometryType;
  arrangementType: ArrangementType;
  ruleConfig: FractalRuleConfig;
  scaleFactor: number;
  customPoints?: THREE.Vector3[];
  radialRender?: React.ReactNode;
  onCanvasReady?: (el: HTMLCanvasElement) => void;
  onBoundsComputed?: (radius: number) => void;
}

const RotatingFractal: React.FC<FractalViewerProps> = ({
  depth,
  size,
  color,
  metalness,
  roughness,
  isWireframe,
  rotationSpeed,
  geometryType,
  arrangementType,
  ruleConfig,
  scaleFactor,
  customPoints,
  radialRender,
  onBoundsComputed,
}) => {
  const ref = useRef<THREE.Group>(null);

  useFrame((_state, delta) => {
    if (ref.current) {
      ref.current.rotation.x += delta * 0.1 * rotationSpeed;
      ref.current.rotation.y += delta * 0.15 * rotationSpeed;
    }
  });

  return (
    <group ref={ref}>
      <FractalGenerator
        type={geometryType}
        arrangementType={arrangementType}
        ruleConfig={ruleConfig}
        scaleFactor={scaleFactor}
        depth={depth}
        size={size}
        color={color}
        metalness={metalness}
        roughness={roughness}
        isWireframe={isWireframe}
        customPoints={customPoints}
        onBoundsComputed={onBoundsComputed}
      />
      {/* Radial 2D fractal overlay at Z=0 */}
      {radialRender}
    </group>
  );
};

const FractalViewer: React.FC<FractalViewerProps> = (props) => {
  const [boundsRadius, setBoundsRadius] = useState<number>(12);
  const camRef = useRef<THREE.PerspectiveCamera>(null);
  const controlsRef = useRef<OrbitControlsImpl>(null);

  useEffect(() => {
    if (camRef.current && controlsRef.current) {
      const dist = Math.max(boundsRadius * 2, 12);
      camRef.current.position.set(0, 0, dist);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  }, [boundsRadius]);

  return (
    <div className="w-full h-full">
      <Canvas
        dpr={[1, 1.5]}
        gl={{
          antialias: false,
          powerPreference: "high-performance",
          preserveDrawingBuffer: true,
        }}
        onCreated={({ gl }) => {
          props.onCanvasReady?.(gl.domElement as HTMLCanvasElement);
        }}
      >
        <PerspectiveCamera
          makeDefault
          ref={camRef}
          position={[0, 0, 12]}
          near={0.01}
          far={10000}
          fov={55}
        />
        <OrbitControls
          ref={controlsRef}
          enableDamping
          enableZoom
          zoomSpeed={0.8}
          minDistance={0.5}
          maxDistance={500}
        />
        <AdaptiveDpr />

        <ambientLight intensity={0.5} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.15}
          penumbra={1}
          intensity={1}
          castShadow
        />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />

        <RotatingFractal
          {...props}
          onBoundsComputed={(r) => {
            setBoundsRadius(Math.max(1, r));
            props.onBoundsComputed?.(r);
          }}
        />

        <Environment preset="city" />
        <ContactShadows
          position={[0, -2.5, 0]}
          opacity={0.4}
          scale={10}
          blur={2.5}
          far={4.5}
        />
      </Canvas>
    </div>
  );
};

export default FractalViewer;

import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  ContactShadows,
  OrbitControls,
  PerspectiveCamera,
  Environment,
  AdaptiveDpr,
} from "@react-three/drei";
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
      />
      {/* Radial 2D fractal overlay at Z=0 */}
      {radialRender}
    </group>
  );
};

const FractalViewer: React.FC<FractalViewerProps> = (props) => {
  return (
    <div className="w-full h-full">
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: false, powerPreference: "high-performance" }}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 5]} />
        <OrbitControls enableDamping />
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

        <RotatingFractal {...props} />

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

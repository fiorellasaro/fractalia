import React, { useMemo } from "react";
import { Line } from "@react-three/drei";
import * as THREE from "three";

export type SpiroType = "rose" | "hypotrochoid" | "epitrochoid";

interface SpiroFractalProps {
  show: boolean;
  type: SpiroType;
  color: string;
  lineWidth: number;
  segments: number;
  a: number; // amplitude for rose curve
  k: number; // petals factor for rose
  R: number; // big radius for spirograph
  r: number; // small radius for spirograph
  d: number; // pen offset
  repeats: number; // clone count
  repeatRotation: number; // rotation per clone in degrees
  repeatScale: number; // scale per clone multiplier
}

const SpiroFractal: React.FC<SpiroFractalProps> = ({
  show,
  type,
  color,
  lineWidth,
  segments,
  a,
  k,
  R,
  r,
  d,
  repeats,
  repeatRotation,
  repeatScale,
}) => {
  const basePoints = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const steps = Math.max(64, Math.min(4096, segments));
    const TWO_PI = Math.PI * 2;
    const safeA = Math.max(0.1, Math.min(10, a));
    const safeK = Math.max(0.5, Math.min(32, k));
    const safeR = Math.max(0.1, Math.min(10, R));
    const safeSmall = Math.max(0.1, Math.min(safeR - 0.1, r));
    const safeD = Math.max(0.1, Math.min(safeSmall, d));
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * TWO_PI * 10; // enough turns for dense patterns
      let x = 0;
      let y = 0;
      if (type === "rose") {
        const rad = safeA * Math.cos(safeK * t);
        x = rad * Math.cos(t);
        y = rad * Math.sin(t);
      } else if (type === "hypotrochoid") {
        const diff = safeR - safeSmall;
        x = diff * Math.cos(t) + safeD * Math.cos((diff / safeSmall) * t);
        y = diff * Math.sin(t) - safeD * Math.sin((diff / safeSmall) * t);
      } else {
        const sum = safeR + safeSmall;
        x = sum * Math.cos(t) - safeD * Math.cos((sum / safeSmall) * t);
        y = sum * Math.sin(t) - safeD * Math.sin((sum / safeSmall) * t);
      }
      pts.push(new THREE.Vector3(x, y, 0).multiplyScalar(0.5)); // normalize to fit
    }
    return pts;
  }, [type, segments, a, k, R, r, d]);

  if (!show) return null;

  const clones = [];
  const count = Math.max(1, Math.min(64, repeats));
  const rotStep = Math.max(0, Math.min(360, repeatRotation));
  const sclStep = Math.max(0.5, Math.min(2, repeatScale));
  for (let i = 0; i < count; i++) {
    const rot = (rotStep * i * Math.PI) / 180;
    const scl = Math.pow(sclStep, i);
    clones.push(
      <group rotation={[0, 0, rot]} scale={[scl, scl, scl]} key={i}>
        <Line points={basePoints} color={color} lineWidth={lineWidth} />
      </group>,
    );
  }

  return <group>{clones}</group>;
};

export default SpiroFractal;

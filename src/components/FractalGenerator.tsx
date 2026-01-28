import React, { useMemo, useEffect, useRef } from "react";
import type {
  GeometryType,
  FractalRuleConfig,
  ArrangementType,
} from "../utils/FractalGeometryUtils";
import { getFractalPositions } from "../utils/FractalGeometryUtils";
import * as THREE from "three";

interface FractalGeneratorProps {
  type: GeometryType;
  arrangementType?: ArrangementType;
  ruleConfig: FractalRuleConfig;
  scaleFactor: number; // r
  size: number;
  depth: number;
  color: string;
  metalness: number;
  roughness: number;
  isWireframe: boolean;
  customPoints?: THREE.Vector3[];
}

const FractalGenerator: React.FC<FractalGeneratorProps> = React.memo(
  ({
    type,
    arrangementType,
    ruleConfig,
    scaleFactor,
    size,
    depth,
    color,
    metalness,
    roughness,
    isWireframe,
    customPoints,
  }) => {
    const instanceRef = useRef<THREE.InstancedMesh>(null);

    const safeScale = Math.min(0.5, Math.max(0.1, scaleFactor));
    const safeSize = Math.max(0.1, size);
    const safeDepth = Math.max(0, Math.min(5, depth));

    const customGeometry = useMemo(() => {
      if (type === "freehand" && customPoints && customPoints.length > 1) {
        // Points are in range [-1, 1] (size 2). Scale to [-0.5, 0.5] (size 1) to match standard geometries
        const scaledPoints = customPoints.map((p) =>
          p.clone().multiplyScalar(0.5),
        );
        const curve = new THREE.CatmullRomCurve3(scaledPoints, false);
        return new THREE.TubeGeometry(curve, 64, 0.05, 8, false);
      }
      return null;
    }, [type, customPoints]);

    const transforms = useMemo(() => {
      const nodes: { pos: THREE.Vector3; size: number; level: number }[] = [
        { pos: new THREE.Vector3(0, 0, 0), size: safeSize, level: safeDepth },
      ];
      const leaves: { pos: THREE.Vector3; size: number }[] = [];

      const maxInstances = 20000;
      // Pass arrangementType to getFractalPositions
      const basePositions = getFractalPositions(
        type,
        ruleConfig,
        1,
        arrangementType,
      );
      const N = basePositions.length || 1;
      let effectiveDepth = safeDepth;
      let countEstimate = 1;
      for (let i = 0; i < safeDepth; i++) countEstimate *= N;
      while (countEstimate > maxInstances && effectiveDepth > 0) {
        countEstimate /= N;
        effectiveDepth -= 1;
      }

      while (nodes.length > 0) {
        const node = nodes.pop()!;
        if (node.level <= 0) {
          leaves.push({ pos: node.pos, size: node.size });
          continue;
        }
        if (node.level > effectiveDepth) {
          nodes.push({ pos: node.pos, size: node.size, level: effectiveDepth });
          continue;
        }
        // Pass arrangementType here as well
        const children = getFractalPositions(
          type,
          ruleConfig,
          safeScale,
          arrangementType,
        );
        const offsetScale = node.size / 2;
        const childSize = node.size * safeScale;
        for (let i = 0; i < children.length; i++) {
          const cp = children[i];
          nodes.push({
            pos: new THREE.Vector3(
              node.pos.x + cp.x * offsetScale,
              node.pos.y + cp.y * offsetScale,
              node.pos.z + cp.z * offsetScale,
            ),
            size: childSize,
            level: node.level - 1,
          });
        }
      }

      if (leaves.length === 0) {
        leaves.push({ pos: new THREE.Vector3(0, 0, 0), size: safeSize });
      }
      return leaves;
    }, [type, ruleConfig, safeScale, safeSize, safeDepth, arrangementType]);

    useEffect(() => {
      if (!instanceRef.current) return;
      const mesh = instanceRef.current;
      const m = new THREE.Matrix4();
      const t = new THREE.Matrix4();
      const s = new THREE.Matrix4();

      for (let i = 0; i < transforms.length; i++) {
        const tr = transforms[i];
        t.makeTranslation(tr.pos.x, tr.pos.y, tr.pos.z);
        s.makeScale(tr.size, tr.size, tr.size);
        m.multiplyMatrices(t, s);
        mesh.setMatrixAt(i, m);
      }
      mesh.instanceMatrix.needsUpdate = true;
    }, [transforms]);

    const count = transforms.length;

    let geometry;
    switch (type) {
      case "cube":
        geometry = <boxGeometry args={[1, 1, 1]} />;
        break;
      case "tetrahedron":
        geometry = <tetrahedronGeometry args={[1, 0]} />;
        break;
      case "octahedron":
        geometry = <octahedronGeometry args={[1, 0]} />;
        break;
      case "icosahedron":
        geometry = <icosahedronGeometry args={[1, 0]} />;
        break;
      case "dodecahedron":
        geometry = <dodecahedronGeometry args={[1, 0]} />;
        break;
      case "freehand":
        geometry = customGeometry ? (
          <primitive object={customGeometry} attach="geometry" />
        ) : (
          <boxGeometry args={[1, 1, 1]} />
        );
        break;
      default:
        geometry = <boxGeometry args={[1, 1, 1]} />;
    }

    return (
      <instancedMesh ref={instanceRef} args={[undefined, undefined, count]}>
        {geometry}
        <meshStandardMaterial
          color={color}
          roughness={roughness}
          metalness={metalness}
          wireframe={isWireframe}
        />
      </instancedMesh>
    );
  },
);

export default FractalGenerator;

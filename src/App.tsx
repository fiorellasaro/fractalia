import { useState } from "react";
import * as THREE from "three";
import FractalViewer from "./components/FractalViewer";
import ControlPanel from "./components/ControlPanel";
import FractalInfoModal from "./components/FractalInfoModal";
import DrawingPad from "./components/DrawingPad";
import MaterialPanel from "./components/MaterialPanel";
import SpiroFractal from "./components/SpiroFractal";
import type {
  GeometryType,
  FractalRuleConfig,
  ArrangementType,
} from "./utils/FractalGeometryUtils";

function App() {
  const [depth, setDepth] = useState(1);
  const [size, setSize] = useState(2);
  const [color, setColor] = useState("#3b82f6");
  const [metalness, setMetalness] = useState(0.5);
  const [roughness, setRoughness] = useState(0.3);
  const [rotationSpeed, setRotationSpeed] = useState(1.0);
  const [isWireframe, setIsWireframe] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isDrawingOpen, setIsDrawingOpen] = useState(false);

  // New State for Geometry and Rules
  const [geometryType, setGeometryType] = useState<GeometryType>("cube");
  const [arrangementType, setArrangementType] =
    useState<ArrangementType>("cube");
  const [customPoints, setCustomPoints] = useState<THREE.Vector3[]>([]);
  const [scaleFactor, setScaleFactor] = useState(0.33);
  const [ruleConfig, setRuleConfig] = useState<FractalRuleConfig>({
    keepVertices: true,
    keepEdges: true,
    keepFaces: false,
    keepCenter: false,
  });

  // Radial fractal state
  const [showRadial, setShowRadial] = useState(false);
  const [radialType, setRadialType] = useState<
    "rose" | "hypotrochoid" | "epitrochoid"
  >("rose");
  const [radialSegments, setRadialSegments] = useState(512);
  const [radialA, setRadialA] = useState(1.0);
  const [radialK, setRadialK] = useState(6);
  const [radialR, setRadialR] = useState(1.0);
  const [radialr, setRadialr] = useState(0.25);
  const [radialD, setRadialD] = useState(0.5);
  const [radialRepeats, setRadialRepeats] = useState(1);
  const [radialRepeatRotation, setRadialRepeatRotation] = useState(15);
  const [radialRepeatScale, setRadialRepeatScale] = useState(1.0);

  const clamp = (v: number, min: number, max: number) =>
    Math.min(max, Math.max(min, v));
  const setScaleFactorSafe = (v: number) => setScaleFactor(clamp(v, 0.1, 0.5));
  const setRadialSegmentsSafe = (v: number) =>
    setRadialSegments(clamp(Math.round(v), 64, 4096));
  const setRadialASafe = (v: number) => setRadialA(clamp(v, 0.1, 10));
  const setRadialKSafe = (v: number) => setRadialK(clamp(Math.round(v), 1, 24));
  const setRadialRSafe = (v: number) => setRadialR(clamp(v, 0.1, 10));
  const setRadialrSafe = (v: number) =>
    setRadialr(clamp(v, 0.1, Math.max(0.2, Math.min(10, radialR - 0.1))));
  const setRadialDSafe = (v: number) =>
    setRadialD(clamp(v, 0.1, Math.max(0.2, radialr)));
  const setRadialRepeatsSafe = (v: number) =>
    setRadialRepeats(clamp(Math.round(v), 1, 64));
  const setRadialRepeatRotationSafe = (v: number) =>
    setRadialRepeatRotation(clamp(v, 0, 360));
  const setRadialRepeatScaleSafe = (v: number) =>
    setRadialRepeatScale(clamp(v, 0.5, 2));

  const handleDrawingConfirm = (points: THREE.Vector3[]) => {
    setCustomPoints(points);
    setGeometryType("freehand");
    // Default to cubic arrangement or keep previous?
    // Let's keep previous arrangement or default to cube
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <FractalViewer
        depth={depth}
        size={size}
        color={color}
        metalness={metalness}
        roughness={roughness}
        rotationSpeed={rotationSpeed}
        isWireframe={isWireframe}
        geometryType={geometryType}
        arrangementType={arrangementType}
        scaleFactor={scaleFactor}
        ruleConfig={ruleConfig}
        customPoints={customPoints}
        radialRender={
          <SpiroFractal
            show={showRadial}
            type={radialType}
            color={color}
            lineWidth={1.5}
            segments={radialSegments}
            a={radialA}
            k={radialK}
            R={radialR}
            r={radialr}
            d={radialD}
            repeats={radialRepeats}
            repeatRotation={radialRepeatRotation}
            repeatScale={radialRepeatScale}
          />
        }
      />
      <ControlPanel
        depth={depth}
        setDepth={setDepth}
        geometryType={geometryType}
        setGeometryType={setGeometryType}
        arrangementType={arrangementType}
        setArrangementType={setArrangementType}
        ruleConfig={ruleConfig}
        setRuleConfig={setRuleConfig}
        scaleFactor={scaleFactor}
        setScaleFactor={setScaleFactorSafe}
        onOpenInfo={() => setIsInfoOpen(true)}
        onOpenDrawing={() => setIsDrawingOpen(true)}
        showRadial={showRadial}
        setShowRadial={setShowRadial}
        radialType={radialType}
        setRadialType={setRadialType}
        radialSegments={radialSegments}
        setRadialSegments={setRadialSegmentsSafe}
        radialA={radialA}
        setRadialA={setRadialASafe}
        radialK={radialK}
        setRadialK={setRadialKSafe}
        radialR={radialR}
        setRadialR={setRadialRSafe}
        radialr={radialr}
        setRadialr={setRadialrSafe}
        radialD={radialD}
        setRadialD={setRadialDSafe}
        radialRepeats={radialRepeats}
        setRadialRepeats={setRadialRepeatsSafe}
        radialRepeatRotation={radialRepeatRotation}
        setRadialRepeatRotation={setRadialRepeatRotationSafe}
        radialRepeatScale={radialRepeatScale}
        setRadialRepeatScale={setRadialRepeatScaleSafe}
      />
      <MaterialPanel
        size={size}
        setSize={setSize}
        rotationSpeed={rotationSpeed}
        setRotationSpeed={setRotationSpeed}
        metalness={metalness}
        setMetalness={setMetalness}
        roughness={roughness}
        setRoughness={setRoughness}
        isWireframe={isWireframe}
        setIsWireframe={setIsWireframe}
        color={color}
        setColor={setColor}
      />
      <FractalInfoModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        geometryType={geometryType}
        arrangementType={arrangementType}
        scaleFactor={scaleFactor}
        ruleConfig={ruleConfig}
      />
      <DrawingPad
        isOpen={isDrawingOpen}
        onClose={() => setIsDrawingOpen(false)}
        onConfirm={handleDrawingConfirm}
      />
    </div>
  );
}

export default App;

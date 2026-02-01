import { useState } from "react";
import * as THREE from "three";
import FractalViewer from "./components/FractalViewer";
import ControlPanel from "./components/ControlPanel";
import FractalInfoModal from "./components/FractalInfoModal";
import DrawingPad from "./components/DrawingPad";
import MaterialPanel from "./components/MaterialPanel";
import SpiroFractal from "./components/SpiroFractal";
import ShareStoryModal from "./components/ShareStoryModal";
import { Settings, Sliders } from "lucide-react";
import type {
  GeometryType,
  FractalRuleConfig,
  ArrangementType,
} from "./utils/FractalGeometryUtils";

function App() {
  const [depth, setDepth] = useState(1);
  const [size, setSize] = useState(1);
  const [color, setColor] = useState("#22c55e");
  const [metalness, setMetalness] = useState(0.5);
  const [roughness, setRoughness] = useState(0.3);
  const [rotationSpeed, setRotationSpeed] = useState(1.0);
  const [isWireframe, setIsWireframe] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isDrawingOpen, setIsDrawingOpen] = useState(false);
  const year = new Date().getFullYear();
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [canvasEl, setCanvasEl] = useState<HTMLCanvasElement | null>(null);

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
  const [radialValid, setRadialValid] = useState(true);
  const [radialColor, setRadialColor] = useState("#22c55e");
  const [radialLineWidth, setRadialLineWidth] = useState(1.5);

  const [showControlsPanel, setShowControlsPanel] = useState(false);
  const [showMaterialPanel, setShowMaterialPanel] = useState(false);

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
            show={showRadial && radialValid}
            type={radialType}
            color={radialColor}
            lineWidth={radialLineWidth}
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
        onCanvasReady={(el) => setCanvasEl(el)}
      />
      <div className="hidden sm:block">
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
          setRadialValid={setRadialValid}
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
      </div>
      {showControlsPanel && (
        <div className="sm:hidden">
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
            setRadialValid={setRadialValid}
          />
        </div>
      )}
      <div className="hidden sm:block">
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
          radialColor={radialColor}
          setRadialColor={setRadialColor}
          radialLineWidth={radialLineWidth}
          setRadialLineWidth={setRadialLineWidth}
        />
      </div>
      {showMaterialPanel && (
        <div className="sm:hidden">
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
            radialColor={radialColor}
            setRadialColor={setRadialColor}
            radialLineWidth={radialLineWidth}
            setRadialLineWidth={setRadialLineWidth}
          />
        </div>
      )}
      <div className="fixed top-4 left-4 sm:hidden z-30 flex gap-2">
        <button
          onClick={() => {
            setShowControlsPanel((v) => !v);
            setShowMaterialPanel(false);
          }}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
            showControlsPanel
              ? "bg-green-500/20 border-green-500 text-green-300"
              : "bg-gray-800 border-white/10 text-white"
          }`}
        >
          <Settings className="w-4 h-4" />
          <span className="text-xs">Fractal Settings</span>
        </button>
      </div>
      <div className="fixed top-4 right-4 sm:hidden z-30 flex gap-2">
        <button
          onClick={() => {
            setShowMaterialPanel((v) => !v);
            setShowControlsPanel(false);
          }}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
            showMaterialPanel
              ? "bg-green-500/20 border-green-500 text-green-300"
              : "bg-gray-800 border-white/10 text-white"
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span className="text-xs">3D Settings</span>
        </button>
      </div>
      {!showControlsPanel && !showMaterialPanel && (
        <div className="fixed inset-x-0 bottom-16 z-30 sm:hidden flex justify-center">
          <button
            onClick={() => setIsShareOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-gray-800 border-white/10 text-white hover:bg-gray-700 cursor-pointer"
          >
            <span className="text-xs">Download</span>
          </button>
        </div>
      )}
      <div className="hidden sm:flex fixed inset-x-0 bottom-12 z-30 justify-center pointer-events-none">
        <button
          onClick={() => setIsShareOpen(true)}
          className="pointer-events-auto px-4 py-2 rounded-xl border bg-black/60 border-white/20 text-white backdrop-blur-md shadow-2xl hover:bg-black/70 cursor-pointer"
        >
          Download
        </button>
      </div>
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
      <ShareStoryModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        canvasEl={canvasEl}
      />
      <footer className="fixed bottom-2 inset-x-0 z-10 flex justify-center">
        <div className="px-3 py-1 rounded-md text-xs text-gray-400">
          <span className="mr-2">© {year}</span>
          <a
            href="https://fiorellasaro.github.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-400 hover:text-green-300 underline decoration-green-500/40"
          >
            fiorellasaro
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;

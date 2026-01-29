import React, { useEffect, useRef, useState } from "react";
import {
  Settings,
  Info,
  Box,
  Triangle,
  Hexagon,
  Circle,
  Square,
  PenTool,
} from "lucide-react";
import type {
  GeometryType,
  FractalRuleConfig,
  ArrangementType,
} from "../utils/FractalGeometryUtils";

interface ControlPanelProps {
  depth: number;
  setDepth: (depth: number) => void;
  geometryType: GeometryType;
  setGeometryType: (val: GeometryType) => void;
  arrangementType: ArrangementType;
  setArrangementType: (val: ArrangementType) => void;
  ruleConfig: FractalRuleConfig;
  setRuleConfig: (val: FractalRuleConfig) => void;
  scaleFactor: number;
  setScaleFactor: (val: number) => void;
  onOpenInfo: () => void;
  onOpenDrawing: () => void;
  // Radial section
  showRadial: boolean;
  setShowRadial: (v: boolean) => void;
  setRadialValid?: (v: boolean) => void;
  radialType: "rose" | "hypotrochoid" | "epitrochoid";
  setRadialType: (v: "rose" | "hypotrochoid" | "epitrochoid") => void;
  radialSegments: number;
  setRadialSegments: (v: number) => void;
  radialA: number;
  setRadialA: (v: number) => void;
  radialK: number;
  setRadialK: (v: number) => void;
  radialR: number;
  setRadialR: (v: number) => void;
  radialr: number;
  setRadialr: (v: number) => void;
  radialD: number;
  setRadialD: (v: number) => void;
  radialRepeats: number;
  setRadialRepeats: (v: number) => void;
  radialRepeatRotation: number;
  setRadialRepeatRotation: (v: number) => void;
  radialRepeatScale: number;
  setRadialRepeatScale: (v: number) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  depth,
  setDepth,
  geometryType,
  setGeometryType,
  arrangementType,
  setArrangementType,
  ruleConfig,
  setRuleConfig,
  scaleFactor,
  setScaleFactor,
  onOpenInfo,
  onOpenDrawing,
  showRadial,
  setShowRadial,
  setRadialValid,
  radialType,
  setRadialType,
  radialSegments,
  setRadialSegments,
  radialA,
  setRadialA,
  radialK,
  setRadialK,
  radialR,
  setRadialR,
  radialr,
  setRadialr,
  radialD,
  setRadialD,
  radialRepeats,
  setRadialRepeats,
  radialRepeatRotation,
  setRadialRepeatRotation,
  radialRepeatScale,
  setRadialRepeatScale,
}) => {
  // Calculate N and r for display
  const getFractalStats = () => {
    // We need to calculate N dynamically based on current rule
    // We can't know EXACT N without querying the Utils, but we can estimate or import the logic.
    // For now, let's just display "Dynamic" or simple calculation if possible.
    // Actually, N depends on Geometry + Rule.
    // Let's count "Kept Elements".
    // This is UI logic, so maybe just showing scale is enough?
    // Or we can import the Utils helper to get counts?
    // Importing `getFractalPositions` here might be circular or heavy.
    // Let's just show r and kept components.

    return {
      r: scaleFactor.toFixed(3),
      components: [
        ruleConfig.keepVertices && "Vertices",
        ruleConfig.keepEdges && "Edges",
        ruleConfig.keepFaces && "Faces",
        ruleConfig.keepCenter && "Center",
      ]
        .filter(Boolean)
        .join(", "),
    };
  };

  const stats = getFractalStats();

  const toggleRule = (key: keyof FractalRuleConfig) => {
    setRuleConfig({ ...ruleConfig, [key]: !ruleConfig[key] });
  };

  const clamp = (v: number, min: number, max: number) =>
    Math.min(max, Math.max(min, v));
  const toNumber = (s: string, fallback: number) => {
    const n = parseFloat(s);
    return isNaN(n) ? fallback : n;
  };

  const [segmentsInput, setSegmentsInput] = useState(String(radialSegments));
  const [aInput, setAInput] = useState(String(radialA));
  const [kInput, setKInput] = useState(String(radialK));
  const [RInput, setRInput] = useState(String(radialR));
  const [rInput, setRsmallInput] = useState(String(radialr));
  const [dInput, setDInput] = useState(String(radialD));
  const [repeatsInput, setRepeatsInput] = useState(String(radialRepeats));
  const [rotInput, setRotInput] = useState(String(radialRepeatRotation));
  const [scaleInput, setScaleInput] = useState(String(radialRepeatScale));

  const desiredRadialRef = useRef(showRadial);
  useEffect(() => {
    desiredRadialRef.current = showRadial;
  }, [showRadial]);

  return (
    <div className="fixed inset-x-4 top-16 bottom-4 bg-gray-900/80 backdrop-blur-md p-4 rounded-xl border border-white/10 text-white w-auto shadow-2xl z-20 overflow-y-auto sm:absolute sm:inset-auto sm:top-4 sm:left-4 sm:bottom-auto sm:w-96 sm:overflow-visible sm:z-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-green-400" />
          <h2 className="text-xl font-bold text-green-400">Fractal Settings</h2>
        </div>
        <button
          onClick={onOpenInfo}
          className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-green-400 hover:text-green-300"
          title="Learn about Fractals"
        >
          <Info className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Geometry Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">
            Base Geometry
          </label>
          <div className="grid grid-cols-3 gap-1">
            {[
              { id: "cube", icon: Box, label: "Cube" },
              { id: "tetrahedron", icon: Triangle, label: "Tetra" },
              { id: "octahedron", icon: Hexagon, label: "Octa" }, // Hexagon as approx icon
              { id: "icosahedron", icon: Circle, label: "Ico" }, // Circle as approx
              { id: "dodecahedron", icon: Square, label: "Dodeca" }, // Square as approx
            ].map((geo) => (
              <button
                key={geo.id}
                onClick={() => setGeometryType(geo.id as GeometryType)}
                className={`flex flex-col items-center justify-center gap-1 py-1.5 px-1 rounded-lg border transition-all ${
                  geometryType === geo.id
                    ? "bg-green-500/20 border-green-500 text-green-300"
                    : "bg-gray-800 border-transparent text-gray-400 hover:bg-gray-700"
                }`}
              >
                <geo.icon className="w-4 h-4" />
                <span className="text-[10px] uppercase">{geo.label}</span>
              </button>
            ))}
            <button
              onClick={onOpenDrawing}
              className={`flex flex-col items-center justify-center gap-1 py-1.5 px-1 rounded-lg border transition-all ${
                geometryType === ("freehand" as GeometryType)
                  ? "bg-green-500/20 border-green-500 text-green-300"
                  : "bg-gray-800 border-transparent text-gray-400 hover:bg-gray-700"
              }`}
              title="Freehand Drawing"
            >
              <PenTool className="w-4 h-4" />
              <span className="text-[10px] uppercase">Draw</span>
            </button>
          </div>
        </div>

        {/* Arrangement Pattern (Unity Form) */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">
            Arrangement Pattern (Unity Form)
          </label>
          <select
            value={arrangementType}
            onChange={(e) =>
              setArrangementType(e.target.value as ArrangementType)
            }
            className="w-full bg-gray-800 text-white text-sm rounded-lg border border-gray-700 p-2 focus:border-green-500 focus:outline-none"
          >
            <option value="cube">Cubic (Grid)</option>
            <option value="tetrahedron">Tetrahedral</option>
            <option value="octahedron">Octahedral</option>
            <option value="icosahedron">Icosahedral</option>
            <option value="dodecahedron">Dodecahedral</option>
            <option value="spiral">Fibonacci Spiral (Sphere)</option>
            <option value="random">Random Cloud</option>
          </select>
        </div>

        {/* Radial Fractals (2D) */}
        <div className="space-y-2 pt-2 border-t border-white/10">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-300">
              Radial Fractals (2D)
            </label>
            <button
              onClick={() => setShowRadial(!showRadial)}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                showRadial ? "bg-green-500" : "bg-gray-700"
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  showRadial ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {showRadial && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-1">
                <div>
                  <label className="text-xs text-gray-400">Pattern</label>
                  <select
                    value={radialType}
                    onChange={(e) =>
                      setRadialType(
                        e.target.value as
                          | "rose"
                          | "hypotrochoid"
                          | "epitrochoid",
                      )
                    }
                    className="w-full bg-gray-800 text-white text-sm rounded-lg border border-gray-700 p-2 focus:border-green-500"
                  >
                    <option value="rose">Rose Curve</option>
                    <option value="hypotrochoid">Hypotrochoid</option>
                    <option value="epitrochoid">Epitrochoid</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400">Segments</label>
                  <input
                    type="number"
                    min={64}
                    max={4096}
                    value={segmentsInput}
                    onChange={(e) => {
                      const sv = e.target.value;
                      setSegmentsInput(sv);
                      if (sv.trim() === "") {
                        setRadialValid?.(false);
                        return;
                      }
                      const n = parseInt(sv);
                      const v = isNaN(n) ? radialSegments : n;
                      setRadialSegments(clamp(v, 64, 4096));
                      setRadialValid?.(true);
                    }}
                    className="w-full bg-gray-800 text-white text-sm rounded-lg border border-gray-700 p-2 focus:border-green-500"
                  />
                </div>
              </div>

              {radialType === "rose" && (
                <div className="grid grid-cols-2 gap-1">
                  <div>
                    <label className="text-xs text-gray-400">
                      Amplitude (a)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={aInput}
                      onChange={(e) => {
                        const sv = e.target.value;
                        setAInput(sv);
                        if (sv.trim() === "") {
                          setRadialValid?.(false);
                          return;
                        }
                        const v = clamp(toNumber(sv, radialA), 0.1, 10);
                        setRadialA(v);
                        setRadialValid?.(true);
                      }}
                      className="w-full bg-gray-800 text-white text-sm rounded-lg border border-gray-700 p-2 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Petals (k)</label>
                    <input
                      type="number"
                      min={1}
                      max={24}
                      value={kInput}
                      onChange={(e) => {
                        const sv = e.target.value;
                        setKInput(sv);
                        if (sv.trim() === "") {
                          setRadialValid?.(false);
                          return;
                        }
                        const n = parseInt(sv);
                        const v = isNaN(n) ? radialK : n;
                        setRadialK(clamp(v, 1, 24));
                        setRadialValid?.(true);
                      }}
                      className="w-full bg-gray-800 text-white text-sm rounded-lg border border-gray-700 p-2 focus:border-green-500"
                    />
                  </div>
                </div>
              )}

              {radialType !== "rose" && (
                <div className="grid grid-cols-3 gap-1">
                  <div>
                    <label className="text-xs text-gray-400">R (big)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={RInput}
                      onChange={(e) => {
                        const sv = e.target.value;
                        setRInput(sv);
                        if (sv.trim() === "") {
                          setRadialValid?.(false);
                          return;
                        }
                        const v = clamp(toNumber(sv, radialR), 0.1, 10);
                        setRadialR(v);
                        setRadialValid?.(true);
                      }}
                      className="w-full bg-gray-800 text-white text-sm rounded-lg border border-gray-700 p-2 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">r (small)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={rInput}
                      onChange={(e) => {
                        const sv = e.target.value;
                        setRsmallInput(sv);
                        if (sv.trim() === "") {
                          setRadialValid?.(false);
                          return;
                        }
                        const v = clamp(
                          toNumber(sv, radialr),
                          0.1,
                          Math.max(0.2, Math.min(10, radialR - 0.1)),
                        );
                        setRadialr(v);
                        setRadialValid?.(true);
                      }}
                      className="w-full bg-gray-800 text-white text-sm rounded-lg border border-gray-700 p-2 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">d (offset)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={dInput}
                      onChange={(e) => {
                        const sv = e.target.value;
                        setDInput(sv);
                        if (sv.trim() === "") {
                          setRadialValid?.(false);
                          return;
                        }
                        const v = clamp(
                          toNumber(sv, radialD),
                          0.1,
                          Math.max(0.2, radialr),
                        );
                        setRadialD(v);
                        setRadialValid?.(true);
                      }}
                      className="w-full bg-gray-800 text-white text-sm rounded-lg border border-gray-700 p-2 focus:border-green-500"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-1">
                <div>
                  <label className="text-xs text-gray-400">Repeats</label>
                  <input
                    type="number"
                    min={1}
                    max={64}
                    value={repeatsInput}
                    onChange={(e) => {
                      const sv = e.target.value;
                      setRepeatsInput(sv);
                      if (sv.trim() === "") {
                        setRadialValid?.(false);
                        return;
                      }
                      const n = parseInt(sv);
                      const v = isNaN(n) ? radialRepeats : n;
                      setRadialRepeats(clamp(v, 1, 64));
                      setRadialValid?.(true);
                    }}
                    className="w-full bg-gray-800 text-white text-sm rounded-lg border border-gray-700 p-2 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400">Rotation (°)</label>
                  <input
                    type="number"
                    step="1"
                    value={rotInput}
                    onChange={(e) => {
                      const sv = e.target.value;
                      setRotInput(sv);
                      if (sv.trim() === "") {
                        setRadialValid?.(false);
                        return;
                      }
                      const v = clamp(
                        toNumber(sv, radialRepeatRotation),
                        0,
                        360,
                      );
                      setRadialRepeatRotation(v);
                      setRadialValid?.(true);
                    }}
                    className="w-full bg-gray-800 text-white text-sm rounded-lg border border-gray-700 p-2 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400">Scale ×</label>
                  <input
                    type="number"
                    step="0.05"
                    value={scaleInput}
                    onChange={(e) => {
                      const sv = e.target.value;
                      setScaleInput(sv);
                      if (sv.trim() === "") {
                        setRadialValid?.(false);
                        return;
                      }
                      const v = clamp(toNumber(sv, radialRepeatScale), 0.5, 2);
                      setRadialRepeatScale(v);
                      setRadialValid?.(true);
                    }}
                    className="w-full bg-gray-800 text-white text-sm rounded-lg border border-gray-700 p-2 focus:border-green-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Custom Rule Configuration */}
        <div className="space-y-3 pt-2 border-t border-white/10">
          <label className="text-sm font-medium text-gray-300">
            Fractal Rule (Custom)
          </label>

          {/* Scale Factor Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-400">
              <span>Scale Factor (r)</span>
              <span>{scaleFactor.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="0.5"
              step="0.01"
              value={scaleFactor}
              onChange={(e) => setScaleFactor(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
            />
          </div>

          {/* Components Toggles */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "keepVertices", label: "Keep Corners" },
              { id: "keepEdges", label: "Keep Edges" },
              { id: "keepFaces", label: "Keep Faces" },
              { id: "keepCenter", label: "Keep Center" },
            ].map((opt) => (
              <label
                key={opt.id}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                    ruleConfig[opt.id as keyof FractalRuleConfig]
                      ? "bg-green-500 border-green-500"
                      : "border-gray-600 group-hover:border-gray-500"
                  }`}
                >
                  {ruleConfig[opt.id as keyof FractalRuleConfig] && (
                    <div className="w-2 h-2 bg-white rounded-sm" />
                  )}
                </div>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={ruleConfig[opt.id as keyof FractalRuleConfig]}
                  onChange={() => toggleRule(opt.id as keyof FractalRuleConfig)}
                />
                <span className="text-xs text-gray-300 group-hover:text-white transition-colors">
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Depth Control */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-gray-300">
              Recursion Depth
            </label>
            <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
              {depth}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="3" // Limit to 3 to prevent crash (Menger Sponge grows fast: 20^3 = 8000 meshes)
            step="1"
            value={depth}
            onChange={(e) => setDepth(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
          />
          <p className="text-xs text-gray-500">
            Higher depth = exponentially more geometry. Max 3.
          </p>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-white/10 flex items-start gap-2 text-xs text-gray-400">
        <div className="flex-1">
          <p className="mb-1">
            <strong>Parameters:</strong>
          </p>
          <p>
            r = <span className="text-green-400 font-bold">{stats.r}</span>
          </p>
          <p className="mt-1 opacity-75">{stats.components}</p>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;

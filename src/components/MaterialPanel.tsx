import React from "react";
import { Sliders } from "lucide-react";

interface MaterialPanelProps {
  size: number;
  setSize: (v: number) => void;
  rotationSpeed: number;
  setRotationSpeed: (v: number) => void;
  metalness: number;
  setMetalness: (v: number) => void;
  roughness: number;
  setRoughness: (v: number) => void;
  isWireframe: boolean;
  setIsWireframe: (v: boolean) => void;
  color: string;
  setColor: (v: string) => void;
  radialColor?: string;
  setRadialColor?: (v: string) => void;
  radialLineWidth?: number;
  setRadialLineWidth?: (v: number) => void;
}

const MaterialPanel: React.FC<MaterialPanelProps> = ({
  size,
  setSize,
  rotationSpeed,
  setRotationSpeed,
  metalness,
  setMetalness,
  roughness,
  setRoughness,
  isWireframe,
  setIsWireframe,
  color,
  setColor,
  radialColor,
  setRadialColor,
  radialLineWidth,
  setRadialLineWidth,
}) => {
  return (
    <div className="fixed inset-x-4 top-16 bottom-4 bg-gray-900/80 backdrop-blur-md p-4 rounded-xl border border-white/10 text-white w-auto shadow-2xl z-20 overflow-y-auto sm:absolute sm:inset-auto sm:top-4 sm:right-4 sm:bottom-auto sm:w-96 sm:overflow-visible sm:z-10">
      <div className="flex items-center gap-2 mb-4">
        <Sliders className="w-5 h-5 text-green-400" />
        <h2 className="text-xl font-bold text-green-400">3D Render & Material</h2>
      </div>

      <div className="space-y-4">
        {/* Size Control */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-gray-300">Base Size</label>
            <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
              {size}
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="5"
            step="0.1"
            value={size}
            onChange={(e) => setSize(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
          />
        </div>

        {/* Rotation Speed Control */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-gray-300">Rotation Speed</label>
            <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">
              {rotationSpeed.toFixed(1)}x
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="5"
            step="0.1"
            value={rotationSpeed}
            onChange={(e) => setRotationSpeed(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
          />
        </div>

        {/* Material Controls */}
        <div className="space-y-3 pt-3 border-t border-white/10">
          <h3 className="text-sm font-semibold text-gray-300">Material Properties</h3>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs text-gray-400">Metalness</label>
              <span className="text-xs text-gray-500">{metalness.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={metalness}
              onChange={(e) => setMetalness(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs text-gray-400">Roughness</label>
              <span className="text-xs text-gray-500">{roughness.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={roughness}
              onChange={(e) => setRoughness(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-300">Wireframe Mode</label>
            <button
              onClick={() => setIsWireframe(!isWireframe)}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                isWireframe ? "bg-green-500" : "bg-gray-700"
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  isWireframe ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Color Control */}
        <div className="space-y-2 pt-3 border-t border-white/10">
          <label className="text-sm font-medium text-gray-300">Material Color</label>
          <div className="flex gap-2 flex-wrap">
            {[
              "#ef4444", // Red
              "#f97316", // Orange
              "#eab308", // Yellow
              "#22c55e", // Green
              "#3b82f6", // Blue
              "#a855f7", // Purple
              "#ec4899", // Pink
              "#ffffff", // White
              "#000000", // Black
            ].map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  color === c ? "border-white scale-110" : "border-transparent hover:scale-105"
                }`}
                style={{ backgroundColor: c }}
                aria-label={`Select color ${c}`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-gray-400">Custom:</span>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-6 w-full rounded cursor-pointer bg-transparent"
            />
          </div>
        </div>

        {/* Radial Overlay Controls */}
        <div className="space-y-2 pt-4 border-t border-white/10">
          <h3 className="text-sm font-semibold text-gray-300">Radial Fractal Overlay</h3>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Radial Color</label>
            <div className="flex gap-2 flex-wrap">
              {[
                "#ef4444",
                "#f97316",
                "#eab308",
                "#22c55e",
                "#3b82f6",
                "#a855f7",
                "#ec4899",
                "#ffffff",
                "#000000",
              ].map((c) => (
                <button
                  key={c}
                  onClick={() => setRadialColor?.(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    radialColor === c ? "border-white scale-110" : "border-transparent hover:scale-105"
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Select radial color ${c}`}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-gray-400">Custom:</span>
              <input
                type="color"
                value={radialColor ?? "#22c55e"}
                onChange={(e) => setRadialColor?.(e.target.value)}
                className="h-6 w-full rounded cursor-pointer bg-transparent"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Line Width</label>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={radialLineWidth ?? 1.5}
              onChange={(e) => setRadialLineWidth?.(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialPanel;

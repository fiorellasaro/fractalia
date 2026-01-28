import React, { useRef, useState, useEffect } from "react";
import { X, Check, Trash2, PenTool } from "lucide-react";
import * as THREE from "three";

interface DrawingPadProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (points: THREE.Vector3[]) => void;
}

const DrawingPad: React.FC<DrawingPadProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [points, setPoints] = useState<{ x: number; y: number }[]>([]);

  // Initialize/Clear canvas
  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.lineWidth = 4;
        ctx.strokeStyle = "#22c55e"; // Green-500
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw grid
        ctx.strokeStyle = "#333";
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i < canvas.width; i += 50) {
          ctx.moveTo(i, 0);
          ctx.lineTo(i, canvas.height);
        }
        for (let i = 0; i < canvas.height; i += 50) {
          ctx.moveTo(0, i);
          ctx.lineTo(canvas.width, i);
        }
        ctx.stroke();

        // Reset stroke style
        ctx.strokeStyle = "#22c55e";
        ctx.lineWidth = 4;
      }
      setPoints([]);
    }
  }, [isOpen]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const pos = getPos(e);
    setPoints([pos]);

    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const pos = getPos(e);
    setPoints((prev) => [...prev, pos]);

    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const clientX =
      "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY =
      "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const handleConfirm = () => {
    if (points.length < 2) return;

    // Normalize points to [-1, 1] range centered at (0,0)
    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const width = maxX - minX;
    const height = maxY - minY;
    const scale = Math.max(width, height) || 1;
    const centerX = minX + width / 2;
    const centerY = minY + height / 2;

    // Convert to Vector3 array (2D on XY plane, Z=0)
    // Invert Y because canvas Y is down, 3D Y is up
    const normalizedPoints = points.map(
      (p) =>
        new THREE.Vector3(
          (p.x - centerX) / (scale / 2),
          -(p.y - centerY) / (scale / 2),
          0,
        ),
    );

    onConfirm(normalizedPoints);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-gray-900 border border-white/20 rounded-2xl p-6 shadow-2xl max-w-2xl w-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <PenTool className="text-green-400" />
            <h2 className="text-xl font-bold text-green-400">
              Draw Seed Geometry
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="relative rounded-lg overflow-hidden border border-gray-700 bg-gray-950 cursor-crosshair touch-none">
          <canvas
            ref={canvasRef}
            width={600}
            height={400}
            className="w-full h-full block"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />

          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={() => {
                const ctx = canvasRef.current?.getContext("2d");
                if (ctx)
                  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                setPoints([]);
              }}
              className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 border border-red-500/50"
              title="Clear"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center mt-6">
          <p className="text-sm text-gray-500">
            Draw a continuous stroke. This will be the building block of your
            fractal.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={points.length < 2}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              <Check size={18} />
              Use Drawing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrawingPad;

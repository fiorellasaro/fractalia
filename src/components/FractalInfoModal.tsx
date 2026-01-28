import React from "react";
import { X, Box, GitBranch, Calculator, Sigma } from "lucide-react";
import type {
  GeometryType,
  FractalRuleConfig,
  ArrangementType,
} from "../utils/FractalGeometryUtils";
import { getFractalStats } from "../utils/FractalGeometryUtils";

interface FractalInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  geometryType: GeometryType;
  arrangementType?: ArrangementType;
  scaleFactor: number;
  ruleConfig: FractalRuleConfig;
}

const FractalInfoModal: React.FC<FractalInfoModalProps> = ({
  isOpen,
  onClose,
  geometryType,
  arrangementType,
  scaleFactor,
  ruleConfig,
}) => {
  if (!isOpen) return null;

  const stats = getFractalStats(
    geometryType,
    ruleConfig,
    scaleFactor,
    arrangementType,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 border border-white/20 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-gray-900/95 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            <Box className="w-6 h-6 text-green-400" />
            <h2 className="text-xl font-bold text-green-400">
              Fractal Geometry Theory
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8 text-gray-300">
          {/* Section 1: Self Similarity */}
          <section>
            <div className="flex items-center gap-2 mb-3 text-green-400">
              <GitBranch size={20} />
              <h3 className="font-bold text-lg">Self-Similarity & Recursion</h3>
            </div>
            <p className="leading-relaxed">
              Geometric fractals are created by repeating a simple rule
              infinitely. Starting with a base shape (like a {geometryType}), we
              replace parts of it with smaller copies of itself. This property
              is called <strong>Self-Similarity</strong>.
            </p>
            <div className="mt-4 bg-green-500/10 border border-green-500/20 p-4 rounded-lg">
              <h4 className="text-green-300 font-semibold mb-2">
                Current Configuration:
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>
                  Base Geometry:{" "}
                  <span className="text-white capitalize">{geometryType}</span>
                </li>
                <li>
                  Scaling Factor (r):{" "}
                  <span className="text-white">
                    1/{Math.round(1 / scaleFactor)} ({scaleFactor.toFixed(3)})
                  </span>
                </li>
                <li>
                  Copies per Iteration (N):{" "}
                  <span className="text-white">{stats.N}</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Section 2: Fractal Dimension */}
          <section>
            <div className="flex items-center gap-2 mb-3 text-green-400">
              <Calculator size={20} />
              <h3 className="font-bold text-lg">Fractal Dimension</h3>
            </div>
            <p className="mb-4">
              Unlike normal objects (1D line, 2D plane, 3D solid), fractals have
              non-integer dimensions. We calculate this using the Hausdorff
              dimension formula:
            </p>

            <div className="bg-black/40 p-6 rounded-xl border border-white/10 flex flex-col items-center justify-center font-mono text-lg my-4">
              <div className="flex items-center gap-4 mb-4">
                <span>D = </span>
                <div className="flex flex-col items-center">
                  <span className="border-b border-gray-400 px-2">log(N)</span>
                  <span>log(1/r)</span>
                </div>
              </div>

              <div className="w-full h-px bg-white/10 my-2"></div>

              <div className="text-sm text-gray-400 w-full text-center">
                For your current fractal:
              </div>
              <div className="flex items-center gap-2 mt-2 text-green-400 font-bold">
                <span>D ≈ </span>
                <div className="flex flex-col items-center text-sm text-gray-300">
                  <span className="border-b border-gray-500 px-1">
                    log({stats.N})
                  </span>
                  <span>log({(1 / scaleFactor).toFixed(2)})</span>
                </div>
                <span> = {stats.D.toFixed(4)}</span>
              </div>
            </div>

            <p className="text-sm italic text-gray-400">
              * A value between 2 and 3 means the object is "more than a
              surface" but "less than a solid".
            </p>
          </section>

          {/* Section 3: The Algorithm */}
          <section>
            <div className="flex items-center gap-2 mb-3 text-green-400">
              <Sigma size={20} />
              <h3 className="font-bold text-lg">The Algorithm</h3>
            </div>
            <ol className="list-decimal list-inside space-y-2 text-sm bg-green-500/5 p-4 rounded-lg border border-green-500/10">
              <li>
                Start with a base <strong>{geometryType}</strong> of size S.
              </li>
              <li>
                Divide it into smaller {geometryType}s of size S ×{" "}
                {scaleFactor.toFixed(2)}.
              </li>
              <li>
                Keep only the pieces defined by your rule (Vertices:{" "}
                {ruleConfig.keepVertices ? "Yes" : "No"}, Edges:{" "}
                {ruleConfig.keepEdges ? "Yes" : "No"}, etc).
              </li>
              <li>Repeat this process for each remaining piece.</li>
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
};

export default FractalInfoModal;

import React, { useEffect, useMemo, useState } from "react";
import { useStoryExport, type ExportOptions } from "../hooks/useStoryExport";
import { Share2, Download, Image as ImageIcon, Film, Loader2, X } from "lucide-react";

interface ShareStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  canvasEl: HTMLCanvasElement | null;
}

const ShareStoryModal: React.FC<ShareStoryModalProps> = ({ isOpen, onClose, canvasEl }) => {
  const [type, setType] = useState<"image" | "video">("image");
  const [quality, setQuality] = useState<"standard" | "high">("standard");
  const [includeWatermark, setIncludeWatermark] = useState(true);
  const [background, setBackground] = useState<"black" | "transparent">("black");
  const [watermarkText, setWatermarkText] = useState("fractalia");
  const { exporting, result, error, exportImage, share, reset } = useStoryExport();

  useEffect(() => {
    if (!isOpen) reset();
  }, [isOpen, reset]);

  const canExport = useMemo(() => !!canvasEl && !exporting, [canvasEl, exporting]);

  const handleExport = async () => {
    if (!canvasEl) return;
    const opts: ExportOptions = {
      type,
      quality,
      includeWatermark,
      background,
      watermarkText,
    };
    await exportImage(canvasEl, opts);
  };

  const handleShare = async () => {
    const res = await share();
    if (!res.ok) {
      // No share with files support: keep result visible for manual download
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/40">
      <div className="bg-gray-900 rounded-xl border border-white/10 w-full sm:w-[420px] p-4 text-white">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-green-400">Share to Instagram Story</h3>
          <button onClick={onClose} className="p-2 rounded hover:bg-white/10">
            <X className="w-5 h-5 text-gray-300" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs text-gray-400">Export Type</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setType("image")}
                  className={`flex items-center gap-1 px-2 py-1 rounded border ${
                    type === "image"
                      ? "border-green-500 bg-green-500/20 text-green-300"
                      : "border-white/10 bg-gray-800 text-gray-300"
                  }`}
                >
                  <ImageIcon className="w-4 h-4" /> PNG
                </button>
                <button
                  onClick={() => setType("video")}
                  className={`flex items-center gap-1 px-2 py-1 rounded border ${
                    type === "video"
                      ? "border-green-500 bg-green-500/20 text-green-300"
                      : "border-white/10 bg-gray-800 text-gray-300"
                  }`}
                  title="Video export may not be supported on all devices"
                >
                  <Film className="w-4 h-4" /> Video
                </button>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-400">Quality</label>
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value as "standard" | "high")}
                className="w-full bg-gray-800 text-white text-sm rounded border border-white/10 p-2"
              >
                <option value="standard">Standard (1080×1920)</option>
                <option value="high">High (2160×3840)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs text-gray-400">Background</label>
              <select
                value={background}
                onChange={(e) => setBackground(e.target.value as "black" | "transparent")}
                className="w-full bg-gray-800 text-white text-sm rounded border border-white/10 p-2"
              >
                <option value="black">Solid Black</option>
                <option value="transparent">Transparent</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-400">Watermark</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIncludeWatermark(!includeWatermark)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    includeWatermark ? "bg-green-500" : "bg-gray-700"
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      includeWatermark ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
                <input
                  type="text"
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  className="flex-1 bg-gray-800 text-white text-sm rounded border border-white/10 p-2"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={handleExport}
              disabled={!canExport}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                canExport
                  ? "bg-green-500/20 border-green-500 text-green-300 hover:bg-green-500/30"
                  : "bg-gray-800 border-white/10 text-gray-400"
              }`}
            >
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span className="text-sm">{exporting ? "Exporting…" : "Export"}</span>
            </button>

            <button
              onClick={handleShare}
              disabled={!result}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                result
                  ? "bg-green-500/20 border-green-500 text-green-300 hover:bg-green-500/30"
                  : "bg-gray-800 border-white/10 text-gray-400"
              }`}
            >
              <Share2 className="w-4 h-4" />
              <span className="text-sm">Share</span>
            </button>
          </div>

          {result && (
            <div className="mt-3 space-y-2">
              <img
                src={result.url}
                alt="preview"
                className="w-full rounded border border-white/10"
              />
              <div className="flex items-center gap-2">
                <a
                  href={result.url}
                  download="fractalia-story.png"
                  className="text-xs text-green-300 underline"
                >
                  Download PNG
                </a>
                <button
                  onClick={() => navigator.clipboard?.writeText(location.href)}
                  className="text-xs text-gray-300 underline"
                >
                  Copy link
                </button>
              </div>
              <p className="text-xs text-gray-400">
                If share isn’t supported, download and upload in Instagram: Create Story → Upload.
              </p>
            </div>
          )}

          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default ShareStoryModal;


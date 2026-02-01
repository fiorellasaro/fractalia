import React, { useEffect, useState } from "react";
import {
  useStoryExport,
  type ExportOptions,
  type ExportResult,
} from "../hooks/useStoryExport";
import { Download, Image as ImageIcon, Film, Loader2, X } from "lucide-react";

interface ShareStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  canvasEl: HTMLCanvasElement | null;
}

const ShareStoryModal: React.FC<ShareStoryModalProps> = ({
  isOpen,
  onClose,
  canvasEl,
}) => {
  const [type, setType] = useState<"image" | "video">("image");
  const { exporting, error, exportImage, exportVideo, reset } =
    useStoryExport();
  const [cachedImage, setCachedImage] = useState<ExportResult | null>(null);
  const [cachedVideo, setCachedVideo] = useState<ExportResult | null>(null);
  const [activeResult, setActiveResult] = useState<ExportResult | null>(null);

  useEffect(() => {
    if (!isOpen) reset();
  }, [isOpen, reset]);

  const activeCanvas =
    canvasEl ??
    (isOpen
      ? ((document.querySelector("canvas") as HTMLCanvasElement | null) ?? null)
      : null);

  useEffect(() => {
    const run = async () => {
      if (!isOpen || !activeCanvas) return;
      const opts: ExportOptions = {
        type,
        quality: "standard",
        includeWatermark: false,
        background: "black",
      };
      if (type === "video") {
        if (cachedVideo) {
          setActiveResult(cachedVideo);
          return;
        }
        const res = await exportVideo(activeCanvas, opts);
        setCachedVideo(res);
        setActiveResult(res);
      } else {
        if (cachedImage) {
          setActiveResult(cachedImage);
          return;
        }
        const res = await exportImage(activeCanvas, opts);
        setCachedImage(res);
        setActiveResult(res);
      }
    };
    run();
  }, [
    isOpen,
    activeCanvas,
    type,
    exportImage,
    exportVideo,
    cachedImage,
    cachedVideo,
  ]);

  const handleClose = () => {
    if (cachedImage?.url) URL.revokeObjectURL(cachedImage.url);
    if (cachedVideo?.url) URL.revokeObjectURL(cachedVideo.url);
    setCachedImage(null);
    setCachedVideo(null);
    setActiveResult(null);
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/40 p-4 sm:p-0">
      <div className="bg-gray-900 rounded-xl border border-white/10 w-full sm:w-[420px] p-4 text-white max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-green-400">
            Export & Download
          </h3>
          <button
            onClick={handleClose}
            className="p-2 rounded hover:bg-white/10"
          >
            <X className="w-5 h-5 text-gray-300" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs text-gray-400">Type</label>
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
                >
                  <Film className="w-4 h-4" /> Video
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => {
                if (!activeResult) return;
                const a = document.createElement("a");
                a.href = activeResult.url;
                a.download =
                  activeResult.type === "video"
                    ? "fractalia-export.webm"
                    : "fractalia-export.png";
                document.body.appendChild(a);
                a.click();
                a.remove();
              }}
              disabled={!activeResult || exporting}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                activeResult && !exporting
                  ? "bg-gray-800 border-white/10 text-white hover:bg-gray-700 cursor-pointer"
                  : "bg-gray-800 border-white/10 text-gray-400 cursor-not-allowed"
              }`}
            >
              <Download className="w-4 h-4" />
              <span className="text-sm">Download</span>
            </button>
            {exporting && !activeResult && (
              <div className="flex items-center gap-2 text-xs text-gray-300">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating…</span>
              </div>
            )}
          </div>

          {activeResult ? (
            <div className="mt-3 space-y-2">
              {activeResult.type === "image" ? (
                <img
                  src={activeResult.url}
                  alt="preview"
                  className="w-full rounded border border-white/10"
                />
              ) : (
                <video
                  src={activeResult.url}
                  controls
                  className="w-full rounded border border-white/10"
                />
              )}
            </div>
          ) : (
            exporting && (
              <div className="mt-3 flex items-center justify-center h-40 border border-white/10 rounded">
                <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
              </div>
            )
          )}

          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default ShareStoryModal;

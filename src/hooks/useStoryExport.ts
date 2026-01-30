import { useCallback, useState } from "react";

export type StoryQuality = "standard" | "high";
export type BackgroundMode = "black" | "transparent";
export type ExportType = "image" | "video";

export interface ExportOptions {
  type: ExportType;
  quality: StoryQuality;
  includeWatermark: boolean;
  background: BackgroundMode;
  watermarkText?: string;
}

export interface ExportResult {
  blob: Blob;
  url: string;
  width: number;
  height: number;
  type: ExportType;
}

const getTargetSize = (quality: StoryQuality) =>
  quality === "high" ? { w: 2160, h: 3840 } : { w: 1080, h: 1920 };

const drawLetterboxed = (
  ctx: CanvasRenderingContext2D,
  targetW: number,
  targetH: number,
  source: HTMLCanvasElement,
) => {
  const sw = source.width;
  const sh = source.height;
  const sAspect = sw / sh;
  const tAspect = targetW / targetH;
  let dw = targetW;
  let dh = targetH;
  if (sAspect > tAspect) {
    dh = Math.round(dw / sAspect);
  } else {
    dw = Math.round(dh * sAspect);
  }
  const dx = Math.round((targetW - dw) / 2);
  const dy = Math.round((targetH - dh) / 2);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, sw, sh, dx, dy, dw, dh);
};

export function useStoryExport() {
  const [exporting, setExporting] = useState(false);
  const [result, setResult] = useState<ExportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const exportImage = useCallback(
    async (sourceCanvas: HTMLCanvasElement, opts: ExportOptions) => {
      setExporting(true);
      setError(null);
      try {
        const { w, h } = getTargetSize(opts.quality);
        const off = document.createElement("canvas");
        off.width = w;
        off.height = h;
        const ctx = off.getContext("2d");
        if (!ctx) throw new Error("Canvas 2D context unavailable");
        if (opts.background === "black") {
          ctx.fillStyle = "#000";
          ctx.fillRect(0, 0, w, h);
        } else {
          ctx.clearRect(0, 0, w, h);
        }
        drawLetterboxed(ctx, w, h, sourceCanvas);
        if (opts.includeWatermark) {
          const text = opts.watermarkText ?? "fractalia";
          ctx.font = "28px Inter, system-ui, sans-serif";
          ctx.fillStyle = "rgba(34,197,94,0.8)";
          ctx.textAlign = "center";
          ctx.textBaseline = "bottom";
          ctx.fillText(text, Math.floor(w / 2), h - 24);
        }
        const blob = await new Promise<Blob>((resolve, reject) =>
          off.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png"),
        );
        const url = URL.createObjectURL(blob);
        const res: ExportResult = { blob, url, width: w, height: h, type: "image" };
        setResult(res);
        return res;
      } catch (e: any) {
        setError(String(e?.message ?? e));
        throw e;
      } finally {
        setExporting(false);
      }
    },
    [],
  );

  const share = useCallback(async () => {
    if (!result) return { ok: false, reason: "no_result" as const };
    try {
      const file = new File([result.blob], "fractalia-story.png", { type: "image/png" });
      const data = { files: [file], title: "Fractalia", text: "My fractal artwork" };
      if ((navigator as any).canShare && (navigator as any).canShare(data)) {
        await (navigator as any).share(data);
        return { ok: true as const };
      }
      return { ok: false as const, reason: "unsupported" as const };
    } catch {
      return { ok: false as const, reason: "error" as const };
    }
  }, [result]);

  const reset = useCallback(() => {
    if (result?.url) URL.revokeObjectURL(result.url);
    setResult(null);
    setError(null);
  }, [result]);

  return { exporting, result, error, exportImage, share, reset };
}


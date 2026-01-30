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

// removed contain mode (unused)

const drawCoverCentered = (
  ctx: CanvasRenderingContext2D,
  targetW: number,
  targetH: number,
  source: HTMLCanvasElement,
) => {
  const sw = source.width;
  const sh = source.height;
  const sAspect = sw / sh;
  const tAspect = targetW / targetH;
  let sx = 0;
  let sy = 0;
  let cw = sw;
  let ch = sh;
  if (sAspect > tAspect) {
    cw = Math.round(sh * tAspect);
    sx = Math.round((sw - cw) / 2);
    sy = 0;
  } else {
    ch = Math.round(sw / tAspect);
    sy = Math.round((sh - ch) / 2);
    sx = 0;
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, sx, sy, cw, ch, 0, 0, targetW, targetH);
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
        drawCoverCentered(ctx, w, h, sourceCanvas);
        if (opts.includeWatermark) {
          const text = opts.watermarkText ?? "fractalia";
          ctx.font = "28px Inter, system-ui, sans-serif";
          ctx.fillStyle = "rgba(34,197,94,0.8)";
          ctx.textAlign = "center";
          ctx.textBaseline = "bottom";
          ctx.fillText(text, Math.floor(w / 2), h - 24);
        }
        const blob = await new Promise<Blob>((resolve, reject) =>
          off.toBlob(
            (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
            "image/png",
          ),
        );
        const url = URL.createObjectURL(blob);
        const res: ExportResult = {
          blob,
          url,
          width: w,
          height: h,
          type: "image",
        };
        setResult(res);
        return res;
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg);
        throw e;
      } finally {
        setExporting(false);
      }
    },
    [],
  );

  const exportVideo = useCallback(
    async (sourceCanvas: HTMLCanvasElement, opts: ExportOptions) => {
      setExporting(true);
      setError(null);
      try {
        const MR = (
          window as unknown as {
            MediaRecorder?: typeof MediaRecorder;
          }
        ).MediaRecorder;
        if (!MR) throw new Error("MediaRecorder unsupported");
        const { w, h } = getTargetSize(opts.quality);
        const composite = document.createElement("canvas");
        composite.width = w;
        composite.height = h;
        const ctx = composite.getContext("2d");
        if (!ctx) throw new Error("Canvas 2D context unavailable");
        const stream = (composite as HTMLCanvasElement).captureStream(30);
        const recorder = new MR(stream, {
          mimeType: "video/webm;codecs=vp9",
          videoBitsPerSecond: 4_000_000,
        });
        const chunks: BlobPart[] = [];
        recorder.ondataavailable = (e: BlobEvent) => {
          if (e.data && e.data.size > 0) chunks.push(e.data);
        };
        const durationMs = 6000;
        const start = performance.now();
        recorder.start();
        await new Promise<void>((resolve) => {
          const drawFrame = () => {
            if (opts.background === "black") {
              ctx.fillStyle = "#000";
              ctx.fillRect(0, 0, w, h);
            } else {
              ctx.clearRect(0, 0, w, h);
            }
            drawCoverCentered(ctx, w, h, sourceCanvas);
            if (opts.includeWatermark) {
              const text = opts.watermarkText ?? "fractalia";
              ctx.font = "28px Inter, system-ui, sans-serif";
              ctx.fillStyle = "rgba(34,197,94,0.8)";
              ctx.textAlign = "center";
              ctx.textBaseline = "bottom";
              ctx.fillText(text, Math.floor(w / 2), h - 24);
            }
            if (performance.now() - start < durationMs) {
              requestAnimationFrame(drawFrame);
            } else {
              resolve();
            }
          };
          requestAnimationFrame(drawFrame);
        });
        recorder.stop();
        await new Promise<void>((resolve) => {
          recorder.onstop = () => resolve();
        });
        const blob = new Blob(chunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const res: ExportResult = {
          blob,
          url,
          width: w,
          height: h,
          type: "video",
        };
        setResult(res);
        return res;
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg);
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
      const isVideo = result.type === "video";
      const filename = isVideo ? "fractalia-story.webm" : "fractalia-story.png";
      const mime = isVideo ? "video/webm" : "image/png";
      const file = new File([result.blob], filename, { type: mime });
      type ExtendedShareData = ShareData & { files?: File[] };
      const data: ExtendedShareData = {
        files: [file],
        title: "Fractalia",
        text: "My fractal artwork",
      };
      const nav = navigator as Navigator & {
        canShare?: (data: ExtendedShareData) => boolean;
        share?: (data: ExtendedShareData) => Promise<void>;
      };
      if (nav.canShare && nav.canShare(data) && nav.share) {
        await nav.share(data);
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

  return { exporting, result, error, exportImage, exportVideo, share, reset };
}

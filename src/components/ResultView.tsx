import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import type { FrameColor } from "@/pages/Index";

interface ResultViewProps {
  photos: string[];
  videoBlob: Blob | null;
  frameColor: FrameColor;
  onFrameColorChange?: (color: FrameColor) => void;
  onRetake: () => void;
}

const frameHsl: Record<FrameColor, string> = {
  pink: "hsl(350,60%,75%)",
  black: "hsl(0,0%,12%)",
  navy: "hsl(220,50%,25%)",
  maroon: "hsl(0,50%,25%)",
};

const frameFg: Record<FrameColor, string> = {
  pink: "#fff",
  black: "#ccc",
  navy: "#ccc",
  maroon: "#ccc",
};

const formatTimestamp = () => {
  const now = new Date();
  const months = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
  return `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()} · ${now.getHours().toString().padStart(2,"0")}:${now.getMinutes().toString().padStart(2,"0")}`;
};

const ResultView = ({ photos, videoBlob, frameColor, onFrameColorChange, onRetake }: ResultViewProps) => {
  const [mode, setMode] = useState<"photo" | "video">("photo");
  const stripCanvasRef = useRef<HTMLCanvasElement>(null);
  const [stripUrl, setStripUrl] = useState<string | null>(null);
  const videoUrl = useMemo(() => videoBlob ? URL.createObjectURL(videoBlob) : null, [videoBlob]);
  const timestamp = formatTimestamp();

  // Generate photo grid (2 cols x 3 rows)
  useEffect(() => {
    if (photos.length === 0) return;
    const canvas = stripCanvasRef.current;
    if (!canvas) return;

    const imgSize = 360;
    const gap = 12;
    const padding = 20;
    const bottomPad = 48;
    const cols = 2;
    const rows = 3;
    const w = padding * 2 + imgSize * cols + gap * (cols - 1);
    const h = padding + (imgSize + gap) * rows - gap + bottomPad;

    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;

    // Frame background
    ctx.fillStyle = frameHsl[frameColor];
    ctx.fillRect(0, 0, w, h);

    let loaded = 0;
    photos.forEach((src, i) => {
      const img = new Image();
      img.onload = () => {
        // Column-major: 0,1,2 -> col 0; 3,4,5 -> col 1
        const col = Math.floor(i / rows);
        const row = i % rows;
        const x = padding + col * (imgSize + gap);
        const y = padding + row * (imgSize + gap);
        ctx.drawImage(img, x, y, imgSize, imgSize);
        loaded++;
        if (loaded === photos.length) {
          ctx.fillStyle = frameFg[frameColor];
          ctx.font = "12px 'Inter', sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(timestamp, w / 2, h - 18);
          setStripUrl(canvas.toDataURL("image/jpeg", 0.9));
        }
      };
      img.src = src;
    });
  }, [photos, frameColor, timestamp]);

  const downloadStrip = useCallback(() => {
    if (!stripUrl) return;
    const link = document.createElement("a");
    link.download = `moments-strip-${Date.now()}.jpg`;
    link.href = stripUrl;
    link.click();
  }, [stripUrl]);

  const downloadVideo = useCallback(() => {
    if (!videoUrl) return;
    const link = document.createElement("a");
    link.download = `moments-video-${Date.now()}.webm`;
    link.href = videoUrl;
    link.click();
  }, [videoUrl]);

  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, [videoUrl]);

  const frameBg = {
    pink: "bg-[hsl(350,60%,75%)]",
    black: "bg-[hsl(0,0%,12%)]",
    navy: "bg-[hsl(220,50%,25%)]",
    maroon: "bg-[hsl(0,50%,25%)]",
  }[frameColor];

  const colorOptions: { value: FrameColor; bg: string; ring: string }[] = [
    { value: "pink", bg: "bg-[hsl(350,60%,75%)]", ring: "ring-[hsl(350,60%,75%)]" },
    { value: "black", bg: "bg-[hsl(0,0%,12%)]", ring: "ring-[hsl(0,0%,12%)]" },
    { value: "navy", bg: "bg-[hsl(220,50%,25%)]", ring: "ring-[hsl(220,50%,25%)]" },
    { value: "maroon", bg: "bg-[hsl(0,50%,25%)]", ring: "ring-[hsl(0,50%,25%)]" },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10 animate-gentle-fade">
      <div className="w-full max-w-md space-y-8">
        {/* Toggle */}
        <div className="flex justify-center">
          <div className="inline-flex bg-muted rounded-full p-1 gap-1">
            <button
              onClick={() => setMode("photo")}
              className={`px-4 py-1.5 text-xs tracking-widest uppercase rounded-full transition-all duration-500 ${
                mode === "photo"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              photo
            </button>
            <button
              onClick={() => setMode("video")}
              disabled={!videoBlob}
              className={`px-4 py-1.5 text-xs tracking-widest uppercase rounded-full transition-all duration-500 disabled:opacity-30 ${
                mode === "video"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              video
            </button>
          </div>
        </div>

        {/* Photo grid preview with color picker */}
        {mode === "photo" && (
          <div className="flex items-center justify-center gap-4 animate-gentle-fade">
            {/* Photo grid card */}
            <div
              className={`${frameBg} rounded-[10px] shadow-xl shadow-polaroid-shadow/30 relative`}
              style={{ width: "340px", padding: "18px", paddingBottom: "44px" }}
            >
              <div
                className="grid"
                style={{
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gridTemplateRows: "repeat(3, 1fr)",
                  gap: "12px",
                }}
              >
                {[0, 1, 2, 3, 4, 5].map((i) => {
                  // Column-major mapping: photo 1→r1c1, 2→r2c1, 3→r3c1, 4→r1c2, 5→r2c2, 6→r3c2
                  const col = Math.floor(i / 3) + 1;
                  const row = (i % 3) + 1;
                  const src = photos[i];
                  return (
                    <div
                      key={i}
                      className="aspect-square overflow-hidden rounded-[4px] bg-black/10"
                      style={{ gridColumn: col, gridRow: row }}
                    >
                      {src && (
                        <img
                          src={src}
                          alt={`moment ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              <p
                className="absolute bottom-3 left-0 right-0 text-center text-[10px] tracking-[0.2em] lowercase"
                style={{ color: frameFg[frameColor] }}
              >
                {timestamp} · moments
              </p>
            </div>

            {/* Color picker */}
            <div className="flex flex-col gap-3">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  onClick={() => onFrameColorChange?.(color.value)}
                  className={`w-6 h-6 rounded-full ${color.bg} transition-all duration-300 cursor-pointer ${
                    frameColor === color.value
                      ? `ring-2 ${color.ring} ring-offset-2 ring-offset-background scale-110`
                      : "opacity-60 hover:opacity-90"
                  }`}
                  aria-label={`Select ${color.value} frame`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Video preview */}
        {mode === "video" && videoUrl && (
          <div className="animate-gentle-fade">
            <video
              src={videoUrl}
              controls
              className="w-full rounded-sm shadow-lg shadow-polaroid-shadow/20"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-center gap-8">
          <button
            onClick={onRetake}
            className="text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors duration-500"
          >
            retake
          </button>
          <button
            onClick={mode === "photo" ? downloadStrip : downloadVideo}
            disabled={mode === "photo" ? !stripUrl : !videoUrl}
            className="text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors duration-500 disabled:opacity-30"
          >
            save
          </button>
        </div>

        <canvas ref={stripCanvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default ResultView;

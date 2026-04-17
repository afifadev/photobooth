import { useRef, useState, useEffect, useCallback } from "react";

interface SessionViewProps {
  onComplete: (photos: string[], video: Blob | null) => void;
  onBack: () => void;
}

const TOTAL_PHOTOS = 6;

const SessionView = ({ onComplete, onBack }: SessionViewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [status, setStatus] = useState<"init" | "denied" | "ready" | "countdown" | "flash" | "done">("init");
  const [countdown, setCountdown] = useState(3);
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoIndex, setPhotoIndex] = useState(0);

  // Start camera
  useEffect(() => {
    let mounted = true;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user", width: 640, height: 480 }, audio: false })
      .then((s) => {
        if (!mounted) { s.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          videoRef.current.onloadedmetadata = () => {
            if (mounted) setStatus("ready");
          };
        }
      })
      .catch(() => {
        if (mounted) setStatus("denied");
      });
    return () => {
      mounted = false;
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return null;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    // Capture non-mirrored
    const w = video.videoWidth;
    const h = video.videoHeight;
    const size = Math.min(w, h);
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const ox = (w - size) / 2;
    const oy = (h - size) / 2;
    ctx.drawImage(video, ox, oy, size, size, 0, 0, size, size);
    return canvas.toDataURL("image/jpeg", 0.92);
  }, []);

  const playClick = useCallback(() => {
    try {
      const ac = new AudioContext();
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.frequency.value = 1200;
      gain.gain.value = 0.08;
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.08);
      osc.stop(ac.currentTime + 0.1);
    } catch {}
  }, []);

  const startRecording = useCallback(() => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    try {
      const recorder = new MediaRecorder(streamRef.current, { mimeType: "video/webm" });
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.start();
      recorderRef.current = recorder;
    } catch {}
  }, []);

  const stopRecording = useCallback((): Blob | null => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
    if (chunksRef.current.length > 0) {
      return new Blob(chunksRef.current, { type: "video/webm" });
    }
    return null;
  }, []);

  // Run countdown + capture loop
  const runSession = useCallback(async () => {
    startRecording();
    const captured: string[] = [];

    for (let i = 0; i < TOTAL_PHOTOS; i++) {
      setPhotoIndex(i);
      // 3-second countdown
      for (let c = 3; c >= 1; c--) {
        setCountdown(c);
        setStatus("countdown");
        await new Promise(r => setTimeout(r, 1000));
      }

      // Flash + capture
      setStatus("flash");
      playClick();
      const data = capturePhoto();
      if (data) captured.push(data);
      await new Promise(r => setTimeout(r, 400));
    }

    setStatus("done");
    // Small delay then stop recording
    await new Promise(r => setTimeout(r, 300));
    const videoBlob = stopRecording();
    streamRef.current?.getTracks().forEach(t => t.stop());
    setPhotos(captured);
    onComplete(captured, videoBlob);
  }, [capturePhoto, playClick, startRecording, stopRecording, onComplete]);

  const frameBorderColor = "border-muted-foreground/30";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 animate-gentle-fade">
      <div className="w-full max-w-sm space-y-6">
        {/* Back button */}
        {status !== "countdown" && status !== "flash" && status !== "done" && (
          <button
            onClick={() => {
              streamRef.current?.getTracks().forEach(t => t.stop());
              onBack();
            }}
            className="text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors duration-500"
          >
            ← back
          </button>
        )}

        {/* Camera denied */}
        {status === "denied" && (
          <div className="text-center space-y-4 py-12">
            <p className="font-serif italic text-foreground/70 text-lg">
              we need your camera to capture moments
            </p>
            <p className="text-muted-foreground text-sm">
              please allow camera access in your browser settings and try again
            </p>
          </div>
        )}

        {/* Camera frame */}
        {status !== "denied" && (
          <div className={`border-4 ${frameBorderColor} p-1 relative transition-colors duration-500`}>
            <div className="aspect-square bg-muted relative overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
              <div className="absolute inset-0 film-overlay pointer-events-none" />

              {/* Flash overlay */}
              {status === "flash" && (
                <div className="absolute inset-0 bg-background/80 animate-slow-fade pointer-events-none" />
              )}

              {/* Countdown overlay */}
              {status === "countdown" && (
                <div className="absolute inset-0 flex items-center justify-center bg-foreground/10">
                  <span className="text-6xl font-serif text-background drop-shadow-lg animate-gentle-fade">
                    {countdown}
                  </span>
                </div>
              )}
            </div>

            {/* Photo counter */}
            {(status === "countdown" || status === "flash") && (
              <div className="absolute bottom-3 right-3 text-[10px] tracking-widest uppercase text-background/70 bg-foreground/30 px-2 py-1 rounded-sm">
                {photoIndex + 1} / {TOTAL_PHOTOS}
              </div>
            )}
          </div>
        )}

        {/* Photo thumbnails */}
        {photos.length > 0 && (
          <div className="flex gap-1 justify-center">
            {photos.map((p, i) => (
              <div key={i} className="w-10 h-10 overflow-hidden border border-border">
                <img src={p} alt={`photo ${i + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}

        {/* Start button */}
        {status === "ready" && (
          <div className="flex justify-center">
            <button
              onClick={runSession}
              className="group relative inline-flex items-center gap-2 text-sm tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors duration-700 cursor-pointer"
            >
              <span className="h-px w-6 bg-muted-foreground/40 group-hover:w-10 group-hover:bg-foreground/60 transition-all duration-700" />
              begin
              <span className="h-px w-6 bg-muted-foreground/40 group-hover:w-10 group-hover:bg-foreground/60 transition-all duration-700" />
            </button>
          </div>
        )}

        {status === "init" && (
          <p className="text-center text-muted-foreground/50 text-xs tracking-wider animate-pulse">
            preparing camera...
          </p>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default SessionView;

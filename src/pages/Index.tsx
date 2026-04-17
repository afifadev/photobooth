import { useState } from "react";
import Landing from "@/components/Landing";
import SessionView from "@/components/SessionView";
import ResultView from "@/components/ResultView";

export type FrameColor = "pink" | "black" | "navy" | "maroon";
type Phase = "landing" | "session" | "result";

const Index = () => {
  const [phase, setPhase] = useState<Phase>("landing");
  const [frameColor, setFrameColor] = useState<FrameColor>("pink");
  const [photos, setPhotos] = useState<string[]>([]);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);

  const handleSessionComplete = (capturedPhotos: string[], video: Blob | null) => {
    setPhotos(capturedPhotos);
    setVideoBlob(video);
    setPhase("result");
  };

  const handleRetake = () => {
    setPhotos([]);
    setVideoBlob(null);
    setPhase("landing");
  };

  return (
    <div className="relative min-h-screen">
      <div className="grain-overlay" />
      {phase === "landing" && (
        <Landing
          onStart={() => setPhase("session")}
        />
      )}
      {phase === "session" && (
        <SessionView
          onComplete={handleSessionComplete}
          onBack={handleRetake}
        />
      )}
      {phase === "result" && (
        <ResultView
          photos={photos}
          videoBlob={videoBlob}
          frameColor={frameColor}
          onFrameColorChange={setFrameColor}
          onRetake={handleRetake}
        />
      )}
    </div>
  );
};

export default Index;

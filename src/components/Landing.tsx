interface LandingProps {
  onStart: () => void;
}

const Landing = ({ onStart }: LandingProps) => {
  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden"
      style={{
        background:
          "linear-gradient(160deg, hsl(40 45% 96%) 0%, hsl(35 35% 92%) 45%, hsl(15 30% 88%) 100%)",
      }}
    >
      {/* Center light bloom behind title */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[44rem] h-[44rem] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle at center, hsl(40 60% 96% / 0.85), hsl(35 40% 92% / 0.4) 40%, transparent 70%)",
        }}
      />

      {/* Soft decorative gradient blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-32 w-[28rem] h-[28rem] rounded-full opacity-50 blur-3xl"
        style={{
          background:
            "radial-gradient(circle at center, hsl(var(--accent) / 0.7), transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -right-32 w-[32rem] h-[32rem] rounded-full opacity-45 blur-3xl"
        style={{
          background:
            "radial-gradient(circle at center, hsl(15 45% 85% / 0.85), transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/4 right-1/5 w-72 h-72 rounded-full opacity-35 blur-3xl"
        style={{
          background:
            "radial-gradient(circle at center, hsl(350 50% 88% / 0.7), transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-1/4 left-1/5 w-80 h-80 rounded-full opacity-30 blur-3xl"
        style={{
          background:
            "radial-gradient(circle at center, hsl(30 50% 90% / 0.8), transparent 70%)",
        }}
      />

      {/* Grain texture overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: "180px 180px",
        }}
      />

      {/* Soft vignette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 50%, hsl(20 20% 30% / 0.18) 100%)",
        }}
      />

      <main className="relative z-10 max-w-xl text-center animate-gentle-fade">
        <div className="space-y-16">
          <div className="space-y-8">
            <h1 className="font-serif text-foreground text-6xl md:text-8xl font-normal italic leading-none tracking-[-0.02em]">
              moments
            </h1>
            <div className="flex justify-center">
              <span className="h-px w-16 bg-foreground/20" />
            </div>
            <p className="font-serif italic text-muted-foreground text-lg md:text-xl font-light leading-relaxed tracking-wide">
              some moments feel
              <br />
              too soft to forget
            </p>
          </div>

          <div className="flex flex-col items-center gap-6">
            <div
              className="relative rounded-full p-[3px] backdrop-blur-md"
              style={{
                background:
                  "linear-gradient(135deg, hsl(var(--background) / 0.55), hsl(var(--background) / 0.15))",
                border: "1px solid hsl(var(--background) / 0.5)",
                boxShadow:
                  "0 8px 32px -8px hsl(var(--foreground) / 0.2), inset 0 1px 0 hsl(var(--background) / 0.6)",
              }}
            >
              <button
                onClick={onStart}
                className="group relative px-10 py-4 rounded-full bg-foreground/85 text-background text-sm tracking-[0.25em] lowercase font-light transition-all duration-700 ease-out hover:scale-[1.03] hover:bg-foreground hover:shadow-[0_8px_40px_-8px_hsl(var(--foreground)/0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30 focus-visible:ring-offset-4 focus-visible:ring-offset-background backdrop-blur-sm"
                style={{
                  boxShadow:
                    "0 4px 24px -8px hsl(var(--foreground) / 0.3), inset 0 1px 0 hsl(var(--background) / 0.18)",
                }}
              >
                <span
                  aria-hidden
                  className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-md"
                  style={{
                    background:
                      "radial-gradient(circle at center, hsl(var(--foreground) / 0.35), transparent 70%)",
                  }}
                />
                <span className="relative">begin your moment</span>
              </button>
            </div>

            <p className="text-muted-foreground/60 text-[11px] tracking-[0.3em] lowercase">
              a quiet place for your memories
            </p>
          </div>
        </div>
      </main>

      {/* Branding footer */}
      <footer className="absolute bottom-6 left-0 right-0 z-10 text-center">
        <p className="text-foreground/60 text-xs font-light tracking-wider lowercase">
          made with love, afifa
        </p>
      </footer>
    </div>
  );
};

export default Landing;

import { useEffect, useState } from 'react';

export default function SplashScreen({ onDone }: { onDone: () => void }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => setExiting(true), 1600);
    const doneTimer = setTimeout(onDone, 2000);
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, [onDone]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-950 transition-opacity duration-500 ${
        exiting ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="relative flex flex-col items-center">
        <div className="absolute h-32 w-32 rounded-full border-2 border-cyan-400/30 animate-pulse-ring" />
        <div className="absolute h-32 w-32 rounded-full border-2 border-cyan-400/20 animate-pulse-ring [animation-delay:0.5s]" />

        <div className="relative animate-scale-in text-center">
          <h1 className="text-5xl font-extrabold tracking-[0.3em] bg-gradient-to-r from-cyan-400 via-blue-500 to-teal-400 bg-clip-text text-transparent">
            TWINNEX
          </h1>
          <p className="mt-3 text-xs font-medium tracking-[0.15em] text-cyan-200/60">
            DIGITAL TWIN FOR OIL-WELL OPTIMIZATION
          </p>
          <p className="mt-1 text-[10px] tracking-wider text-slate-500">
            BAGHEWALA FIELD · CSS &amp; SRP OPERATIONS
          </p>
        </div>

        <div className="mt-8 h-1 w-48 overflow-hidden rounded-full bg-slate-800">
          <div className="h-full w-full origin-left rounded-full bg-gradient-to-r from-cyan-400 to-teal-400 animate-[shimmer_1.5s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  );
}

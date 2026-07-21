import { useEffect, useState } from "react";

interface SplashScreenProps {
  onFinish: () => void;
  duration?: number;
  loading?: boolean;
}

export function SplashScreen({ onFinish, duration = 2000, loading = false }: SplashScreenProps) {
  const [phase, setPhase] = useState<"in" | "visible" | "out">("in");
  const [timerDone, setTimerDone] = useState(false);

  useEffect(() => {
    const fadeInDuration = 600;
    const fadeOutDuration = 600;
    const visibleDuration = duration - fadeInDuration - fadeOutDuration;

    const toVisible = setTimeout(() => setPhase("visible"), fadeInDuration);
    const toOut = setTimeout(() => setPhase("out"), fadeInDuration + visibleDuration);
    const toFinish = setTimeout(() => setTimerDone(true), fadeInDuration + visibleDuration + fadeOutDuration);

    return () => {
      clearTimeout(toVisible);
      clearTimeout(toOut);
      clearTimeout(toFinish);
    };
  }, [duration]);

  useEffect(() => {
    if (timerDone && !loading) {
      onFinish();
    }
  }, [timerDone, loading, onFinish]);

  const opacity =
    phase === "in" ? "opacity-0 animate-[fadeIn_600ms_ease-in-out_forwards]"
    : phase === "out" ? "opacity-100 animate-[fadeOut_600ms_ease-in-out_forwards]"
    : "opacity-100";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <svg
        width="88"
        height="69"
        viewBox="0 0 344 269"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`transition-opacity ${opacity}`}
        aria-label="AprovIA"
        role="img"
      >
        <path
          d="M122.5 23.3542L26.0144 211.249L0 269H51.2158L157.712 57.5168C164.758 44.0131 168.852 44.0014 176.41 57.5168L211.367 126.656L248.763 88.4259L217.058 23.3542C175.435 -18.9425 136.591 5.73056 122.5 23.3542Z"
          fill="#7409F4"
          className="origin-center animate-[splashMarkIn_700ms_cubic-bezier(0.22,1,0.36,1)_forwards]"
          style={{ opacity: 0, transform: "scale(0.85)" }}
        />
        <path
          d="M243.885 189.287L281.281 151.057L339 268.187H281.281L243.885 189.287Z"
          fill="#7409F4"
          className="origin-center animate-[splashMarkIn_700ms_cubic-bezier(0.22,1,0.36,1)_100ms_forwards]"
          style={{ opacity: 0, transform: "scale(0.85)" }}
        />
        <path
          d="M129.329 146.14L109 182.767L170.799 243L344 68H288.706L170.799 186.837L129.329 146.14Z"
          fill="#08DA81"
          className="origin-center animate-[splashCheckDraw_450ms_cubic-bezier(0.22,1,0.36,1)_400ms_forwards]"
          style={{ opacity: 0, transform: "scale(0.6)" }}
        />
      </svg>
    </div>
  );
}

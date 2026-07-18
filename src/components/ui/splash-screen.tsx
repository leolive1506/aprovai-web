import { useEffect, useState } from "react";
import Logo from "@/assets/aprovai.svg";

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
      <img
        src={Logo}
        alt="Logo"
        className={`w-72 sm:w-96 transition-opacity ${opacity}`}
      />
    </div>
  );
}

// components/Timer.tsx
import React, { useEffect, useRef, useState } from "react";

interface TimerProps {
  /** Neçə dəqiqəlik taymer başlayır */
  minutes: number;
  /** Taymer bitəndə çağırılacaq funksiya (məsələn, səs çalma) */
  onFinish?: () => void;
  /** Xaricdən "reset" siqnalı gələndə təzədən başlayır */
  resetSignal: number;
}

const Timer: React.FC<TimerProps> = ({ minutes, onFinish, resetSignal }) => {
  // qalan saniyələri saxlayırıq
  const initialSeconds = minutes * 60;
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // əgər "resetSignal" dəyişirsə, taymeri sıfırla
  useEffect(() => {
    setSecondsLeft(initialSeconds);
    clearInterval(intervalRef.current as NodeJS.Timeout);
    intervalRef.current = null;
  }, [resetSignal, initialSeconds]);

  // taymerin işə düşməsi
  useEffect(() => {
    if (intervalRef.current) return; // artıq işləyirsə, yenisini yaratma

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev === 1) {
          clearInterval(intervalRef.current as NodeJS.Timeout);
          intervalRef.current = null;
          onFinish?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // unmount olanda təmizləyək
    return () => clearInterval(intervalRef.current as NodeJS.Timeout);
  }, [onFinish]);

  // dəqiqə:saniyə formatına çevirmək
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  return (
    <div className="times w-full mt-10">
      <div className="flex flex-col sm:flex-row justify-center items-center text-center gap-6">
        <div className="flex flex-col items-center">
          <span className="text-6xl md:text-9xl text-amber-200">{mm}</span>
          <span className="text-gray-400 text-sm">Minutes</span>
        </div>
        <div className="text-6xl md:text-9xl text-gray-400">:</div>
        <div className="flex flex-col items-center">
          <span className="text-6xl md:text-9xl text-amber-200">{ss}</span>
          <span className="text-gray-400 text-sm">Seconds</span>
        </div>
      </div>
    </div>
  );
};

export default Timer;

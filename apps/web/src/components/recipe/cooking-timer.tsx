// Tag: core
// Path: apps/web/src/components/recipe/cooking-timer.tsx

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, X, Settings } from "lucide-react";

export interface ActiveTimer {
  stepOrder: number;
  totalSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
}

interface CookingTimerProps {
  timer: ActiveTimer;
  label: string;
  onUpdate: (updated: ActiveTimer) => void;
  onRemove: () => void;
  onNavigate?: () => void;
  compact?: boolean;
  doneLabel: string;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function playAlarmSound() {
  try {
    const ctx = new AudioContext();
    const playBeep = (time: number, freq: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.3, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.3);
      osc.start(time);
      osc.stop(time + 0.3);
    };
    playBeep(ctx.currentTime, 880);
    playBeep(ctx.currentTime + 0.4, 880);
    playBeep(ctx.currentTime + 0.8, 1100);
    // last beep ends at currentTime + 0.8 + 0.3 = +1.1s; close with margin
    setTimeout(() => ctx.close(), 1200);
  } catch {
    // AudioContext 미지원 환경 무시
  }
}

/* ── Scroll Column (CSS snap time picker) ── */
export function ScrollColumn({
  value,
  onChange,
  max,
}: {
  value: number;
  onChange: (v: number) => void;
  max: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const programmaticRef = useRef(false);

  useEffect(() => {
    if (ref.current) {
      programmaticRef.current = true;
      ref.current.scrollTop = value * 40;
      setTimeout(() => {
        programmaticRef.current = false;
      }, 100);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleScroll = useCallback(() => {
    if (programmaticRef.current) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (!ref.current) return;
      const selected = Math.round(ref.current.scrollTop / 40);
      const clamped = Math.max(0, Math.min(max, selected));
      onChange(clamped);
    }, 80);
  }, [max, onChange]);

  return (
    <div className="relative h-[120px] w-20">
      <div
        ref={ref}
        onScroll={handleScroll}
        className="h-full overflow-y-auto"
        style={{
          scrollSnapType: "y mandatory",
          scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch",
          maskImage:
            "linear-gradient(to bottom, transparent 0%, black 33%, black 66%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, black 33%, black 66%, transparent 100%)",
        }}
      >
        <div style={{ height: 40 }} />
        {Array.from({ length: max + 1 }, (_, i) => (
          <div
            key={i}
            className={`flex items-center justify-center font-mono transition-all ${
              i === value
                ? "text-2xl font-bold text-foreground"
                : "text-base text-muted-foreground/30"
            }`}
            style={{ height: 40, scrollSnapAlign: "center" }}
          >
            {String(i).padStart(2, "0")}
          </div>
        ))}
        <div style={{ height: 40 }} />
      </div>
    </div>
  );
}

export function CookingTimer({
  timer,
  label,
  onUpdate,
  onRemove,
  onNavigate,
  compact = false,
  doneLabel,
}: CookingTimerProps) {
  const t = useTranslations("cookingMode");
  const timerRef = useRef(timer);
  const onUpdateRef = useRef(onUpdate);
  const alarmPlayedRef = useRef(false);

  const [expanded, setExpanded] = useState(false);
  const [pickerMin, setPickerMin] = useState(Math.floor(timer.totalSeconds / 60));
  const [pickerSec, setPickerSec] = useState(timer.totalSeconds % 60);

  useEffect(() => {
    timerRef.current = timer;
  });
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  });

  useEffect(() => {
    if (timer.remainingSeconds === 0 && !alarmPlayedRef.current) {
      alarmPlayedRef.current = true;
      playAlarmSound();
    }
    if (timer.remainingSeconds > 0) {
      alarmPlayedRef.current = false;
    }
  }, [timer.remainingSeconds]);

  useEffect(() => {
    if (!timer.isRunning || timer.remainingSeconds === 0) return;
    const id = setInterval(() => {
      const t = timerRef.current;
      onUpdateRef.current({
        ...t,
        remainingSeconds: Math.max(0, t.remainingSeconds - 1),
        isRunning: t.remainingSeconds - 1 > 0,
      });
    }, 1000);
    return () => clearInterval(id);
  }, [timer.isRunning]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleRunning = () => {
    onUpdate({ ...timer, isRunning: !timer.isRunning });
  };

  const reset = () => {
    onUpdate({
      ...timer,
      remainingSeconds: timer.totalSeconds,
      isRunning: false,
    });
  };

  const applyTime = () => {
    const newTotal = pickerMin * 60 + pickerSec;
    if (newTotal > 0) {
      onUpdate({
        ...timer,
        totalSeconds: newTotal,
        remainingSeconds: newTotal,
        isRunning: false,
      });
      setExpanded(false);
    }
  };

  const isDone = timer.remainingSeconds === 0;
  const progress = 1 - timer.remainingSeconds / timer.totalSeconds;

  if (compact) {
    return (
      <button
        type="button"
        onClick={onNavigate}
        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
          isDone ? "animate-pulse bg-red-100 text-red-700" : "bg-muted hover:bg-muted/80"
        } ${onNavigate ? "cursor-pointer" : ""}`}
      >
        <span className="font-medium">{label}</span>
        <span className="font-mono">{isDone ? doneLabel : formatTime(timer.remainingSeconds)}</span>
      </button>
    );
  }

  return (
    <div
      className={`rounded-xl border p-4 ${
        isDone ? "animate-pulse border-red-300 bg-red-50" : "bg-white"
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <button
          onClick={onRemove}
          className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Remove timer"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mb-3 text-center font-mono text-3xl font-bold tabular-nums">
        {isDone ? doneLabel : formatTime(timer.remainingSeconds)}
      </div>

      {/* Progress bar */}
      <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all ${
            isDone ? "bg-red-500" : "bg-matdam-gold"
          }`}
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Controls: icon-only buttons */}
      <div className="flex items-center gap-2">
        {!isDone && (
          <Button
            size="icon"
            variant="outline"
            onClick={toggleRunning}
            className="h-8 w-8"
            aria-label={timer.isRunning ? "Pause" : "Resume"}
          >
            {timer.isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
        )}
        <Button size="icon" variant="ghost" onClick={reset} className="h-8 w-8" aria-label="Reset">
          <RotateCcw className="h-4 w-4" />
        </Button>
        <div className="flex-1" />
        <Button
          size="icon"
          variant="ghost"
          onClick={() => {
            setPickerMin(Math.floor(timer.totalSeconds / 60));
            setPickerSec(timer.totalSeconds % 60);
            setExpanded(!expanded);
          }}
          disabled={timer.isRunning}
          className="h-8 w-8"
          aria-label={t("adjustTime")}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {/* Expanded: scroll time picker */}
      {expanded && (
        <div className="mt-3 rounded-lg border bg-muted/30 p-3">
          <div className="flex items-center justify-center gap-2">
            <ScrollColumn value={pickerMin} onChange={setPickerMin} max={59} />
            <span className="text-xl font-bold">:</span>
            <ScrollColumn value={pickerSec} onChange={setPickerSec} max={59} />
          </div>
          <Button size="sm" onClick={applyTime} className="mt-2 w-full">
            {t("apply")}
          </Button>
        </div>
      )}
    </div>
  );
}

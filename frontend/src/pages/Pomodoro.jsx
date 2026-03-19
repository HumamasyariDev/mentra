import React, { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pomodoroApi, taskApi } from "../services/api";
import {
  Play,
  Pause,
  Square,
  Loader2,
  Palette,
  ChevronDown,
  Droplets,
  Clock,
  CheckCircle,
  Sprout,
} from "lucide-react";
import { usePomodoroTheme } from "../contexts/PomodoroThemeContext";

import kranAirImg from "../assets/gameworld/kran_air-2.png";
import wateringCanImg from "../assets/gameworld/watering_can.png";
import "./Pomodoro.css";
import "../styles/pages/Pomodoro.css";

/** Inline SVG tetes air — no image load, langsung render (fix bug tetes baru muncul di hitungan ke-3) */
const WaterDropSvg = ({ className, style, idSuffix = "0" }) => (
  <svg
    className={className}
    style={{ width: "100%", height: "100%", ...style }}
    viewBox="0 0 32 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid meet"
    aria-hidden
  >
    <path
      d="M16 2c0 0-12 14-12 22a12 12 0 0 0 24 0C28 16 16 2 16 2z"
      fill={`url(#pom-drop-grad-${idSuffix})`}
      stroke="rgba(100,150,200,0.4)"
      strokeWidth="0.5"
    />
    <defs>
      <linearGradient id={`pom-drop-grad-${idSuffix}`} x1="8" y1="2" x2="24" y2="24" gradientUnits="userSpaceOnUse">
        <stop stopColor="#93c5fd" />
        <stop offset="0.5" stopColor="#60a5fa" />
        <stop offset="1" stopColor="#3b82f6" />
      </linearGradient>
    </defs>
  </svg>
);

const plantMoods = {
  idle: { label: "Waiting for water...", scale: "scale-100" },
  focusing: { label: "Watering in progress...", scale: "scale-105" },
  paused: { label: "Tap is closed...", scale: "scale-100" },
  completed: { label: "Plant is happy & fully watered!", scale: "scale-110" },
};

export default function Pomodoro() {
  const queryClient = useQueryClient();
  const { theme, setTheme, backgrounds } = usePomodoroTheme();
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [duration, setDuration] = useState(25);
  const [selectedTask, setSelectedTask] = useState("");
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [waterState, setWaterState] = useState("idle");
  const [cansEarned, setCansEarned] = useState(null);
  const [animState, setAnimState] = useState(null); // "paused" | "resumed" | "stopped"
  const [skipSceneMorph, setSkipSceneMorph] = useState(false); // true saat recovery — scene langsung kotak, no morph
  const intervalRef = useRef(null);

  const isDark = theme.dark;

  const { data: stats } = useQuery({
    queryKey: ["pomodoro-stats"],
    queryFn: () => pomodoroApi.stats().then((r) => r.data),
  });

  const { data: tasks } = useQuery({
    queryKey: ["tasks", "pending"],
    queryFn: () =>
      taskApi.list({ status: "pending", per_page: 50 }).then((r) => r.data),
  });

  const { data: history } = useQuery({
    queryKey: ["pomodoro-history"],
    queryFn: () => pomodoroApi.list({ per_page: 5 }).then((r) => r.data),
  });

  const startMutation = useMutation({
    mutationFn: (data) => pomodoroApi.start(data),
    onSuccess: (res) => {
      setSessionId(res.data.id);
      setIsRunning(true);
      setWaterState("focusing");
    },
  });

  const completeMutation = useMutation({
    mutationFn: (id) => pomodoroApi.complete(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["pomodoro-stats"] });
      queryClient.invalidateQueries({ queryKey: ["pomodoro-history"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["forest"] });
      setWaterState("completed");
      // Store watering cans earned from response
      if (res.data?.cans_awarded) {
        setCansEarned(res.data.cans_awarded);
      }
      setTimeout(() => {
        resetTimer();
        setWaterState("idle");
        setCansEarned(null);
      }, 3000);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id) => pomodoroApi.cancel(id),
    onSuccess: () => {
      resetTimer();
      setWaterState("idle");
    },
  });

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setSessionId(null);
    setTimeLeft(duration * 60);
    setSkipSceneMorph(false); // reset agar next start dapat morph
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, [duration]);

  // Preload scene assets (kran, teko) — tetes pakai inline SVG, no preload needed
  useEffect(() => {
    [kranAirImg, wateringCanImg].forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // On mount: detect & recover any active session from the server
  // This prevents the "Please complete or cancel" 422 error
  useEffect(() => {
    pomodoroApi
      .list({ status: "running", per_page: 1 })
      .then((res) => {
        const active = res.data?.data?.[0];
        if (active && ["running", "paused"].includes(active.status)) {
          const dur = active.duration_minutes ?? 25;
          // Compute how many seconds have elapsed since the session started
          const elapsedSec = Math.floor(
            (Date.now() - new Date(active.started_at).getTime()) / 1000,
          );
          const remaining = Math.max(0, dur * 60 - elapsedSec);
          setSessionId(active.id);
          setDuration(dur);
          setTimeLeft(remaining);
          const running = active.status === "running";
          setIsRunning(running);
          setWaterState(running ? "focusing" : "paused");
          setSkipSceneMorph(true); // sudah mulai — scene langsung kotak, jangan morph lagi
        }
      })
      .catch(() => {
        /* no active session or network error — stay in idle */
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check for pending animation on mount (when user returns to page)
  useEffect(() => {
    console.log('[POMODORO] 🔄 Component mounted - checking for pending animation...');
    const pendingAnimStr = localStorage.getItem('pom-pending-anim');
    console.log('[POMODORO] 📦 localStorage value:', pendingAnimStr);
    
    if (pendingAnimStr) {
      try {
        const { type, timestamp } = JSON.parse(pendingAnimStr);
        const elapsed = Date.now() - timestamp;
        console.log(`[POMODORO] ⏱️ Animation data found: type="${type}", elapsed=${elapsed}ms`);
        
        // Only trigger if animation was set within last 30 seconds
        if (elapsed < 30000) {
          console.log(`[POMODORO] ✅ Triggering animation: ${type}`);
          setAnimState(type);
          const duration = type === 'stopped' ? 600 : 450;
          setTimeout(() => {
            console.log('[POMODORO] 🧹 Clearing animation state');
            setAnimState(null);
          }, duration);
        } else {
          console.log(`[POMODORO] ⏰ Animation expired (${elapsed}ms > 30000ms)`);
        }
        // Clear the pending animation
        localStorage.removeItem('pom-pending-anim');
        console.log('[POMODORO] 🗑️ Cleared localStorage');
      } catch (e) {
        console.error('[POMODORO] ❌ Error parsing animation data:', e);
        localStorage.removeItem('pom-pending-anim');
      }
    } else {
      console.log('[POMODORO] ℹ️ No pending animation found');
    }
  }, []);

  // Timer countdown
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && sessionId) {
      completeMutation.mutate(sessionId);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft, sessionId, completeMutation]);

  useEffect(() => {
    if (!isRunning && !sessionId) {
      setTimeLeft(duration * 60);
    }
  }, [duration, isRunning, sessionId]);

  const handleBgChange = (key) => {
    setTheme(key);
    setShowBgPicker(false);
  };

  const handleStart = () => {
    startMutation.mutate({
      duration_minutes: duration,
      task_id: selectedTask || undefined,
    });
  };

  const handleStop = () => {
    if (sessionId) {
      // Dispatch event untuk trigger animasi di component lain
      window.dispatchEvent(new CustomEvent('pomodoro:stopped'));
      setAnimState("stopped");
      const animData = { type: 'stopped', timestamp: Date.now() };
      localStorage.setItem('pom-pending-anim', JSON.stringify(animData));
      console.log('[POMODORO] 🛑 Stop clicked - saved to localStorage:', animData);
      setTimeout(() => setAnimState(null), 600);
      cancelMutation.mutate(sessionId);
    }
  };

  const handlePauseResume = () => {
    const next = !isRunning;
    const animType = next ? "resumed" : "paused";
    // Dispatch event untuk trigger animasi di component lain
    window.dispatchEvent(new CustomEvent(`pomodoro:${animType}`));
    setAnimState(animType);
    const animData = { type: animType, timestamp: Date.now() };
    localStorage.setItem('pom-pending-anim', JSON.stringify(animData));
    console.log(`[POMODORO] ${next ? '▶️' : '⏸️'} ${next ? 'Resume' : 'Pause'} clicked - saved to localStorage:`, animData);
    setTimeout(() => setAnimState(null), 450);
    setIsRunning(next);
    setWaterState(next ? "focusing" : "paused");
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const totalSeconds = duration * 60;
  const elapsedSeconds = isRunning ? Math.max(0, totalSeconds - timeLeft) : 0;
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;
  const mood = plantMoods[waterState];
  const waterProgress = Math.min(100, progress);

  return (
    // Full page theme wrapper - uses full width, minimal gap from sidebar
    <div
      className={`min-h-screen -mx-4 -mt-4 -mb-4 lg:-mx-6 lg:-mt-6 lg:-mb-6 p-4 lg:p-6 bg-gradient-to-br ${theme.gradient} transition-colors duration-300`}
    >
      {/* Full-width container */}
      <div className="w-full max-w-full space-y-6">
        {/* Header */}
        <div className="pomodoro-header">
          <div>
            <h1
              className={`pom-header-title text-2xl font-bold tracking-tight ${isDark ? "text-white" : theme.accent}`}
            >
              Pomodoro
            </h1>
            <p
              className={`pom-header-sub text-sm mt-1 font-medium ${isDark ? "text-white/60" : "text-slate-600"}`}
            >
              Water your plants by staying focused
            </p>
          </div>
          {/* Theme picker */}
          <div className="pomodoro-theme-picker">
            <button
              onClick={() => setShowBgPicker(!showBgPicker)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                isDark
                  ? "bg-white/10 text-white hover:bg-white/20"
                  : "bg-white/50 backdrop-blur-sm border border-white/50 text-slate-700 hover:bg-white/70"
              }`}
            >
              <Palette style={{ width: "1rem", height: "1rem" }} />
              <span className="pomodoro-theme-label">{theme.label}</span>
              <ChevronDown style={{ width: "0.75rem", height: "0.75rem" }} />
            </button>
            {showBgPicker && (
              <div className="pomodoro-theme-dropdown">
                {backgrounds.map((b) => (
                  <button
                    key={b.key}
                    onClick={() => handleBgChange(b.key)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      theme.key === b.key
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full bg-gradient-to-br ${b.gradient} border border-slate-200`}
                    />
                    {b.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bento Grid Layout - 3 Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card 1: Main Timer Card - Prominent Centerpiece (spans 2 rows on large screens) */}
          <div className="lg:col-span-2 lg:row-span-2">
            <div
              className={`rounded-2xl ${isDark ? "bg-white/5 backdrop-blur-md shadow-2xl" : "bg-white/50 backdrop-blur-md shadow-xl"} p-6 md:p-8 relative overflow-hidden border ${isDark ? "border-white/10" : "border-white/60"} transition-all duration-500 hover:shadow-2xl ${isDark ? "hover:bg-white/[0.07]" : "hover:bg-white/60"} h-full`}
            >
              {/* Watering Scene */}
              <div className="text-center mb-6">
                {/* Water progress */}
                <div className="pom-water-progress-row mb-4">
                  <Droplets
                    className={`w-4 h-4 shrink-0 block ${isDark ? "text-cyan-400/80" : "text-cyan-500"}`}
                  />
                  <div
                    className={`flex-1 max-w-[200px] h-2 rounded-full ${isDark ? "bg-white/10" : "bg-black/5"} overflow-hidden flex items-center min-w-0`}
                  >
                    <div
                      className="pom-progress-fill h-full min-w-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full"
                      style={{ width: `${waterProgress}%` }}
                    />
                  </div>
                  <span
                    className={`text-xs font-medium tabular-nums min-w-[2.25rem] text-right leading-none shrink-0 ${isDark ? "text-white/50" : "text-slate-400"}`}
                  >
                    {Math.round(waterProgress)}%
                  </span>
                </div>

                {/* Watering Animation Scene — smooth morph circle ↔ rounded rect */}
                <div
                  className={`pom-scene ${isRunning ? "pom-scene-running" : "pom-scene-idle"} ${skipSceneMorph ? "pom-scene-skip-morph" : ""}`}
                >
                  {/* Kran Air — centered in idle, positioned for drops when running */}
                  <div
                    className="pom-scene-kran flex-shrink-0 z-10 drop-shadow-md"
                    style={{
                      alignSelf: "center",
                      marginLeft: isRunning ? "8rem" : "0",
                      marginTop: isRunning ? "-60px" : "0",
                      paddingTop: isRunning ? "1rem" : "0",
                    }}
                  >
                    <img
                      src={kranAirImg}
                      alt="Kran Air"
                      className={`object-contain ${!skipSceneMorph ? "transition-all duration-700" : ""} ${isRunning ? "w-50 h-50" : "w-32 h-32"}`}
                    />
                  </div>

                  {/* ── WATER DROPS ──────────────────────────────────────────
                   * Absolutely positioned relative to the scene container.
                   * top: 18%  → sits just below the kran spout mouth
                   * left: calc(50% - 1rem + 12px) → center tetes di bawah mulut kran
                   * Each img starts at the same point and animates downward
                   * via @keyframes pom-fall defined in Pomodoro.css
                   * ─────────────────────────────────────────────────────── */}
                  {isRunning && (
                    <div
                      key={sessionId ?? "drops"}
                      className="pom-drops-container"
                      style={{
                        position: "absolute",
                        inset: 0,
                        pointerEvents: "none",
                      }}
                    >
                      {/* 3 tetes — staggered animation tanpa delay, langsung jatuh smooth */}
                      <div
                        key="drop-1"
                        className="pom-drop-single"
                        style={{
                          position: "absolute",
                          width: "2rem",
                          height: "2.5rem",
                          top: "18%",
                          left: "calc(50% - 1rem + 12px)",
                          zIndex: 32,
                          animationDelay: `${-((elapsedSeconds % 3) * 1000)}ms`,
                        }}
                      >
                        <WaterDropSvg idSuffix="1" className="w-full h-full" style={{ display: "block" }} />
                      </div>
                      <div
                        key="drop-2"
                        className="pom-drop-single"
                        style={{
                          position: "absolute",
                          width: "2rem",
                          height: "2.5rem",
                          top: "18%",
                          left: "calc(50% - 1rem + 12px)",
                          zIndex: 31,
                          animationDelay: `${-(((elapsedSeconds - 1 + 3) % 3) * 1000)}ms`,
                        }}
                      >
                        <WaterDropSvg idSuffix="2" className="w-full h-full" style={{ display: "block" }} />
                      </div>
                      <div
                        key="drop-3"
                        className="pom-drop-single"
                        style={{
                          position: "absolute",
                          width: "2rem",
                          height: "2.5rem",
                          top: "18%",
                          left: "calc(50% - 1rem + 12px)",
                          zIndex: 30,
                          animationDelay: `${-(((elapsedSeconds - 2 + 3) % 3) * 1000)}ms`,
                        }}
                      >
                        <WaterDropSvg idSuffix="3" className="w-full h-full" style={{ display: "block" }} />
                      </div>
                    </div>
                  )}

                  {/* Spacer pushes watering can to bottom */}
                  {isRunning && <div className="flex-1" />}

                  {/* Watering Can — bounces when drop lands */}
                  <div
                    className={`pom-scene-can flex-shrink-0 z-10 pb-4 ${isRunning ? "pom-can-bounce" : "absolute bottom-0"}`}
                  >
                    <img
                      src={wateringCanImg}
                      alt="Watering Can"
                      className={`object-contain drop-shadow-xl ${!skipSceneMorph ? "transition-all duration-700" : ""} ${isRunning ? "w-36 h-36" : "w-24 h-24"}`}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <span
                    className={`pom-status-sub text-sm font-medium ${isDark ? "text-white/70" : "text-slate-500"}`}
                  >
                    {mood.label}
                  </span>
                </div>
              </div>

              {/* Timer */}
              <div className="text-center mb-6">
                <p
                  className={`pom-timer-display text-6xl md:text-7xl font-mono font-bold tracking-wider transition-all duration-300 ${isDark ? "text-white drop-shadow-lg" : "text-slate-800"} ${isRunning ? "scale-105" : "scale-100"} ${animState === "paused" ? "pom-paused" : ""} ${animState === "stopped" ? "pom-stopped" : ""}`}
                >
                  {String(minutes).padStart(2, "0")}:
                  {String(seconds).padStart(2, "0")}
                </p>
                <p className={`pom-status-label mt-3 ${isDark ? "text-white/90" : "text-slate-700"}`}>
                  {sessionId
                    ? isRunning
                      ? "Watering in progress..."
                      : "Paused — tap is closed"
                    : "Start to water your plants"}
                </p>
              </div>

              {/* Duration selector */}
              {!sessionId && (
                <div className="pom-setup-block">
                  <div className="pom-duration-row">
                    {[15, 25, 45, 60].map((d) => (
                      <button
                        key={d}
                        onClick={() => setDuration(d)}
                        className={`pom-duration-btn ${duration === d ? "pom-duration-btn-active" : ""} ${
                          duration === d
                            ? isDark
                              ? "bg-white/20 text-white ring-2 ring-white/30"
                              : "bg-white text-slate-800 ring-2 ring-indigo-200/60"
                            : isDark
                              ? "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80"
                              : "bg-white/40 text-slate-600 hover:bg-white/60 hover:text-slate-800"
                        }`}
                      >
                        {d}m
                      </button>
                    ))}
                  </div>

                  <div className="pom-custom-row">
                    <span className={`pom-custom-label ${isDark ? "text-white/60" : "text-slate-500"}`}>
                      or custom
                    </span>
                    <input
                      type="number"
                      min="1"
                      max="120"
                      placeholder="30"
                      value={duration}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val) && val >= 1 && val <= 120) {
                          setDuration(val);
                        }
                      }}
                      className={`pom-custom-input ${
                        isDark ? "bg-white/10 text-white" : "bg-white/60 text-slate-800"
                      }`}
                    />
                    <span className={`pom-custom-unit ${isDark ? "text-white/60" : "text-slate-500"}`}>
                      min
                    </span>
                  </div>

                  <div className="pom-task-row">
                    <select
                      className={`pom-task-select ${
                        isDark ? "bg-white/10 text-white" : "bg-white/60 text-slate-700"
                      }`}
                      value={selectedTask}
                      onChange={(e) => setSelectedTask(e.target.value)}
                    >
                      <option value="">No task linked</option>
                      {tasks?.data?.map((task) => (
                        <option key={task.id} value={task.id}>
                          {task.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Controls */}
              <div className="pomodoro-controls">
                {!sessionId ? (
                  <button
                    onClick={handleStart}
                    className={`pom-start-btn bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/25 ${
                      isDark ? "hover:shadow-indigo-400/20" : ""
                    }`}
                    disabled={startMutation.isPending}
                  >
                    {startMutation.isPending ? (
                      <Loader2
                        className="pomodoro-loading-spinner"
                        style={{ width: "1.25rem", height: "1.25rem" }}
                      />
                    ) : (
                      <Play style={{ width: "1.25rem", height: "1.25rem" }} />
                    )}
                    Water Plants
                  </button>
                ) : waterState === "completed" ? (
                  <div
                    className={`px-6 py-3 rounded-xl font-semibold animate-pulse ${isDark ? "bg-emerald-500/20 text-emerald-300 shadow-lg shadow-emerald-500/20" : "bg-emerald-100 text-emerald-700 shadow-lg shadow-emerald-500/10"}`}
                  >
                    <div className="flex items-center gap-2 justify-center">
                      <span>Plant is happy! +EXP earned</span>
                      {cansEarned > 0 && (
                        <span className="flex items-center gap-1 ml-2 px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                          <Sprout className="w-4 h-4" />
                          +{cansEarned} cans
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={handlePauseResume}
                      className={`pom-btn-pause ${animState === "paused" ? "pom-just-paused" : ""} ${animState === "resumed" ? "pom-just-resumed" : ""} ${isDark ? "bg-white/10 text-white hover:bg-white/20 shadow-md hover:shadow-lg" : "bg-white text-slate-700 hover:bg-slate-50 shadow-md hover:shadow-xl"}`}
                    >
                      {isRunning ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5" />
                      )}
                      {isRunning ? "Pause" : "Resume"}
                    </button>
                    <button
                      onClick={handleStop}
                      className={`pom-btn-stop ${animState === "stopped" ? "pom-just-stopped" : ""} bg-red-500/10 text-red-500 hover:bg-red-500/20 shadow-md hover:shadow-lg`}
                    >
                      <Square style={{ width: "1.25rem", height: "1.25rem" }} />
                      Stop
                    </button>
                  </>
                )}

                {/* Debug button - dev only */}
                {import.meta.env.DEV && sessionId && waterState !== "completed" && (
                  <button
                    onClick={() => completeMutation.mutate(sessionId)}
                    className="ml-2 px-3 py-2 rounded-lg bg-orange-500/20 text-orange-500 text-xs font-mono hover:bg-orange-500/30 transition-colors"
                    disabled={completeMutation.isPending}
                  >
                    [DEV] Complete
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Card 2: Stats Card - Top Right */}
          {stats && (
            <div className="lg:col-span-1">
              <div
                className={`rounded-2xl p-6 space-y-4 transition-all duration-300 hover:shadow-lg ${isDark ? "bg-white/5 backdrop-blur-md border border-white/10 shadow-md" : "bg-white/50 backdrop-blur-md border border-white/60 shadow-md"} h-full`}
              >
                <h3
                  className={`font-semibold text-sm ${isDark ? "text-white" : "text-slate-900"}`}
                >
                  Today's Progress
                </h3>
                <div className="space-y-3">
                  <div
                    className={`flex items-center justify-between p-3 rounded-lg ${isDark ? "bg-white/5" : "bg-white/50"}`}
                  >
                    <div className="flex items-center gap-2">
                      <Clock
                        className={`w-4 h-4 ${isDark ? "text-indigo-400" : "text-indigo-600"}`}
                      />
                      <span
                        className={`text-xs ${isDark ? "text-white/70" : "text-slate-600"}`}
                      >
                        Today Sessions
                      </span>
                    </div>
                    <span
                      className={`text-lg font-bold ${isDark ? "text-indigo-400" : "text-indigo-600"}`}
                    >
                      {stats.today_sessions}
                    </span>
                  </div>
                  <div
                    className={`flex items-center justify-between p-3 rounded-lg ${isDark ? "bg-white/5" : "bg-white/50"}`}
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle
                        className={`w-4 h-4 ${isDark ? "text-emerald-400" : "text-emerald-600"}`}
                      />
                      <span
                        className={`text-xs ${isDark ? "text-white/70" : "text-slate-600"}`}
                      >
                        Total Focus
                      </span>
                    </div>
                    <span
                      className={`text-lg font-bold ${isDark ? "text-emerald-400" : "text-emerald-600"}`}
                    >
                      {stats.total_focus_minutes}m
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Card 3: Recent Sessions - Bottom Right */}
          {history?.data?.length > 0 && (
            <div className="lg:col-span-1">
              <div
                className={`rounded-2xl p-6 transition-all duration-300 hover:shadow-lg ${isDark ? "bg-white/5 backdrop-blur-md border border-white/10 shadow-md" : "bg-white/50 backdrop-blur-md border border-white/60 shadow-md"} h-full`}
              >
                <h3
                  className={`font-semibold mb-3 text-sm ${isDark ? "text-white" : "text-slate-900"}`}
                >
                  Recent Sessions
                </h3>
                <div className="space-y-2">
                  {history.data.map((session) => (
                    <div
                      key={session.id}
                      className={`flex items-center justify-between py-2 border-b last:border-0 ${isDark ? "border-white/10" : "border-slate-100"}`}
                    >
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-xs font-medium truncate ${isDark ? "text-white/80" : "text-slate-700"}`}
                        >
                          {session.task?.title || "No task"}
                        </p>
                        <p
                          className={`text-[10px] ${isDark ? "text-white/40" : "text-slate-400"}`}
                        >
                          {session.duration_minutes}min ·{" "}
                          {new Date(session.created_at).toLocaleDateString(
                            undefined,
                            { month: "short", day: "numeric" },
                          )}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ml-2 ${
                          session.status === "completed"
                            ? isDark
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-emerald-100 text-emerald-700"
                            : session.status === "cancelled"
                              ? isDark
                                ? "bg-red-500/20 text-red-400"
                                : "bg-red-100 text-red-700"
                              : isDark
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {session.status === "completed"
                          ? "✓"
                          : session.status === "cancelled"
                            ? "×"
                            : "..."}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

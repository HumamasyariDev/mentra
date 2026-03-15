import { useState, useEffect, useRef, useCallback } from "react";
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
} from "lucide-react";
import { usePomodoroTheme } from "../contexts/PomodoroThemeContext";

import kranAirImg from "../assets/gameworld/kran_air-2.png";
import wateringCanImg from "../assets/gameworld/watering_can.png";
import waterDropImg from "../assets/gameworld/water_drop.png";
import "./Pomodoro.css";

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pomodoro-stats"] });
      queryClient.invalidateQueries({ queryKey: ["pomodoro-history"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      setWaterState("completed");
      setTimeout(() => {
        resetTimer();
        setWaterState("idle");
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
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, [duration]);

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
        }
      })
      .catch(() => {
        /* no active session or network error — stay in idle */
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (sessionId) cancelMutation.mutate(sessionId);
  };

  const handlePauseResume = () => {
    const next = !isRunning;
    setIsRunning(next);
    setWaterState(next ? "focusing" : "paused");
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = ((duration * 60 - timeLeft) / (duration * 60)) * 100;
  const mood = plantMoods[waterState];
  const waterProgress = Math.min(100, progress);

  return (
    // Full page theme wrapper - negates parent padding to extend to edges
    <div
      className={`min-h-screen -m-4 lg:-m-8 p-4 lg:p-8 bg-gradient-to-br ${theme.gradient} transition-colors duration-300`}
    >
      {/* Centered container with max-width */}
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="pomodoro-header">
          <div>
            <h1
              className={`text-2xl font-bold ${isDark ? "text-white" : theme.accent}`}
            >
              Pomodoro
            </h1>
            <p
              className={`text-sm mt-1 ${isDark ? "text-white/60" : "text-slate-600"}`}
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
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Droplets
                    className={`w-4 h-4 ${isDark ? "text-cyan-400/80" : "text-cyan-500"}`}
                  />
                  <div
                    className={`flex-1 max-w-[200px] h-2 rounded-full ${isDark ? "bg-white/10" : "bg-black/5"} overflow-hidden`}
                  >
                    <div
                      className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full transition-all duration-1000"
                      style={{ width: `${waterProgress}%` }}
                    />
                  </div>
                  <span
                    className={`text-xs font-medium ${isDark ? "text-white/50" : "text-slate-400"}`}
                  >
                    {Math.round(waterProgress)}%
                  </span>
                </div>

                {/* Watering Animation Scene */}
                <div
                  className={`relative flex flex-col items-center bg-gradient-to-b from-white/5 to-white/10 backdrop-blur-md overflow-hidden border mx-auto transition-all duration-700 ease-in-out ${
                    isRunning
                      ? "h-[30rem] w-80 rounded-2xl border-slate-300/30 shadow-2xl"
                      : "h-48 w-48 rounded-full border-slate-300/30 shadow-lg"
                  }`}
                  style={{
                    boxShadow: isRunning
                      ? "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), inset 0 -2px 4px 0 rgba(0, 0, 0, 0.06)"
                      : "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                  }}
                >
                  {/* Kran Air — centered in idle, positioned for drops when running */}
                  <div
                    className="flex-shrink-0 z-10 drop-shadow-md transition-all duration-700"
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
                      className={`object-contain transition-all duration-700 ${isRunning ? "w-50 h-50" : "w-32 h-32"}`}
                    />
                  </div>

                  {/* ── WATER DROPS ──────────────────────────────────────────
                   * Absolutely positioned relative to the scene container.
                   * top: 18%  → sits just below the kran spout mouth
                   * left: calc(50% + 8px) → spout mouth of kran_air is
                   *   slightly right of the kran image center
                   * Each img starts at the same point and animates downward
                   * via @keyframes pom-fall defined in Pomodoro.css
                   * ─────────────────────────────────────────────────────── */}
                  {isRunning && (
                    <>
                      <img
                        src={waterDropImg}
                        alt=""
                        className="pom-drop-1"
                        style={{
                          position: "absolute",
                          width: "2rem",
                          height: "2rem",
                          objectFit: "contain",
                          top: "18%",
                          left: "calc(50%)",

                          zIndex: 30,
                          pointerEvents: "none",
                        }}
                      />
                      <img
                        src={waterDropImg}
                        alt=""
                        className="pom-drop-2"
                        style={{
                          position: "absolute",
                          width: "2rem",
                          height: "2rem",
                          objectFit: "contain",
                          top: "18%",
                          left: "calc(50%)",
                          zIndex: 30,
                          pointerEvents: "none",
                        }}
                      />
                      <img
                        src={waterDropImg}
                        alt=""
                        className="pom-drop-3"
                        style={{
                          position: "absolute",
                          width: "2rem",
                          height: "2rem",
                          objectFit: "contain",
                          top: "18%",
                          left: "calc(50%)",
                          zIndex: 30,
                          pointerEvents: "none",
                        }}
                      />
                    </>
                  )}

                  {/* Spacer pushes watering can to bottom */}
                  {isRunning && <div className="flex-1" />}

                  {/* Watering Can — bounces when drop lands */}
                  <div
                    className={`flex-shrink-0 z-10 transition-all duration-700 pb-4 ${isRunning ? "pom-can-bounce" : "absolute bottom-0"}`}
                  >
                    <img
                      src={wateringCanImg}
                      alt="Watering Can"
                      className={`object-contain drop-shadow-xl transition-all duration-700 ${isRunning ? "w-36 h-36" : "w-24 h-24"}`}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <span
                    className={`text-sm font-medium ${isDark ? "text-white/80" : theme.accent}`}
                  >
                    {mood.label}
                  </span>
                </div>
              </div>

              {/* Timer */}
              <div className="text-center mb-6">
                <p
                  className={`text-6xl md:text-7xl font-mono font-bold tracking-wider transition-all duration-300 ${isDark ? "text-white drop-shadow-lg" : "text-slate-800"} ${isRunning ? "scale-105" : "scale-100"}`}
                >
                  {String(minutes).padStart(2, "0")}:
                  {String(seconds).padStart(2, "0")}
                </p>
                <p
                  className={`text-sm mt-3 font-medium transition-all duration-300 ${isDark ? "text-white/50" : "text-slate-600"}`}
                >
                  {sessionId
                    ? isRunning
                      ? "Watering in progress..."
                      : "Paused — tap is closed"
                    : "Start to water your plants"}
                </p>
              </div>

              {/* Duration selector */}
              {!sessionId && (
                <div className="pomodoro-duration-section">
                  <div className="pomodoro-duration-buttons">
                    {[15, 25, 45, 60].map((d) => (
                      <button
                        key={d}
                        onClick={() => setDuration(d)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-105 active:scale-95 ${
                          duration === d
                            ? isDark
                              ? "bg-white/20 text-white shadow-md ring-2 ring-white/30"
                              : "bg-white text-slate-800 shadow-md ring-2 ring-indigo-200"
                            : isDark
                              ? "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70"
                              : "bg-white/30 text-slate-600 hover:bg-white/50 hover:text-slate-800"
                        }`}
                      >
                        {d}m
                      </button>
                    ))}
                  </div>

                  {/* Custom duration input */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs ${isDark ? "text-white/60" : "text-slate-500"}`}
                    >
                      or custom:
                    </span>
                    <input
                      type="number"
                      min="1"
                      max="120"
                      placeholder="30"
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (val >= 1 && val <= 120) {
                          setDuration(val);
                        }
                      }}
                      className={`w-16 px-2 py-1 rounded-lg text-sm text-center border-0 focus:ring-2 focus:ring-indigo-400 ${
                        isDark
                          ? "bg-white/10 text-white/80"
                          : "bg-white/60 text-slate-700"
                      }`}
                    />
                    <span
                      className={`text-xs ${isDark ? "text-white/60" : "text-slate-500"}`}
                    >
                      min
                    </span>
                  </div>
                </div>
              )}

              {/* Task selector */}
              {!sessionId && (
                <div className="pomodoro-task-section">
                  <select
                    className={`w-full rounded-xl px-4 py-2.5 text-sm border-0 focus:ring-2 focus:ring-indigo-400 ${
                      isDark
                        ? "bg-white/10 text-white/80"
                        : "bg-white/60 text-slate-700"
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
              )}

              {/* Controls */}
              <div className="pomodoro-controls">
                {!sessionId ? (
                  <button
                    onClick={handleStart}
                    className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-semibold hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:scale-105 active:scale-95"
                    disabled={startMutation.isPending}
                  >
                    {startMutation.isPending ? (
                      <Loader2
                        className="page-loading-spinner"
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
                    Plant is happy! +EXP earned
                  </div>
                ) : (
                  <>
                    <button
                      onClick={handlePauseResume}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 active:scale-95 ${isDark ? "bg-white/10 text-white hover:bg-white/20 shadow-md hover:shadow-lg" : "bg-white text-slate-700 hover:bg-slate-50 shadow-md hover:shadow-xl"}
                        }`}
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
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500/10 text-red-500 font-semibold hover:bg-red-500/20 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
                    >
                      <Square style={{ width: "1.25rem", height: "1.25rem" }} />
                      Stop
                    </button>
                  </>
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

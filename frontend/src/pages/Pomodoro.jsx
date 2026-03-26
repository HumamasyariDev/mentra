import { usePageTitle } from "../hooks/usePageTitle";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { pomodoroApi, taskApi } from "../services/api";
import { useToast } from "../contexts/ToastContext";
import {
  Play,
  Pause,
  Square,
  Loader2,
  Droplets,
  Clock,
  CheckCircle,
  Sprout,
} from "lucide-react";

import kranAirImg from "../assets/gameworld/kran_air-2.png";
import wateringCanImg from "../assets/gameworld/watering_can.png";
import "../styles/pages/Pomodoro.css";

/** Inline SVG water drop — no image load, renders immediately */
const WaterDropSvg = ({ className, style, idSuffix = "0" }) => {
  const c = { light: '#93c5fd', mid: '#60a5fa', dark: '#3b82f6' };
  return (
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
          <stop stopColor={c.light} />
          <stop offset="0.5" stopColor={c.mid} />
          <stop offset="1" stopColor={c.dark} />
        </linearGradient>
      </defs>
    </svg>
  );
};

const plantMoodKeys = {
  idle: "mood_idle",
  focusing: "mood_focusing",
  paused: "mood_paused",
  completed: "mood_completed",
};

export default function Pomodoro() {
  usePageTitle('pomodoro:title');

  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation(['pomodoro', 'common']);
  const toast = useToast();
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [duration, setDuration] = useState(25);
  const [selectedTask, setSelectedTask] = useState("");
  const [waterState, setWaterState] = useState("idle");
  const [cansEarned, setCansEarned] = useState(null);
  const [animState, setAnimState] = useState(null);
  const [skipSceneMorph, setSkipSceneMorph] = useState(false);
  const intervalRef = useRef(null);

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
    onError: () => {
      toast.error(t('pomodoro:toast_start_error'));
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
      if (res.data?.cans_awarded) {
        setCansEarned(res.data.cans_awarded);
        toast.success(t('pomodoro:toast_completed', { count: res.data.cans_awarded }));
      } else {
        toast.success(t('pomodoro:toast_completed_no_cans'));
      }
      setTimeout(() => {
        resetTimer();
        setWaterState("idle");
        setCansEarned(null);
      }, 3000);
    },
    onError: () => {
      toast.error(t('pomodoro:toast_complete_error'));
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
    setSkipSceneMorph(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, [duration]);

  // Preload scene assets
  useEffect(() => {
    [kranAirImg, wateringCanImg].forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // On mount: detect & recover any active session from the server
  useEffect(() => {
    pomodoroApi
      .list({ status: "running", per_page: 1 })
      .then((res) => {
        const active = res.data?.data?.[0];
        if (active && ["running", "paused"].includes(active.status)) {
          const dur = active.duration_minutes ?? 25;
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
          // Skip the scene morph animation on initial render so it doesn't
          // play the circle→rectangle transition. Re-enable transitions
          // shortly after so pause/stop still animate smoothly.
          setSkipSceneMorph(true);
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setSkipSceneMorph(false);
            });
          });
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check for pending animation on mount
  useEffect(() => {
    const pendingAnimStr = localStorage.getItem('pom-pending-anim');
    if (pendingAnimStr) {
      try {
        const { type, timestamp } = JSON.parse(pendingAnimStr);
        const elapsed = Date.now() - timestamp;
        if (elapsed < 30000) {
          setAnimState(type);
          const animDuration = type === 'stopped' ? 600 : 450;
          setTimeout(() => setAnimState(null), animDuration);
        }
        localStorage.removeItem('pom-pending-anim');
      } catch (e) {
        localStorage.removeItem('pom-pending-anim');
      }
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

  const handleStart = () => {
    startMutation.mutate({
      duration_minutes: duration,
      task_id: selectedTask || undefined,
    });
  };

  const handleStop = () => {
    if (sessionId) {
      setAnimState("stopped");
      const animData = { type: 'stopped', timestamp: Date.now() };
      localStorage.setItem('pom-pending-anim', JSON.stringify(animData));
      setTimeout(() => setAnimState(null), 600);
      cancelMutation.mutate(sessionId);
    }
  };

  const handlePauseResume = () => {
    const next = !isRunning;
    const animType = next ? "resumed" : "paused";
    setAnimState(animType);
    const animData = { type: animType, timestamp: Date.now() };
    localStorage.setItem('pom-pending-anim', JSON.stringify(animData));
    setTimeout(() => setAnimState(null), 450);
    setIsRunning(next);
    setWaterState(next ? "focusing" : "paused");
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const totalSeconds = duration * 60;
  const elapsedSeconds = isRunning ? Math.max(0, totalSeconds - timeLeft) : 0;
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;
  const mood = plantMoodKeys[waterState];
  const waterProgress = Math.min(100, progress);

  return (
    <div className="pomodoro-page">
      {/* Header */}
      <div className="pomodoro-header">
        <div className="pomodoro-header-info">
          <h1 className="pomodoro-title">{t('pomodoro:title')}</h1>
          <p className="pomodoro-subtitle">{t('pomodoro:subtitle')}</p>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="pomodoro-grid">
        {/* Timer Card */}
        <div className={`pomodoro-card pomodoro-timer-card ${sessionId && isRunning ? "pom-card-running" : ""}`}>
          {/* Water progress */}
          <div className="pom-water-progress-row">
            <Droplets className="pom-water-icon" />
            <div className="pom-progress-track">
              <div
                className="pom-progress-fill"
                style={{ width: `${waterProgress}%` }}
              />
            </div>
            <span className="pom-progress-pct">
              {Math.round(waterProgress)}%
            </span>
          </div>

          {/* Watering Animation Scene */}
          <div className={`pom-scene ${isRunning ? "pom-scene-running" : "pom-scene-idle"} ${skipSceneMorph ? "pom-scene-skip-morph" : ""}`}>
            {/* Kran Air */}
            <div className={`pom-scene-kran ${isRunning ? "pom-scene-kran-running" : "pom-scene-kran-idle"}`}>
              <img
                src={kranAirImg}
                alt="Kran Air"
                className={`pom-kran-img ${isRunning ? "pom-kran-img-running" : "pom-kran-img-idle"}`}
              />
            </div>

            {/* Water Drops */}
            {isRunning && (
              <div key={sessionId ?? "drops"} className="pom-drops-container">
                <div
                  className="pom-drop-single pom-drop-z1"
                  style={{ animationDelay: `${-((elapsedSeconds % 3) * 1000)}ms` }}
                >
                  <WaterDropSvg idSuffix="1" />
                </div>
                <div
                  className="pom-drop-single pom-drop-z2"
                  style={{ animationDelay: `${-(((elapsedSeconds - 1 + 3) % 3) * 1000)}ms` }}
                >
                  <WaterDropSvg idSuffix="2" />
                </div>
                <div
                  className="pom-drop-single pom-drop-z3"
                  style={{ animationDelay: `${-(((elapsedSeconds - 2 + 3) % 3) * 1000)}ms` }}
                >
                  <WaterDropSvg idSuffix="3" />
                </div>
              </div>
            )}

            {/* Spacer pushes can to bottom */}
            {isRunning && <div className="pom-scene-spacer" />}

            {/* Watering Can */}
            <div className={`pom-scene-can ${isRunning ? "pom-can-bounce" : "pom-scene-can-idle"}`}>
              <img
                src={wateringCanImg}
                alt="Watering Can"
                className={`pom-can-img ${isRunning ? "pom-can-img-running" : "pom-can-img-idle"}`}
              />
            </div>
          </div>

          {/* Status */}
          <div className="pom-status-sub">{t(`pomodoro:${mood}`)}</div>

          {/* Timer */}
          <div className="pom-timer-section">
            <p className={`pom-timer-display ${isRunning ? "pom-running" : ""} ${animState === "paused" ? "pom-paused" : ""} ${animState === "stopped" ? "pom-stopped" : ""}`}>
              {String(minutes).padStart(2, "0")}:
              {String(seconds).padStart(2, "0")}
            </p>
            <p className={`pom-status-label ${sessionId && isRunning ? "pom-status-label-running" : ""}`}>
              {sessionId
                ? isRunning
                  ? t('pomodoro:status_running')
                  : t('pomodoro:status_paused')
                : t('pomodoro:status_idle')}
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
                    className={`pom-duration-btn ${duration === d ? "pom-duration-btn-active" : ""}`}
                  >
                    {d}m
                  </button>
                ))}
              </div>

              <div className="pom-custom-row">
                <span className="pom-custom-label">{t('pomodoro:or_custom')}</span>
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
                  className="pom-custom-input"
                />
                <span className="pom-custom-unit">{t('pomodoro:min_unit')}</span>
              </div>

              <div className="pom-task-row">
                <select
                  className="pom-task-select"
                  value={selectedTask}
                  onChange={(e) => setSelectedTask(e.target.value)}
                >
                  <option value="">{t('pomodoro:no_task_linked')}</option>
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
                className="pom-start-btn"
                disabled={startMutation.isPending}
              >
                {startMutation.isPending ? (
                  <Loader2 className="pomodoro-loading-spinner" />
                ) : (
                  <Play style={{ width: "1.25rem", height: "1.25rem" }} />
                )}
                {t('pomodoro:water_plants')}
              </button>
            ) : waterState === "completed" ? (
              <div className="pom-completed-msg">
                <span>{t('pomodoro:completed_msg')}</span>
                {cansEarned > 0 && (
                  <span className="pom-cans-badge">
                    <Sprout style={{ width: "1rem", height: "1rem" }} />
                    {t('pomodoro:cans_earned', { count: cansEarned })}
                  </span>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={handlePauseResume}
                  className={`pom-btn-pause ${animState === "paused" ? "pom-just-paused" : ""} ${animState === "resumed" ? "pom-just-resumed" : ""}`}
                >
                  {isRunning ? (
                    <Pause style={{ width: "1.25rem", height: "1.25rem" }} />
                  ) : (
                    <Play style={{ width: "1.25rem", height: "1.25rem" }} />
                  )}
                  {isRunning ? t('pomodoro:pause') : t('pomodoro:resume')}
                </button>
                <button
                  onClick={handleStop}
                  className={`pom-btn-stop ${animState === "stopped" ? "pom-just-stopped" : ""}`}
                >
                  <Square style={{ width: "1.25rem", height: "1.25rem" }} />
                  {t('pomodoro:stop')}
                </button>
              </>
            )}

            {/* Debug button - dev only */}
            {import.meta.env.DEV && sessionId && waterState !== "completed" && (
              <button
                onClick={() => completeMutation.mutate(sessionId)}
                className="pom-dev-btn"
                disabled={completeMutation.isPending}
              >
                [DEV] Complete
              </button>
            )}
          </div>
        </div>

        {/* Stats Card */}
        {stats && (
          <div className="pomodoro-card">
            <h3 className="pomodoro-card-title">{t('pomodoro:todays_progress')}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="pom-stat-item">
                <div className="pom-stat-label">
                  <Clock className="pom-stat-icon pom-stat-icon-accent" />
                  <span>{t('pomodoro:today_sessions')}</span>
                </div>
                <span className="pom-stat-value pom-stat-value-accent">
                  {stats.today_sessions}
                </span>
              </div>
              <div className="pom-stat-item">
                <div className="pom-stat-label">
                  <CheckCircle className="pom-stat-icon pom-stat-icon-success" />
                  <span>{t('pomodoro:total_focus')}</span>
                </div>
                <span className="pom-stat-value pom-stat-value-success">
                  {stats.total_focus_minutes}m
                </span>
              </div>
            </div>
          </div>
        )}

        {/* History Card */}
        {history?.data?.length > 0 && (
          <div className="pomodoro-card">
            <h3 className="pomodoro-card-title">{t('pomodoro:recent_sessions')}</h3>
            <div className="pom-history-list">
              {history.data.map((session) => (
                <div key={session.id} className="pom-history-item">
                  <div className="pom-history-info">
                    <p className="pom-history-task">
                      {session.task?.title || t('pomodoro:no_task')}
                    </p>
                    <p className="pom-history-meta">
                      {session.duration_minutes}min ·{" "}
                      {new Date(session.created_at).toLocaleDateString(
                        i18n.language === 'id' ? 'id-ID' : 'en-US',
                        { month: "short", day: "numeric" },
                      )}
                    </p>
                  </div>
                  <span
                    className={`pom-history-badge ${
                      session.status === "completed"
                        ? "pom-badge-completed"
                        : session.status === "cancelled"
                          ? "pom-badge-cancelled"
                          : "pom-badge-running"
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
        )}
      </div>
    </div>
  );
}

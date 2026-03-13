import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain, Square, Loader2, Palette, ChevronDown, Fish, Clock, CheckCircle } from 'lucide-react';
import '../styles/pages/CommonPages.css';
import '../styles/pages/Pomodoro.css';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pomodoroApi, taskApi } from '../services/api';
import { usePomodoroTheme } from '../contexts/PomodoroThemeContext';

const catMoods = {
  idle: { emoji: '😺', label: 'Waiting...', animation: '' },
  focusing: { emoji: '😸', label: 'Eating happily!', animation: 'animate-bounce' },
  paused: { emoji: '😿', label: 'Why did you stop?', animation: '' },
  completed: { emoji: '😻', label: 'So full & happy!', animation: 'animate-pulse' },
};

export default function Pomodoro() {
  const queryClient = useQueryClient();
  const { theme, setTheme, backgrounds } = usePomodoroTheme();
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [duration, setDuration] = useState(25);
  const [selectedTask, setSelectedTask] = useState('');
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [catState, setCatState] = useState('idle');
  const intervalRef = useRef(null);

  const isDark = theme.dark;

  const { data: stats } = useQuery({
    queryKey: ['pomodoro-stats'],
    queryFn: () => pomodoroApi.stats().then((r) => r.data),
  });

  const { data: tasks } = useQuery({
    queryKey: ['tasks', 'pending'],
    queryFn: () => taskApi.list({ status: 'pending', per_page: 50 }).then((r) => r.data),
  });

  const { data: history } = useQuery({
    queryKey: ['pomodoro-history'],
    queryFn: () => pomodoroApi.list({ per_page: 5 }).then((r) => r.data),
  });

  const startMutation = useMutation({
    mutationFn: (data) => pomodoroApi.start(data),
    onSuccess: (res) => {
      setSessionId(res.data.id);
      setIsRunning(true);
      setCatState('focusing');
    },
  });

  const completeMutation = useMutation({
    mutationFn: (id) => pomodoroApi.complete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pomodoro-stats'] });
      queryClient.invalidateQueries({ queryKey: ['pomodoro-history'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setCatState('completed');
      setTimeout(() => {
        resetTimer();
        setCatState('idle');
      }, 3000);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id) => pomodoroApi.cancel(id),
    onSuccess: () => {
      resetTimer();
      setCatState('idle');
    },
  });

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setSessionId(null);
    setTimeLeft(duration * 60);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, [duration]);

  // Fixed useEffect with proper dependencies
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
    setCatState(next ? 'focusing' : 'paused');
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = ((duration * 60 - timeLeft) / (duration * 60)) * 100;
  const mood = catMoods[catState];
  const foodProgress = Math.min(100, progress);

  return (
    // Full page theme wrapper - negates parent padding to extend to edges
    <div className="pomodoro-wrapper" style={{ background: `linear-gradient(to bottom right, ${theme.gradient})` }}>
      <div className="pomodoro-container">
        {/* Header */}
        <div className="pomodoro-header">
          <div>
            <h1 className="pomodoro-title" style={{ color: isDark ? '#ffffff' : theme.accent }}>Pomodoro</h1>
            <p className="pomodoro-subtitle" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : '#475569' }}>Feed your cat by staying focused</p>
          </div>
          {/* Theme picker */}
          <div className="pomodoro-theme-picker">
            <button
              onClick={() => setShowBgPicker(!showBgPicker)}
              className="pomodoro-theme-btn"
              style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.5)',
                color: isDark ? '#ffffff' : '#334155',
                border: isDark ? 'none' : '1px solid rgba(255,255,255,0.5)'
              }}
            >
              <Palette style={{ width: '1rem', height: '1rem' }} />
              <span className="pomodoro-theme-label">{theme.label}</span>
              <ChevronDown style={{ width: '0.75rem', height: '0.75rem' }} />
            </button>
            {showBgPicker && (
              <div className="pomodoro-theme-dropdown">
                {backgrounds.map((b) => (
                  <button
                    key={b.key}
                    onClick={() => handleBgChange(b.key)}
                    className="pomodoro-theme-option"
                    style={{
                      backgroundColor: theme.key === b.key ? '#eef2ff' : 'transparent',
                      color: theme.key === b.key ? '#4338ca' : '#475569'
                    }}
                  >
                    <span className="pomodoro-theme-preview" style={{ background: `linear-gradient(to bottom right, ${b.gradient})` }} />
                    {b.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="pomodoro-grid">
          {/* Main Timer Card (2x width) */}
          <div className="pomodoro-timer-col">
            <div className="pomodoro-timer-card" style={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.4)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.5)'}`,
              backdropFilter: 'blur(10px)'
            }}>
              {/* Cat Scene */}
              <div className="pomodoro-cat-scene">
                {/* Food bowl progress */}
                <div className="pomodoro-food-progress">
                  <Fish style={{ width: '1rem', height: '1rem', color: isDark ? 'rgba(255,255,255,0.4)' : '#94a3b8' }} />
                  <div className="pomodoro-food-bar" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}>
                    <div
                      className="pomodoro-food-fill"
                      style={{ width: `${foodProgress}%` }}
                    />
                  </div>
                  <span className="pomodoro-food-percent" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#94a3b8' }}>
                    {Math.round(foodProgress)}%
                  </span>
                </div>

                {/* Cat */}
                <div className="pomodoro-cat" style={{ animation: mood.animation }}>
                  <span className="pomodoro-cat-emoji" role="img" aria-label="cat">
                    {mood.emoji}
                  </span>
                  <span className="pomodoro-cat-label" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : theme.accent }}>
                    {mood.label}
                  </span>
                </div>
              </div>

              {/* Timer */}
              <div className="pomodoro-timer-display">
                <p className="pomodoro-timer-time" style={{ color: isDark ? '#ffffff' : '#1e293b' }}>
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </p>
                <p className="pomodoro-timer-status" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : '#64748b' }}>
                  {sessionId ? (isRunning ? 'Feeding in progress...' : 'Paused — cat is waiting') : 'Start to feed your cat'}
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
                        className="pomodoro-duration-btn"
                        style={{
                          backgroundColor: duration === d 
                            ? (isDark ? 'rgba(255,255,255,0.2)' : '#ffffff')
                            : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.3)'),
                          color: duration === d
                            ? (isDark ? '#ffffff' : '#1e293b')
                            : (isDark ? 'rgba(255,255,255,0.5)' : '#475569'),
                          boxShadow: duration === d ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                        }}
                      >
                        {d}m
                      </button>
                    ))}
                  </div>

                  {/* Custom duration input */}
                  <div className="pomodoro-custom-duration">
                    <span style={{ color: isDark ? 'rgba(255,255,255,0.6)' : '#64748b' }}>or custom:</span>
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
                      className="pomodoro-custom-input"
                      style={{
                        backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.6)',
                        color: isDark ? 'rgba(255,255,255,0.8)' : '#334155'
                      }}
                    />
                    <span style={{ color: isDark ? 'rgba(255,255,255,0.6)' : '#64748b' }}>min</span>
                  </div>
                </div>
              )}

              {/* Task selector */}
              {!sessionId && (
                <div className="pomodoro-task-section">
                  <select
                    className="pomodoro-task-select"
                    style={{
                      backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.6)',
                      color: isDark ? 'rgba(255,255,255,0.8)' : '#334155'
                    }}
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
                    className="pomodoro-start-btn"
                    disabled={startMutation.isPending}
                  >
                    {startMutation.isPending ? (
                      <Loader2 className="page-loading-spinner" style={{ width: '1.25rem', height: '1.25rem' }} />
                    ) : (
                      <Play style={{ width: '1.25rem', height: '1.25rem' }} />
                    )}
                    Feed Cat
                  </button>
                ) : catState === 'completed' ? (
                  <div className="pomodoro-completed-msg" style={{
                    backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : '#d1fae5',
                    color: isDark ? '#6ee7b7' : '#047857'
                  }}>
                    Cat is happy! +EXP earned
                  </div>
                ) : (
                  <>
                    <button
                      onClick={handlePauseResume}
                      className="pomodoro-pause-btn"
                      style={{
                        backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#ffffff',
                        color: isDark ? '#ffffff' : '#334155',
                        boxShadow: isDark ? 'none' : '0 1px 2px rgba(0,0,0,0.05)'
                      }}
                    >
                      {isRunning ? <Pause style={{ width: '1.25rem', height: '1.25rem' }} /> : <Play style={{ width: '1.25rem', height: '1.25rem' }} />}
                      {isRunning ? 'Pause' : 'Resume'}
                    </button>
                    <button
                      onClick={handleStop}
                      className="pomodoro-stop-btn"
                    >
                      <Square style={{ width: '1.25rem', height: '1.25rem' }} />
                      Stop
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Stats & Recent Sessions Card (1x width) */}
          <div className="pomodoro-sidebar">
            {/* Stats Card */}
            {stats && (
              <div className="pomodoro-stats-card" style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.4)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.5)'}`,
                backdropFilter: 'blur(10px)'
              }}>
                <h3 className="pomodoro-stats-title" style={{ color: isDark ? '#ffffff' : '#0f172a' }}>Today's Progress</h3>
                <div className="pomodoro-stats-list">
                  <div className="pomodoro-stat-item" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.5)' }}>
                    <div className="pomodoro-stat-label">
                      <Clock style={{ width: '1rem', height: '1rem', color: isDark ? '#818cf8' : '#4f46e5' }} />
                      <span style={{ color: isDark ? 'rgba(255,255,255,0.7)' : '#475569' }}>Today Sessions</span>
                    </div>
                    <span className="pomodoro-stat-value" style={{ color: isDark ? '#818cf8' : '#4f46e5' }}>{stats.today_sessions}</span>
                  </div>
                  <div className="pomodoro-stat-item" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.5)' }}>
                    <div className="pomodoro-stat-label">
                      <CheckCircle style={{ width: '1rem', height: '1rem', color: isDark ? '#6ee7b7' : '#059669' }} />
                      <span style={{ color: isDark ? 'rgba(255,255,255,0.7)' : '#475569' }}>Total Focus</span>
                    </div>
                    <span className="pomodoro-stat-value" style={{ color: isDark ? '#6ee7b7' : '#059669' }}>{stats.total_focus_minutes}m</span>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Sessions */}
            {history?.data?.length > 0 && (
              <div className="pomodoro-history-card" style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.4)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.5)'}`,
                backdropFilter: 'blur(10px)'
              }}>
                <h3 className="pomodoro-history-title" style={{ color: isDark ? '#ffffff' : '#0f172a' }}>Recent Sessions</h3>
                <div className="pomodoro-history-list">
                  {history.data.map((session) => (
                    <div key={session.id} className="pomodoro-history-item" style={{
                      borderBottom: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #f1f5f9'
                    }}>
                      <div className="pomodoro-history-info">
                        <p className="pomodoro-history-task" style={{ color: isDark ? 'rgba(255,255,255,0.8)' : '#334155' }}>
                          {session.task?.title || 'No task'}
                        </p>
                        <p className="pomodoro-history-meta" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : '#94a3b8' }}>
                          {session.duration_minutes}min · {new Date(session.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      <span
                        className="pomodoro-history-badge"
                        style={{
                          backgroundColor: session.status === 'completed'
                            ? (isDark ? 'rgba(16, 185, 129, 0.2)' : '#d1fae5')
                            : session.status === 'cancelled'
                              ? (isDark ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2')
                              : (isDark ? 'rgba(234, 179, 8, 0.2)' : '#fef3c7'),
                          color: session.status === 'completed'
                            ? (isDark ? '#6ee7b7' : '#047857')
                            : session.status === 'cancelled'
                              ? (isDark ? '#fca5a5' : '#991b1b')
                              : (isDark ? '#fde047' : '#a16207')
                        }}
                      >
                        {session.status === 'completed' ? '✓' : session.status === 'cancelled' ? '×' : '...'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

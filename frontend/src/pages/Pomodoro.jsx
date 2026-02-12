import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pomodoroApi, taskApi } from '../services/api';
import { Play, Pause, Square, Loader2, Palette, ChevronDown, Fish, Clock, CheckCircle } from 'lucide-react';
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
    <div className={`min-h-screen -m-4 lg:-m-8 p-4 lg:p-8 bg-gradient-to-br ${theme.gradient} transition-colors duration-300`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : theme.accent}`}>Pomodoro</h1>
            <p className={`text-sm mt-1 ${isDark ? 'text-white/60' : 'text-slate-600'}`}>Feed your cat by staying focused</p>
          </div>
          {/* Theme picker */}
          <div className="relative">
            <button
              onClick={() => setShowBgPicker(!showBgPicker)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${isDark
                ? 'bg-white/10 text-white hover:bg-white/20'
                : 'bg-white/50 backdrop-blur-sm border border-white/50 text-slate-700 hover:bg-white/70'
                }`}
            >
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">{theme.label}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {showBgPicker && (
              <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-slate-200 p-2 z-50 w-48">
                {backgrounds.map((b) => (
                  <button
                    key={b.key}
                    onClick={() => handleBgChange(b.key)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${theme.key === b.key ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                  >
                    <span className={`w-5 h-5 rounded-full bg-gradient-to-br ${b.gradient} border border-slate-200`} />
                    {b.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Timer Card (2x width) */}
          <div className="lg:col-span-2">
            <div className={`rounded-2xl ${isDark ? 'bg-white/5 backdrop-blur-sm' : 'bg-white/40 backdrop-blur-sm'} p-6 md:p-8 relative overflow-hidden border ${isDark ? 'border-white/10' : 'border-white/50'}`}>
              {/* Cat Scene */}
              <div className="text-center mb-6">
                {/* Food bowl progress */}
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Fish className={`w-4 h-4 ${isDark ? 'text-white/40' : 'text-slate-400'}`} />
                  <div className={`flex-1 max-w-[200px] h-2 rounded-full ${isDark ? 'bg-white/10' : 'bg-black/5'} overflow-hidden`}>
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full transition-all duration-1000"
                      style={{ width: `${foodProgress}%` }}
                    />
                  </div>
                  <span className={`text-xs font-medium ${isDark ? 'text-white/50' : 'text-slate-400'}`}>
                    {Math.round(foodProgress)}%
                  </span>
                </div>

                {/* Cat */}
                <div className={`inline-flex flex-col items-center ${mood.animation}`}>
                  <span className="text-7xl leading-none select-none" role="img" aria-label="cat">
                    {mood.emoji}
                  </span>
                  <span className={`text-xs mt-2 font-medium ${isDark ? 'text-white/60' : theme.accent}`}>
                    {mood.label}
                  </span>
                </div>
              </div>

              {/* Timer */}
              <div className="text-center mb-6">
                <p className={`text-5xl font-mono font-bold tracking-wider ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </p>
                <p className={`text-sm mt-2 ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                  {sessionId ? (isRunning ? 'Feeding in progress...' : 'Paused — cat is waiting') : 'Start to feed your cat'}
                </p>
              </div>

              {/* Duration selector */}
              {!sessionId && (
                <div className="flex flex-col items-center gap-2 mb-5">
                  <div className="flex justify-center gap-2 flex-wrap">
                    {[15, 25, 45, 60].map((d) => (
                      <button
                        key={d}
                        onClick={() => setDuration(d)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${duration === d
                            ? isDark
                              ? 'bg-white/20 text-white shadow-sm'
                              : 'bg-white text-slate-800 shadow-sm'
                            : isDark
                              ? 'bg-white/5 text-white/50 hover:bg-white/10'
                              : 'bg-white/30 text-slate-600 hover:bg-white/50'
                          }`}
                      >
                        {d}m
                      </button>
                    ))}
                  </div>

                  {/* Custom duration input */}
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${isDark ? 'text-white/60' : 'text-slate-500'}`}>or custom:</span>
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
                      className={`w-16 px-2 py-1 rounded-lg text-sm text-center border-0 focus:ring-2 focus:ring-indigo-400 ${isDark ? 'bg-white/10 text-white/80' : 'bg-white/60 text-slate-700'
                        }`}
                    />
                    <span className={`text-xs ${isDark ? 'text-white/60' : 'text-slate-500'}`}>min</span>
                  </div>
                </div>
              )}

              {/* Task selector */}
              {!sessionId && (
                <div className="mb-5">
                  <select
                    className={`w-full rounded-xl px-4 py-2.5 text-sm border-0 focus:ring-2 focus:ring-indigo-400 ${isDark ? 'bg-white/10 text-white/80' : 'bg-white/60 text-slate-700'
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
              <div className="flex justify-center gap-3">
                {!sessionId ? (
                  <button
                    onClick={handleStart}
                    className="flex items-center gap-2 px-8 py-3 rounded-xl bg-indigo-500 text-white font-medium hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/25"
                    disabled={startMutation.isPending}
                  >
                    {startMutation.isPending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Play className="w-5 h-5" />
                    )}
                    Feed Cat
                  </button>
                ) : catState === 'completed' ? (
                  <div className={`px-6 py-3 rounded-xl font-medium ${isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-700'}`}>
                    Cat is happy! +EXP earned
                  </div>
                ) : (
                  <>
                    <button
                      onClick={handlePauseResume}
                      className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-colors ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-white text-slate-700 hover:bg-slate-50 shadow-sm'
                        }`}
                    >
                      {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                      {isRunning ? 'Pause' : 'Resume'}
                    </button>
                    <button
                      onClick={handleStop}
                      className="flex items-center gap-2 px-5 py-3 rounded-xl bg-red-500/10 text-red-500 font-medium hover:bg-red-500/20 transition-colors"
                    >
                      <Square className="w-5 h-5" />
                      Stop
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Stats & Recent Sessions Card (1x width) */}
          <div className="lg:col-span-1 space-y-6">
            {/* Stats Card */}
            {stats && (
              <div className={`rounded-xl p-5 space-y-4 ${isDark ? 'bg-white/5 backdrop-blur-sm border border-white/10' : 'bg-white/40 backdrop-blur-sm border border-white/50'}`}>
                <h3 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>Today's Progress</h3>
                <div className="space-y-3">
                  <div className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-white/5' : 'bg-white/50'}`}>
                    <div className="flex items-center gap-2">
                      <Clock className={`w-4 h-4 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
                      <span className={`text-xs ${isDark ? 'text-white/70' : 'text-slate-600'}`}>Today Sessions</span>
                    </div>
                    <span className={`text-lg font-bold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>{stats.today_sessions}</span>
                  </div>
                  <div className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-white/5' : 'bg-white/50'}`}>
                    <div className="flex items-center gap-2">
                      <CheckCircle className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                      <span className={`text-xs ${isDark ? 'text-white/70' : 'text-slate-600'}`}>Total Focus</span>
                    </div>
                    <span className={`text-lg font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>{stats.total_focus_minutes}m</span>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Sessions */}
            {history?.data?.length > 0 && (
              <div className={`rounded-xl p-5 ${isDark ? 'bg-white/5 backdrop-blur-sm border border-white/10' : 'bg-white/40 backdrop-blur-sm border border-white/50'}`}>
                <h3 className={`font-semibold mb-3 text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>Recent Sessions</h3>
                <div className="space-y-2">
                  {history.data.map((session) => (
                    <div key={session.id} className={`flex items-center justify-between py-2 border-b last:border-0 ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium truncate ${isDark ? 'text-white/80' : 'text-slate-700'}`}>
                          {session.task?.title || 'No task'}
                        </p>
                        <p className={`text-[10px] ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
                          {session.duration_minutes}min · {new Date(session.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ml-2 ${session.status === 'completed'
                          ? isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                          : session.status === 'cancelled'
                            ? isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700'
                            : isDark ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700'
                          }`}
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

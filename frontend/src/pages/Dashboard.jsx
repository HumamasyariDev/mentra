import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../services/api';
import {
  CheckSquare,
  Timer,
  Flame,
  TrendingUp,
  Zap,
  Calendar,
  Smile,
  Loader2,
} from 'lucide-react';

const moodEmoji = {
  great: { emoji: '😄', color: 'text-emerald-500' },
  good: { emoji: '🙂', color: 'text-green-500' },
  okay: { emoji: '😐', color: 'text-yellow-500' },
  bad: { emoji: '😞', color: 'text-orange-500' },
  terrible: { emoji: '😢', color: 'text-red-500' },
};

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.get().then((r) => r.data),
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const d = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {d.user.name}!
        </h1>
        <p className="text-slate-500 mt-1">Here's your productivity overview</p>
      </div>

      {/* Level & EXP Card */}
      <div className="card bg-gradient-to-r from-indigo-500 to-indigo-600 text-white border-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-indigo-100 text-sm">Level {d.user.level}</p>
            <p className="text-2xl font-bold mt-1">{d.user.total_exp} Total EXP</p>
          </div>
          <div className="bg-white/20 p-3 rounded-xl">
            <Zap className="w-8 h-8" />
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-sm text-indigo-100 mb-1">
            <span>Progress to Level {d.user.level + 1}</span>
            <span>
              {d.user.current_exp}/{d.user.exp_to_next_level} EXP
            </span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-700"
              style={{
                width: `${Math.round((d.user.current_exp / d.user.exp_to_next_level) * 100)}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={CheckSquare}
          label="Tasks Done Today"
          value={d.tasks.today_completed}
          sub={`${d.tasks.completed} total`}
          color="text-emerald-500"
          bg="bg-emerald-50"
        />
        <StatCard
          icon={Timer}
          label="Focus Today"
          value={`${d.pomodoro.today_minutes}m`}
          sub={`${d.pomodoro.today_sessions} sessions`}
          color="text-blue-500"
          bg="bg-blue-50"
        />
        <StatCard
          icon={Flame}
          label="Current Streak"
          value={`${d.streak.current_streak} days`}
          sub={`Best: ${d.streak.longest_streak}`}
          color="text-orange-500"
          bg="bg-orange-50"
        />
        <StatCard
          icon={Calendar}
          label="Pending Tasks"
          value={d.tasks.pending}
          sub={`${d.tasks.in_progress} in progress`}
          color="text-indigo-500"
          bg="bg-indigo-50"
        />
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Today's Mood */}
        <div className="card">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-4">
            <Smile className="w-5 h-5 text-yellow-500" />
            Today's Mood
          </h3>
          {d.today_mood ? (
            <div className="flex items-center gap-3">
              <span className="text-4xl">
                {moodEmoji[d.today_mood.mood]?.emoji}
              </span>
              <div>
                <p className={`font-medium capitalize ${moodEmoji[d.today_mood.mood]?.color}`}>
                  {d.today_mood.mood}
                </p>
                <p className="text-sm text-slate-500">
                  Energy: {d.today_mood.energy_level}/10
                </p>
                {d.today_mood.note && (
                  <p className="text-sm text-slate-400 mt-1">{d.today_mood.note}</p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-slate-400 text-sm">No mood logged today</p>
          )}
        </div>

        {/* Recent EXP */}
        <div className="card">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-indigo-500" />
            Recent Activity
          </h3>
          {d.recent_exp.length > 0 ? (
            <div className="space-y-3">
              {d.recent_exp.map((exp) => (
                <div key={exp.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{exp.description}</p>
                    <p className="text-xs text-slate-400">{exp.source}</p>
                  </div>
                  <span className="text-sm font-semibold text-emerald-600">
                    +{exp.amount} EXP
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-sm">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color, bg }) {
  return (
    <div className="card">
      <div className={`inline-flex p-2 rounded-lg ${bg} mb-3`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm font-medium text-slate-600">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

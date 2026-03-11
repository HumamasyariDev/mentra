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
import '../styles/pages/Dashboard.css';

const moodEmoji = {
  great: { emoji: '😄', color: 'mood-great' },
  good: { emoji: '🙂', color: 'mood-good' },
  okay: { emoji: '😐', color: 'mood-okay' },
  bad: { emoji: '😞', color: 'mood-bad' },
  terrible: { emoji: '😢', color: 'mood-terrible' },
};

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.get().then((r) => r.data),
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <Loader2 className="dashboard-loading-spinner" />
      </div>
    );
  }

  const d = data;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">
          Welcome back, {d.user.name}!
        </h1>
        <p className="dashboard-subtitle">Here's your productivity overview</p>
      </div>

      {/* Level & EXP Card */}
      <div className="dashboard-level-card">
        <div className="dashboard-level-header">
          <div className="dashboard-level-info">
            <p className="dashboard-level-label">Level {d.user.level}</p>
            <p className="dashboard-level-value">{d.user.total_exp} Total EXP</p>
          </div>
          <div className="dashboard-level-icon-container">
            <Zap className="dashboard-level-icon" />
          </div>
        </div>
        <div className="dashboard-level-progress">
          <div className="dashboard-level-progress-header">
            <span>Progress to Level {d.user.level + 1}</span>
            <span>
              {d.user.current_exp}/{d.user.exp_to_next_level} EXP
            </span>
          </div>
          <div className="dashboard-level-progress-bar">
            <div
              className="dashboard-level-progress-fill"
              style={{
                width: `${Math.round((d.user.current_exp / d.user.exp_to_next_level) * 100)}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="dashboard-stats-grid">
        <StatCard
          icon={CheckSquare}
          label="Tasks Done Today"
          value={d.tasks.today_completed}
          sub={`${d.tasks.completed} total`}
          color="stat-color-emerald"
          bg="stat-bg-emerald"
        />
        <StatCard
          icon={Timer}
          label="Focus Today"
          value={`${d.pomodoro.today_minutes}m`}
          sub={`${d.pomodoro.today_sessions} sessions`}
          color="stat-color-blue"
          bg="stat-bg-blue"
        />
        <StatCard
          icon={Flame}
          label="Current Streak"
          value={`${d.streak.current_streak} days`}
          sub={`Best: ${d.streak.longest_streak}`}
          color="stat-color-orange"
          bg="stat-bg-orange"
        />
        <StatCard
          icon={Calendar}
          label="Pending Tasks"
          value={d.tasks.pending}
          sub={`${d.tasks.in_progress} in progress`}
          color="stat-color-indigo"
          bg="stat-bg-indigo"
        />
      </div>

      {/* Bottom row */}
      <div className="dashboard-bottom-grid">
        {/* Today's Mood */}
        <div className="dashboard-card">
          <h3 className="dashboard-card-title">
            <Smile className="dashboard-card-title-icon stat-color-yellow" />
            Today's Mood
          </h3>
          {d.today_mood ? (
            <div className="dashboard-mood-content">
              <span className="dashboard-mood-emoji">
                {moodEmoji[d.today_mood.mood]?.emoji}
              </span>
              <div className="dashboard-mood-info">
                <p className={`dashboard-mood-label ${moodEmoji[d.today_mood.mood]?.color}`}>
                  {d.today_mood.mood}
                </p>
                <p className="dashboard-mood-energy">
                  Energy: {d.today_mood.energy_level}/10
                </p>
                {d.today_mood.note && (
                  <p className="dashboard-mood-note">{d.today_mood.note}</p>
                )}
              </div>
            </div>
          ) : (
            <p className="dashboard-mood-empty">No mood logged today</p>
          )}
        </div>

        {/* Recent EXP */}
        <div className="dashboard-card">
          <h3 className="dashboard-card-title">
            <TrendingUp className="dashboard-card-title-icon stat-color-indigo" />
            Recent Activity
          </h3>
          {d.recent_exp.length > 0 ? (
            <div className="dashboard-activity-list">
              {d.recent_exp.map((exp) => (
                <div key={exp.id} className="dashboard-activity-item">
                  <div className="dashboard-activity-info">
                    <p className="dashboard-activity-description">{exp.description}</p>
                    <p className="dashboard-activity-source">{exp.source}</p>
                  </div>
                  <span className="dashboard-activity-exp">
                    +{exp.amount} EXP
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="dashboard-activity-empty">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color, bg }) {
  return (
    <div className="dashboard-stat-card">
      <div className={`dashboard-stat-icon-container ${bg}`}>
        <Icon className={`dashboard-stat-icon ${color}`} />
      </div>
      <p className="dashboard-stat-value">{value}</p>
      <p className="dashboard-stat-label">{label}</p>
      {sub && <p className="dashboard-stat-sub">{sub}</p>}
    </div>
  );
}

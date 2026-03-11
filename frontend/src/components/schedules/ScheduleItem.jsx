import { CheckCircle2, Circle, Trash2, Clock, Repeat } from 'lucide-react';
import '../../styles/components/schedules/ScheduleComponents.css';

const typeColors = {
  daily: { bg: '#dbeafe', text: '#1e40af' },
  weekly: { bg: '#f3e8ff', text: '#7c3aed' },
  monthly: { bg: '#fef3c7', text: '#a16207' },
};

export function isCompletedOnDate(schedule, dateStr) {
  if (!schedule.completions || schedule.completions.length === 0) return false;
  return schedule.completions.some((c) => {
    const d = c.completed_date?.split('T')[0] || c.completed_date;
    return d === dateStr;
  });
}

export function isCompletedToday(schedule) {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  return isCompletedOnDate(schedule, `${y}-${m}-${d}`);
}

export default function ScheduleItem({ schedule, onComplete, onUncomplete, onDelete, compact = false, checkDate }) {
  const completed = checkDate
    ? isCompletedOnDate(schedule, checkDate)
    : isCompletedToday(schedule);

  const handleToggle = () => {
    if (completed) {
      onUncomplete?.(schedule.id);
    } else {
      onComplete?.(schedule.id);
    }
  };

  if (compact) {
    return (
      <div className={`schedule-item-compact ${completed ? 'completed' : ''}`}>
        <button onClick={handleToggle} className="schedule-toggle-btn">
          {completed ? (
            <CheckCircle2 className="schedule-icon completed" />
          ) : (
            <Circle className="schedule-icon pending" />
          )}
        </button>
        <span className={`schedule-compact-title ${completed ? 'completed' : ''}`}>
          {schedule.title}
        </span>
        {schedule.start_time && (
          <span className="schedule-compact-time">{schedule.start_time}</span>
        )}
      </div>
    );
  }

  return (
    <div className={`schedule-item-card ${completed ? 'completed' : ''}`}>
      <button onClick={handleToggle} className="schedule-toggle-btn">
        {completed ? (
          <CheckCircle2 className="schedule-icon-large completed" />
        ) : (
          <Circle className="schedule-icon-large pending" />
        )}
      </button>

      <div className="schedule-item-content">
        <p className={`schedule-item-title ${completed ? 'completed' : ''}`}>
          {schedule.title}
        </p>
        {schedule.description && (
          <p className="schedule-item-description">{schedule.description}</p>
        )}
        <div className="schedule-item-meta">
          <span className="schedule-type-badge" style={{
            backgroundColor: typeColors[schedule.type].bg,
            color: typeColors[schedule.type].text
          }}>
            <Repeat style={{ width: '0.75rem', height: '0.75rem', display: 'inline', marginRight: '0.25rem' }} />
            {schedule.type}
          </span>
          {schedule.start_time && (
            <span className="schedule-time-badge">
              <Clock style={{ width: '0.75rem', height: '0.75rem' }} />
              {schedule.start_time}
              {schedule.end_time && ` - ${schedule.end_time}`}
            </span>
          )}
          <span className="schedule-exp-badge">+{schedule.exp_reward} EXP</span>
        </div>
      </div>

      <button
        onClick={() => onDelete?.(schedule.id)}
        className="schedule-delete-btn"
      >
        <Trash2 style={{ width: '1rem', height: '1rem' }} />
      </button>
    </div>
  );
}

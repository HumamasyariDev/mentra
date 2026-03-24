import { CheckCircle2, Circle, Trash2, Pencil } from 'lucide-react';
import '../../styles/components/schedules/ScheduleComponents.css';

const typeLabels = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
};

export const formatTime = (time) => {
  if (!time) return null;
  const [h, m] = time.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const display = hour % 12 || 12;
  return `${display}:${m} ${ampm}`;
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

export default function ScheduleItem({
  schedule,
  onComplete,
  onUncomplete,
  onDelete,
  onEdit,
  compact = false,
  checkDate,
  hideType = false,
}) {
  const completed = checkDate
    ? isCompletedOnDate(schedule, checkDate)
    : isCompletedToday(schedule);

  const canToggle = !!(onComplete || onUncomplete);

  const handleToggle = () => {
    if (!canToggle) return;
    if (completed) {
      onUncomplete?.(schedule.id);
    } else {
      onComplete?.(schedule.id);
    }
  };

  const timeDisplay = formatTime(schedule.start_time);
  const endDisplay = formatTime(schedule.end_time);
  const typeLabel = typeLabels[schedule.type] || 'Daily';

  if (compact) {
    return (
      <div className={`schedule-compact-item ${completed ? 'completed' : ''}`}>
        <button
          onClick={handleToggle}
          className="schedule-compact-toggle"
          disabled={!canToggle}
        >
          {completed ? (
            <CheckCircle2 className="schedule-icon done" />
          ) : (
            <Circle className="schedule-icon pending" />
          )}
        </button>
        <span className={`schedule-compact-title ${completed ? 'done' : ''}`}>
          {schedule.title}
        </span>
        {timeDisplay && (
          <span className="schedule-compact-time">{timeDisplay}</span>
        )}
      </div>
    );
  }

  return (
    <div className={`schedule-agenda-card ${completed ? 'completed' : ''}`}>
      <button
        onClick={handleToggle}
        className={`schedule-agenda-toggle ${!canToggle ? 'disabled' : ''}`}
        disabled={!canToggle}
      >
        {completed ? (
          <CheckCircle2 className="schedule-icon done" />
        ) : (
          <Circle className="schedule-icon pending" />
        )}
      </button>

      <div className="schedule-agenda-time-col">
        {timeDisplay ? (
          <span className="schedule-agenda-time">{timeDisplay}</span>
        ) : (
          <span className="schedule-agenda-time no-time">--:--</span>
        )}
        {endDisplay && (
          <span className="schedule-agenda-end-time">to {endDisplay}</span>
        )}
      </div>

      <div className="schedule-agenda-content">
        <p className={`schedule-agenda-title ${completed ? 'done' : ''}`}>
          {schedule.title}
        </p>
        {schedule.description && (
          <p className="schedule-agenda-desc">{schedule.description}</p>
        )}
        {!hideType && (
          <span className={`schedule-agenda-type ${schedule.type}`}>{typeLabel}</span>
        )}
      </div>

      <div className="schedule-agenda-actions">
        {onEdit && (
          <button
            onClick={() => onEdit(schedule)}
            className="schedule-agenda-action-btn edit"
          >
            <Pencil className="schedule-agenda-action-icon" />
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(schedule.id)}
            className="schedule-agenda-action-btn delete"
          >
            <Trash2 className="schedule-agenda-action-icon" />
          </button>
        )}
      </div>
    </div>
  );
}

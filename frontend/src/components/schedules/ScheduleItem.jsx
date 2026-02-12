import { CheckCircle2, Circle, Trash2, Clock, Repeat } from 'lucide-react';

const typeColors = {
  daily: 'bg-blue-100 text-blue-700',
  weekly: 'bg-purple-100 text-purple-700',
  monthly: 'bg-amber-100 text-amber-700',
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
      <div className={`flex items-center gap-2 py-1.5 ${completed ? 'opacity-50' : ''}`}>
        <button onClick={handleToggle} className="flex-shrink-0">
          {completed ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 hover:text-amber-500 transition-colors" />
          ) : (
            <Circle className="w-4 h-4 text-slate-300 hover:text-indigo-500 transition-colors" />
          )}
        </button>
        <span className={`text-xs truncate flex-1 ${completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
          {schedule.title}
        </span>
        {schedule.start_time && (
          <span className="text-[10px] text-slate-400">{schedule.start_time}</span>
        )}
      </div>
    );
  }

  return (
    <div className={`card flex items-start gap-3 p-4 ${completed ? 'opacity-60' : ''}`}>
      <button onClick={handleToggle} className="mt-0.5 flex-shrink-0">
        {completed ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-500 hover:text-amber-500 transition-colors" />
        ) : (
          <Circle className="w-5 h-5 text-slate-300 hover:text-indigo-500 transition-colors" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`font-medium ${completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
          {schedule.title}
        </p>
        {schedule.description && (
          <p className="text-sm text-slate-500 mt-0.5">{schedule.description}</p>
        )}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColors[schedule.type]}`}>
            <Repeat className="w-3 h-3 inline mr-1" />
            {schedule.type}
          </span>
          {schedule.start_time && (
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {schedule.start_time}
              {schedule.end_time && ` - ${schedule.end_time}`}
            </span>
          )}
          <span className="text-xs text-indigo-500 font-medium">+{schedule.exp_reward} EXP</span>
        </div>
      </div>

      <button
        onClick={() => onDelete?.(schedule.id)}
        className="text-slate-300 hover:text-red-500 transition-colors flex-shrink-0"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

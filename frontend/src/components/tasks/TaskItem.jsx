import { CheckCircle2, Circle, Trash2, Clock } from 'lucide-react';

const priorityColors = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
};

export default function TaskItem({ task, onComplete, onUncomplete, onDelete, compact = false }) {
  const isCompleted = task.status === 'completed';

  const handleToggle = () => {
    if (isCompleted) {
      onUncomplete?.(task.id);
    } else {
      onComplete?.(task.id);
    }
  };

  if (compact) {
    return (
      <div
        className={`flex items-center gap-2 py-1.5 group ${isCompleted ? 'opacity-50' : ''}`}
      >
        <button onClick={handleToggle} className="flex-shrink-0">
          {isCompleted ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 hover:text-amber-500 transition-colors" />
          ) : (
            <Circle className="w-4 h-4 text-slate-300 hover:text-indigo-500 transition-colors" />
          )}
        </button>
        <span
          className={`text-xs truncate flex-1 ${
            isCompleted ? 'line-through text-slate-400' : 'text-slate-700'
          }`}
        >
          {task.title}
        </span>
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${priorityColors[task.priority]}`}>
          {task.priority[0].toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`card flex items-start gap-3 p-4 ${isCompleted ? 'opacity-60' : ''}`}
    >
      <button onClick={handleToggle} className="mt-0.5 flex-shrink-0">
        {isCompleted ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-500 hover:text-amber-500 transition-colors" />
        ) : (
          <Circle className="w-5 h-5 text-slate-300 hover:text-indigo-500 transition-colors" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p
          className={`font-medium ${
            isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
          }`}
        >
          {task.title}
        </p>
        {task.description && (
          <p className="text-sm text-slate-500 mt-0.5 truncate">{task.description}</p>
        )}
        <div className="flex items-center gap-2 mt-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
          {task.due_date && (
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(task.due_date).toLocaleDateString()}
            </span>
          )}
          <span className="text-xs text-indigo-500 font-medium">+{task.exp_reward} EXP</span>
        </div>
      </div>

      <button
        onClick={() => onDelete?.(task.id)}
        className="text-slate-300 hover:text-red-500 transition-colors flex-shrink-0"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

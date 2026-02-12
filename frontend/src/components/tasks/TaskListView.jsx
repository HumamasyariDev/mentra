import { useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import TaskItem from './TaskItem';

const statusFilters = ['all', 'pending', 'in_progress', 'completed'];

export default function TaskListView({ tasks, isLoading, onComplete, onUncomplete, onDelete }) {
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all'
    ? tasks
    : tasks?.filter((t) => t.status === filter);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {statusFilters.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === s
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {s === 'all' ? 'All' : s.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
        </div>
      ) : filtered?.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No tasks found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered?.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onComplete={onComplete}
              onUncomplete={onUncomplete}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

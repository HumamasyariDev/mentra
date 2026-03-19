import { useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import TaskItem from './TaskItem';
import '../../styles/components/tasks/TaskComponents.css';

const statusFilters = ['all', 'pending', 'in_progress', 'completed'];

export default function TaskListView({ tasks, isLoading, onComplete, onUncomplete, onDelete }) {
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all'
    ? tasks
    : tasks?.filter((t) => t.status === filter);

  return (
    <div className="task-list-wrapper">
      {/* Filters */}
      <div className="task-list-filters">
        {statusFilters.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`task-filter-btn ${filter === s ? 'active' : ''}`}
          >
            {s === 'all' ? 'All' : s.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="task-list-loading">
          <Loader2 className="task-list-loading-spinner" />
        </div>
      ) : filtered?.length === 0 ? (
        <div className="task-list-empty">
          <CheckCircle2 style={{ width: '3rem', height: '3rem', margin: '0 auto', opacity: 0.4 }} />
          <p>No tasks found</p>
        </div>
      ) : (
        <div className="task-list-container">
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

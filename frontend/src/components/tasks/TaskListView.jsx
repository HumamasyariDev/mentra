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
    <div className="task-list-container">
      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {statusFilters.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              padding: '0.375rem 0.75rem',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              transition: 'all 0.2s',
              border: filter === s ? 'none' : '1px solid #e2e8f0',
              backgroundColor: filter === s ? '#eef2ff' : '#ffffff',
              color: filter === s ? '#4338ca' : '#475569',
              cursor: 'pointer'
            }}
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
          <CheckCircle2 style={{ width: '3rem', height: '3rem', margin: '0 auto 0.75rem', opacity: 0.5 }} />
          <p>No tasks found</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
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

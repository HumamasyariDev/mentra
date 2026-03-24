import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import TaskItem from './TaskItem';
import '../../styles/components/tasks/TaskComponents.css';

const statusFilters = ['all', 'pending', 'in_progress', 'completed'];

const statusKeyMap = {
  all: 'all',
  pending: 'status.pending',
  in_progress: 'status.inProgress',
  completed: 'status.completed',
};

export default function TaskListView({ tasks, isLoading, onComplete, onUncomplete, onDelete, pagination, onPageChange }) {
  const { t } = useTranslation(['tasks', 'common']);
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
            {s === 'all' ? t('common:all') : t(`common:${statusKeyMap[s]}`)}
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
          <p>{t('tasks:listView.noTasksFound')}</p>
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

      {/* Pagination */}
      {!isLoading && pagination?.last_page > 1 && (
        <div className="task-pagination">
          <button 
            className="task-pagination-btn" 
            disabled={pagination.current_page === 1}
            onClick={() => onPageChange(pagination.current_page - 1)}
          >
            <ChevronLeft size={16} />
            {t('common:prev')}
          </button>
          <div className="task-pagination-info">
            {t('tasks:listView.pageOf', { current: pagination.current_page, last: pagination.last_page })}
          </div>
          <button 
            className="task-pagination-btn" 
            disabled={pagination.current_page === pagination.last_page}
            onClick={() => onPageChange(pagination.current_page + 1)}
          >
            {t('common:next')}
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

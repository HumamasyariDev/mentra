import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import TaskItem from './TaskItem';
import '../../styles/components/tasks/TaskComponents.css';

const columnKeys = [
  { key: 'pending', color: '#94a3b8', accent: '#475569' },
  { key: 'in_progress', color: '#60a5fa', accent: '#2563eb' },
  { key: 'completed', color: '#34d399', accent: '#059669' },
];

const statusLabelMap = {
  pending: 'status.pending',
  in_progress: 'status.inProgress',
  completed: 'status.completed',
};

export default function TaskBoardView({ tasks, isLoading, onComplete, onUncomplete, onDelete, onUpdateStatus }) {
  const { t } = useTranslation(['tasks', 'common']);
  const [dragOverCol, setDragOverCol] = useState(null);
  const cardRefs = useRef({});

  if (isLoading) {
    return (
      <div className="task-loading">
        <Loader2 className="task-loading-spinner" />
      </div>
    );
  }

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, colKey) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCol(colKey);
  };

  const handleDragLeave = () => {
    setDragOverCol(null);
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    setDragOverCol(null);
    const taskId = parseInt(e.dataTransfer.getData('text/plain'), 10);
    const task = tasks?.find((t) => t.id === taskId);
    if (!task || task.status === targetStatus) return;

    if (targetStatus === 'completed') {
      const cardEl = cardRefs.current[taskId];
      onComplete?.(taskId, cardEl || null);
    } else {
      onUpdateStatus?.(taskId, { status: targetStatus });
    }
  };

  return (
    <div className="task-board-grid">
      {columnKeys.map((col) => {
        const colTasks = tasks?.filter((t) => t.status === col.key) || [];
        const isDragOver = dragOverCol === col.key;

        return (
          <div
            key={col.key}
            className={`task-board-column ${isDragOver ? 'drag-over' : ''}`}
            onDragOver={(e) => handleDragOver(e, col.key)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.key)}
          >
            {/* Column header */}
            <div className="task-board-col-header">
              <span className="task-board-col-indicator" style={{ background: col.color }} />
              <h3 className="task-board-col-title">{t(`common:${statusLabelMap[col.key]}`)}</h3>
              <span className="task-board-col-count">{colTasks.length}</span>
            </div>

            {/* Column tasks */}
            <div className="task-board-col-body">
              {colTasks.length === 0 ? (
                <div className={`task-board-empty ${isDragOver ? 'drop-active' : ''}`}>
                  {isDragOver ? t('tasks:boardView.dropHere') : t('tasks:boardView.noTasks')}
                </div>
              ) : (
                colTasks.map((task) => (
                  <div
                    key={task.id}
                    ref={(el) => { if (el) cardRefs.current[task.id] = el; }}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    className="task-board-item"
                  >
                    <TaskItem
                      task={task}
                      onComplete={onComplete}
                      onUncomplete={onUncomplete}
                      onDelete={onDelete}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

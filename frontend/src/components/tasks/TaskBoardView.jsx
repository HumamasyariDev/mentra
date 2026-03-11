import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import TaskItem from './TaskItem';
import '../../styles/components/tasks/TaskComponents.css';

const columns = [
  { key: 'pending', label: 'Pending', color: '#cbd5e1', bg: '#f8fafc' },
  { key: 'in_progress', label: 'In Progress', color: '#60a5fa', bg: '#eff6ff' },
  { key: 'completed', label: 'Completed', color: '#34d399', bg: '#ecfdf5' },
];

export default function TaskBoardView({ tasks, isLoading, onComplete, onUncomplete, onDelete, onUpdateStatus }) {
  const [dragOverCol, setDragOverCol] = useState(null);

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
      onComplete?.(taskId);
    } else {
      onUpdateStatus?.(taskId, { status: targetStatus });
    }
  };

  return (
    <div className="task-board-grid">
      {columns.map((col) => {
        const colTasks = tasks?.filter((t) => t.status === col.key) || [];
        const isDragOver = dragOverCol === col.key;

        return (
          <div
            key={col.key}
            className="task-board-column"
            onDragOver={(e) => handleDragOver(e, col.key)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.key)}
          >
            {/* Column header */}
            <div className="task-board-header" style={{ backgroundColor: col.bg, borderLeftColor: col.color }}>
              <h3 className="task-board-title">{col.label}</h3>
              <span className="task-board-count">
                {colTasks.length}
              </span>
            </div>

            {/* Column tasks */}
            <div
              className={`task-board-content ${isDragOver ? 'drag-over' : ''}`}
            >
              {colTasks.length === 0 && !isDragOver ? (
                <div className="task-board-empty">
                  No tasks
                </div>
              ) : colTasks.length === 0 && isDragOver ? (
                <div className="task-board-drop-zone">
                  Drop here
                </div>
              ) : (
                colTasks.map((task) => (
                  <div
                    key={task.id}
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

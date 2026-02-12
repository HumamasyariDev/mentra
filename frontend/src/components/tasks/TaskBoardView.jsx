import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import TaskItem from './TaskItem';

const columns = [
  { key: 'pending', label: 'Pending', color: 'border-slate-300', bg: 'bg-slate-50' },
  { key: 'in_progress', label: 'In Progress', color: 'border-blue-400', bg: 'bg-blue-50' },
  { key: 'completed', label: 'Completed', color: 'border-emerald-400', bg: 'bg-emerald-50' },
];

export default function TaskBoardView({ tasks, isLoading, onComplete, onUncomplete, onDelete, onUpdateStatus }) {
  const [dragOverCol, setDragOverCol] = useState(null);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {columns.map((col) => {
        const colTasks = tasks?.filter((t) => t.status === col.key) || [];
        const isDragOver = dragOverCol === col.key;

        return (
          <div
            key={col.key}
            className="flex flex-col"
            onDragOver={(e) => handleDragOver(e, col.key)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.key)}
          >
            {/* Column header */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${col.bg} border-l-4 ${col.color} mb-3`}>
              <h3 className="text-sm font-semibold text-slate-700">{col.label}</h3>
              <span className="text-xs bg-white text-slate-500 px-2 py-0.5 rounded-full font-medium">
                {colTasks.length}
              </span>
            </div>

            {/* Column tasks */}
            <div
              className={`space-y-2 flex-1 min-h-[100px] rounded-xl p-1 transition-colors ${
                isDragOver ? 'bg-indigo-50 ring-2 ring-indigo-300 ring-dashed' : ''
              }`}
            >
              {colTasks.length === 0 && !isDragOver ? (
                <div className="text-center py-8 text-slate-300 text-sm border-2 border-dashed border-slate-200 rounded-xl">
                  No tasks
                </div>
              ) : colTasks.length === 0 && isDragOver ? (
                <div className="text-center py-8 text-indigo-400 text-sm border-2 border-dashed border-indigo-300 rounded-xl">
                  Drop here
                </div>
              ) : (
                colTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    className="cursor-grab active:cursor-grabbing"
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

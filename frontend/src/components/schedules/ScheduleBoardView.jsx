import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import ScheduleItem from './ScheduleItem';

const columns = [
  { key: 'daily', label: 'Daily', color: 'border-blue-400', bg: 'bg-blue-50' },
  { key: 'weekly', label: 'Weekly', color: 'border-purple-400', bg: 'bg-purple-50' },
  { key: 'monthly', label: 'Monthly', color: 'border-amber-400', bg: 'bg-amber-50' },
];

export default function ScheduleBoardView({ schedules, isLoading, onComplete, onUncomplete, onDelete, onUpdateType }) {
  const [dragOverCol, setDragOverCol] = useState(null);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
      </div>
    );
  }

  const handleDragStart = (e, scheduleId) => {
    e.dataTransfer.setData('text/plain', scheduleId.toString());
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

  const handleDrop = (e, targetType) => {
    e.preventDefault();
    setDragOverCol(null);
    const scheduleId = parseInt(e.dataTransfer.getData('text/plain'), 10);
    const schedule = schedules?.find((s) => s.id === scheduleId);
    if (!schedule || schedule.type === targetType) return;

    onUpdateType?.(scheduleId, { type: targetType });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {columns.map((col) => {
        const colSchedules = schedules?.filter((s) => s.type === col.key) || [];
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
                {colSchedules.length}
              </span>
            </div>

            {/* Column schedules */}
            <div
              className={`space-y-2 flex-1 min-h-[100px] rounded-xl p-1 transition-colors ${
                isDragOver ? 'bg-indigo-50 ring-2 ring-indigo-300 ring-dashed' : ''
              }`}
            >
              {colSchedules.length === 0 && !isDragOver ? (
                <div className="text-center py-8 text-slate-300 text-sm border-2 border-dashed border-slate-200 rounded-xl">
                  No schedules
                </div>
              ) : colSchedules.length === 0 && isDragOver ? (
                <div className="text-center py-8 text-indigo-400 text-sm border-2 border-dashed border-indigo-300 rounded-xl">
                  Drop here
                </div>
              ) : (
                colSchedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, schedule.id)}
                    className="cursor-grab active:cursor-grabbing"
                  >
                    <ScheduleItem
                      schedule={schedule}
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

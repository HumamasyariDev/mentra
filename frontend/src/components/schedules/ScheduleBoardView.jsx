import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import ScheduleItem from './ScheduleItem';
import '../../styles/components/schedules/ScheduleComponents.css';

const columns = [
  { key: 'daily', label: 'Daily', color: '#60a5fa', bg: '#eff6ff' },
  { key: 'weekly', label: 'Weekly', color: '#a78bfa', bg: '#f5f3ff' },
  { key: 'monthly', label: 'Monthly', color: '#fbbf24', bg: '#fffbeb' },
];

export default function ScheduleBoardView({ schedules, isLoading, onComplete, onUncomplete, onDelete, onUpdateType }) {
  const [dragOverCol, setDragOverCol] = useState(null);

  if (isLoading) {
    return (
      <div className="schedule-loading">
        <Loader2 className="schedule-loading-spinner" />
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
    <div className="schedule-board-grid">
      {columns.map((col) => {
        const colSchedules = schedules?.filter((s) => s.type === col.key) || [];
        const isDragOver = dragOverCol === col.key;

        return (
          <div
            key={col.key}
            className="schedule-board-column"
            onDragOver={(e) => handleDragOver(e, col.key)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.key)}
          >
            {/* Column header */}
            <div className="schedule-board-header" style={{ backgroundColor: col.bg, borderLeftColor: col.color }}>
              <h3 className="schedule-board-title">{col.label}</h3>
              <span className="schedule-board-count">
                {colSchedules.length}
              </span>
            </div>

            {/* Column schedules */}
            <div
              className={`schedule-board-content ${isDragOver ? 'drag-over' : ''}`}
            >
              {colSchedules.length === 0 && !isDragOver ? (
                <div className="schedule-board-empty">
                  No schedules
                </div>
              ) : colSchedules.length === 0 && isDragOver ? (
                <div className="schedule-board-drop-zone">
                  Drop here
                </div>
              ) : (
                colSchedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, schedule.id)}
                    className="schedule-board-item"
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

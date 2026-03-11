import { useState } from 'react';
import { Calendar, Loader2 } from 'lucide-react';
import ScheduleItem from './ScheduleItem';
import '../../styles/components/schedules/ScheduleComponents.css';

const typeFilters = ['', 'daily', 'weekly', 'monthly'];

export default function ScheduleListView({ schedules, isLoading, onComplete, onUncomplete, onDelete }) {
  const [typeFilter, setTypeFilter] = useState('');

  const filtered = typeFilter
    ? schedules?.filter((s) => s.type === typeFilter)
    : schedules;

  return (
    <div className="schedule-list-view">
      {/* Type Filters */}
      <div className="schedule-filters">
        {typeFilters.map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`schedule-filter-btn ${typeFilter === t ? 'active' : ''}`}
          >
            {t === '' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="schedule-loading">
          <Loader2 className="schedule-loading-spinner" />
        </div>
      ) : filtered?.length === 0 ? (
        <div className="schedule-list-empty">
          <Calendar style={{ width: '3rem', height: '3rem', margin: '0 auto 0.75rem', opacity: '0.5' }} />
          <p>No schedules yet</p>
        </div>
      ) : (
        <div className="schedule-list">
          {filtered?.map((schedule) => (
            <ScheduleItem
              key={schedule.id}
              schedule={schedule}
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

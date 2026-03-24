import { useState, useMemo } from 'react';
import { Calendar, Loader2, Sunrise, Sun, Sunset, Clock } from 'lucide-react';
import ScheduleItem from './ScheduleItem';
import '../../styles/components/schedules/ScheduleComponents.css';

const typeOptions = [
  { value: '', label: 'All Types' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

const timeGroups = [
  { key: 'morning', label: 'Morning', Icon: Sunrise },
  { key: 'afternoon', label: 'Afternoon', Icon: Sun },
  { key: 'evening', label: 'Evening', Icon: Sunset },
  { key: 'anytime', label: 'Anytime', Icon: Clock },
];

function getTimeGroup(schedule) {
  if (!schedule.start_time) return 'anytime';
  const hour = parseInt(schedule.start_time.split(':')[0], 10);
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

export default function ScheduleListView({ schedules, isLoading, onComplete, onUncomplete, onDelete, onEdit }) {
  const [typeFilter, setTypeFilter] = useState('');

  const filtered = typeFilter
    ? schedules?.filter((s) => s.type === typeFilter)
    : schedules;

  const grouped = useMemo(() => {
    if (!filtered || filtered.length === 0) return {};

    const groups = {};
    for (const g of timeGroups) {
      groups[g.key] = [];
    }

    for (const s of filtered) {
      const group = getTimeGroup(s);
      groups[group].push(s);
    }

    // Sort each group by start_time (nulls last within group)
    for (const key of Object.keys(groups)) {
      groups[key].sort((a, b) => {
        if (!a.start_time && !b.start_time) return 0;
        if (!a.start_time) return 1;
        if (!b.start_time) return -1;
        return a.start_time.localeCompare(b.start_time);
      });
    }

    return groups;
  }, [filtered]);

  const hasItems = filtered && filtered.length > 0;

  return (
    <div className="schedule-list-wrapper">
      {/* Type Filter Dropdown */}
      <div className="schedule-list-toolbar">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="schedule-type-select"
        >
          {typeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="schedule-loading">
          <Loader2 className="schedule-loading-spinner" />
        </div>
      ) : !hasItems ? (
        <div className="schedule-list-empty">
          <Calendar style={{ width: '3rem', height: '3rem', opacity: 0.4 }} />
          <p>No schedules yet</p>
        </div>
      ) : (
        <div className="schedule-timeline">
          <div className="schedule-timeline-line" />

          {timeGroups.map(({ key, label, Icon }) => {
            const items = grouped[key];
            if (!items || items.length === 0) return null;

            return (
              <div key={key} className="schedule-time-group">
                {/* Group Header */}
                <div className="schedule-time-group-header">
                  <div className="schedule-timeline-node group-node" />
                  <Icon className="schedule-time-group-icon" />
                  <span className="schedule-time-group-label">{label}</span>
                  <span className="schedule-time-group-count">{items.length}</span>
                </div>

                {/* Items */}
                <div className="schedule-time-group-items">
                  {items.map((schedule) => (
                    <div key={schedule.id} className="schedule-timeline-item">
                      <div className="schedule-timeline-node item-node" />
                      <ScheduleItem
                        schedule={schedule}
                        onComplete={onComplete}
                        onUncomplete={onUncomplete}
                        onDelete={onDelete}
                        onEdit={onEdit}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

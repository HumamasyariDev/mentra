import { useState } from 'react';
import { Calendar, Loader2 } from 'lucide-react';
import ScheduleItem from './ScheduleItem';

const typeFilters = ['', 'daily', 'weekly', 'monthly'];

export default function ScheduleListView({ schedules, isLoading, onComplete, onUncomplete, onDelete }) {
  const [typeFilter, setTypeFilter] = useState('');

  const filtered = typeFilter
    ? schedules?.filter((s) => s.type === typeFilter)
    : schedules;

  return (
    <div className="space-y-4">
      {/* Type Filters */}
      <div className="flex gap-2">
        {typeFilters.map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              typeFilter === t
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {t === '' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
        </div>
      ) : filtered?.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No schedules yet</p>
        </div>
      ) : (
        <div className="space-y-2">
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

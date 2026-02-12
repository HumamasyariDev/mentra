import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { scheduleApi } from '../services/api';
import { Plus, X, List, CalendarDays, Columns3 } from 'lucide-react';
import ScheduleCreateForm from '../components/schedules/ScheduleCreateForm';
import ScheduleListView from '../components/schedules/ScheduleListView';
import ScheduleCalendarView from '../components/schedules/ScheduleCalendarView';
import ScheduleBoardView from '../components/schedules/ScheduleBoardView';

const views = [
  { key: 'list', label: 'List', icon: List },
  { key: 'calendar', label: 'Calendar', icon: CalendarDays },
  { key: 'board', label: 'Board', icon: Columns3 },
];

export default function Schedules() {
  const queryClient = useQueryClient();
  const [activeView, setActiveView] = useState('list');
  const [showForm, setShowForm] = useState(false);

  const { data: schedules, isLoading } = useQuery({
    queryKey: ['schedules', activeView === 'calendar' ? 'all-completions' : 'today'],
    queryFn: () =>
      scheduleApi
        .list(activeView === 'calendar' ? { with_all_completions: true } : {})
        .then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data) => scheduleApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setShowForm(false);
    },
  });

  const completeMutation = useMutation({
    mutationFn: (id) => scheduleApi.complete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => scheduleApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const updateTypeMutation = useMutation({
    mutationFn: ({ id, data }) => scheduleApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const handleCreate = (formData, resetForm) => {
    createMutation.mutate(formData, { onSuccess: resetForm });
  };

  const uncompleteMutation = useMutation({
    mutationFn: (id) => scheduleApi.uncomplete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const handleComplete = (id) => completeMutation.mutate(id);
  const handleUncomplete = (id) => uncompleteMutation.mutate(id);
  const handleDelete = (id) => deleteMutation.mutate(id);
  const handleUpdateType = (id, data) => updateTypeMutation.mutate({ id, data });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Schedules</h1>
          <p className="text-slate-500 text-sm mt-1">Build habits and routines</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'New Schedule'}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <ScheduleCreateForm onSubmit={handleCreate} isPending={createMutation.isPending} />
      )}

      {/* View Tabs */}
      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 w-fit">
        {views.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveView(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeView === key
                ? 'bg-indigo-500 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Active View */}
      {activeView === 'list' && (
        <ScheduleListView
          schedules={schedules || []}
          isLoading={isLoading}
          onComplete={handleComplete}
          onUncomplete={handleUncomplete}
          onDelete={handleDelete}
        />
      )}
      {activeView === 'calendar' && (
        <ScheduleCalendarView
          schedules={schedules || []}
          isLoading={isLoading}
          onComplete={handleComplete}
          onUncomplete={handleUncomplete}
          onDelete={handleDelete}
        />
      )}
      {activeView === 'board' && (
        <ScheduleBoardView
          schedules={schedules || []}
          isLoading={isLoading}
          onComplete={handleComplete}
          onUncomplete={handleUncomplete}
          onDelete={handleDelete}
          onUpdateType={handleUpdateType}
        />
      )}
    </div>
  );
}

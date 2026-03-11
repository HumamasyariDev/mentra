import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { scheduleApi } from '../services/api';
import { Plus, X, List, CalendarDays, Columns3 } from 'lucide-react';
import '../styles/pages/Schedules.css';
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
    <div className="schedules-page">
      {/* Header */}
      <div className="schedules-header">
        <div className="schedules-header-content">
          <h1 className="schedules-title">Schedules</h1>
          <p className="schedules-subtitle">Build habits and routines</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="schedules-action-btn"
        >
          {showForm ? <X style={{ width: '1rem', height: '1rem' }} /> : <Plus style={{ width: '1rem', height: '1rem' }} />}
          {showForm ? 'Cancel' : 'New Schedule'}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <ScheduleCreateForm onSubmit={handleCreate} isPending={createMutation.isPending} />
      )}

      {/* View Tabs */}
      <div className="schedules-view-tabs">
        {views.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveView(key)}
            className={`schedules-view-tab ${activeView === key ? 'active' : ''}`}
          >
            <Icon style={{ width: '1rem', height: '1rem' }} />
            <span className="schedules-view-label">{label}</span>
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

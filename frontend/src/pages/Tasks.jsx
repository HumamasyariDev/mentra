import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApi } from '../services/api';
import { Plus, X, List, CalendarDays, Columns3 } from 'lucide-react';
import TaskCreateForm from '../components/tasks/TaskCreateForm';
import TaskListView from '../components/tasks/TaskListView';
import TaskCalendarView from '../components/tasks/TaskCalendarView';
import TaskBoardView from '../components/tasks/TaskBoardView';

const views = [
  { key: 'list', label: 'List', icon: List },
  { key: 'calendar', label: 'Calendar', icon: CalendarDays },
  { key: 'board', label: 'Board', icon: Columns3 },
];

export default function Tasks() {
  const queryClient = useQueryClient();
  const [activeView, setActiveView] = useState('list');
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['tasks', 'all'],
    queryFn: () => taskApi.list({ per_page: 100 }).then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data) => taskApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setShowForm(false);
    },
  });

  const completeMutation = useMutation({
    mutationFn: (id) => taskApi.complete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => taskApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, data }) => taskApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const handleCreate = (formData, resetForm) => {
    createMutation.mutate(formData, { onSuccess: resetForm });
  };

  const uncompleteMutation = useMutation({
    mutationFn: (id) => taskApi.uncomplete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const handleComplete = (id) => completeMutation.mutate(id);
  const handleUncomplete = (id) => uncompleteMutation.mutate(id);
  const handleDelete = (id) => deleteMutation.mutate(id);
  const handleUpdateStatus = (id, data) => updateStatusMutation.mutate({ id, data });

  const tasks = data?.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tasks</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your tasks and earn EXP</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'New Task'}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <TaskCreateForm onSubmit={handleCreate} isPending={createMutation.isPending} />
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
        <TaskListView
          tasks={tasks}
          isLoading={isLoading}
          onComplete={handleComplete}
          onUncomplete={handleUncomplete}
          onDelete={handleDelete}
        />
      )}
      {activeView === 'calendar' && (
        <TaskCalendarView
          tasks={tasks}
          isLoading={isLoading}
          onComplete={handleComplete}
          onUncomplete={handleUncomplete}
          onDelete={handleDelete}
        />
      )}
      {activeView === 'board' && (
        <TaskBoardView
          tasks={tasks}
          isLoading={isLoading}
          onComplete={handleComplete}
          onUncomplete={handleUncomplete}
          onDelete={handleDelete}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
}

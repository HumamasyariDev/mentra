/**
 * Tasks.jsx
 * ----------
 * Main Tasks page. When a task is completed, the GameWorld cutscene
 * overlay plays on top of this page before refreshing the task list.
 */
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApi } from '../services/api';
import { Plus, X, List, CalendarDays, Columns3, TreePine } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TaskCreateForm from '../components/tasks/TaskCreateForm';
import TaskListView from '../components/tasks/TaskListView';
import TaskCalendarView from '../components/tasks/TaskCalendarView';
import TaskBoardView from '../components/tasks/TaskBoardView';
import GameWorld from '../components/gameworld/GameWorld';
import '../styles/pages/Tasks.css';

const views = [
  { key: 'list', label: 'List', icon: List },
  { key: 'calendar', label: 'Calendar', icon: CalendarDays },
  { key: 'board', label: 'Board', icon: Columns3 },
];

export default function Tasks() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('list');
  const [showForm, setShowForm] = useState(false);

  /* ===== Listen for Agent task events (from MentraAgent) ===== */
  useEffect(() => {
    const refresh = () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    };
    window.addEventListener('mentra:task-created',   refresh);
    window.addEventListener('mentra:task-completed', refresh);
    return () => {
      window.removeEventListener('mentra:task-created',   refresh);
      window.removeEventListener('mentra:task-completed', refresh);
    };
  }, [queryClient]);

  /* ===== Cutscene overlay state ===== */
  const [cutscene, setCutscene] = useState(null); // { task, element }

  const [page, setPage] = useState(1);
  const perPage = 10;

  const { data, isLoading } = useQuery({
    queryKey: ['tasks', 'all', page],
    queryFn: () => taskApi.list({ page, per_page: perPage }).then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data) => taskApi.create(data),
  });

  const completeMutation = useMutation({
    mutationFn: (id) => taskApi.complete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['tasks', 'all', page] });
      const previous = queryClient.getQueryData(['tasks', 'all', page]);
      queryClient.setQueryData(['tasks', 'all', page], (old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((t) =>
            t.id === id ? { ...t, status: 'completed', completed_at: new Date().toISOString() } : t
          ),
        };
      });
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) queryClient.setQueryData(['tasks', 'all', page], context.previous);
    },
    onSettled: () => {
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

  const handleCreate = (formData, resetForm, afterCreate) => {
    createMutation.mutate(formData, {
      onSuccess: async (response) => {
        if (afterCreate) {
          try {
            await afterCreate(response.data);
          } catch (err) {
            console.error('[Tasks] Post-create callback error:', err);
          }
        }
        resetForm();
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        setShowForm(false);
      },
    });
  };

  const uncompleteMutation = useMutation({
    mutationFn: (id) => taskApi.uncomplete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['tasks', 'all', page] });
      const previous = queryClient.getQueryData(['tasks', 'all', page]);
      queryClient.setQueryData(['tasks', 'all', page], (old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((t) =>
            t.id === id ? { ...t, status: 'pending', completed_at: null } : t
          ),
        };
      });
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) queryClient.setQueryData(['tasks', 'all', page], context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  /**
   * handleComplete — fires the API call AND triggers the cutscene overlay.
   * Receives both taskId and the card DOM element from TaskItem.
   */
  const handleComplete = (id, cardElement) => {
    // Find the task data
    const task = tasks.find((t) => t.id === id);

    // Fire the API mutation
    completeMutation.mutate(id);

    // Only show fire cutscene for first-time completions (not already burned)
    const alreadyBurned = task?.exp_logs_count > 0;
    if (cardElement && task && !alreadyBurned) {
      setCutscene({ task, element: cardElement });
    }
  };

  /**
   * handleCutsceneFinish — called when the cutscene animation completes.
   * Clears the overlay and refreshes data.
   */
  const handleCutsceneFinish = () => {
    setCutscene(null);
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const handleUncomplete = (id) => uncompleteMutation.mutate(id);
  const handleDelete = (id) => deleteMutation.mutate(id);
  const handleUpdateStatus = (id, data) => updateStatusMutation.mutate({ id, data });

  const tasks = data?.data || [];
  const pagination = {
    current_page: data?.current_page || 1,
    last_page: data?.last_page || 1,
    total: data?.total || 0,
    per_page: data?.per_page || perPage,
  };

  return (
    <>
      <div className="tasks-container">
        {/* Header */}
        <div className="tasks-header">
          <div className="tasks-header-info">
            <h1 className="tasks-title">Tasks</h1>
            <p className="tasks-subtitle">Manage your tasks and earn EXP</p>
          </div>
          <div className="tasks-header-actions">
            {/* Forest link */}
            <button
              onClick={() => navigate('/forest')}
              className="tasks-forest-btn"
            >
              <TreePine className="tasks-forest-icon" />
              Forest
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              className="tasks-new-btn"
            >
              {showForm ? <X className="tasks-new-icon" /> : <Plus className="tasks-new-icon" />}
              {showForm ? 'Cancel' : 'New Task'}
            </button>
          </div>
        </div>

        {/* Create Form */}
        {showForm && (
          <TaskCreateForm onSubmit={handleCreate} isPending={createMutation.isPending} />
        )}

        {/* View Tabs */}
        <div className="tasks-view-tabs">
          {views.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveView(key)}
              className={`tasks-view-tab ${activeView === key ? 'active' : 'inactive'}`}
            >
              <Icon className="tasks-view-tab-icon" />
              <span className="tasks-view-tab-label">{label}</span>
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
            pagination={pagination}
            onPageChange={setPage}
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

      {/* ===== Cutscene Overlay ===== */}
      {cutscene && (
        <GameWorld
          task={cutscene.task}
          cardElement={cutscene.element}
          onFinish={handleCutsceneFinish}
        />
      )}
    </>
  );
}

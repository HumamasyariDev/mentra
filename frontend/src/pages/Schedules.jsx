import { usePageTitle } from "../hooks/usePageTitle";
import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { scheduleApi } from '../services/api';
import { Plus, X, List, CalendarDays, Columns3, CheckCircle2 } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import ScheduleCreateForm from '../components/schedules/ScheduleCreateForm';
import ScheduleListView from '../components/schedules/ScheduleListView';
import ScheduleCalendarView from '../components/schedules/ScheduleCalendarView';
import ScheduleBoardView from '../components/schedules/ScheduleBoardView';
import ScheduleEditModal from '../components/schedules/ScheduleEditModal';
import { isCompletedToday } from '../components/schedules/ScheduleItem';
import '../styles/pages/Schedules.css';

const getSchedulesForToday = (schedules) => {

  const today = new Date();
  const dow = today.getDay();
  const dom = today.getDate();
  return (schedules || []).filter((s) => {
    if (!s.is_active) return false;
    if (s.type === 'daily') return true;
    if (s.type === 'weekly') return (s.days_of_week || []).includes(dow);
    if (s.type === 'monthly') return s.day_of_month === dom;
    return false;
  });
};

export default function Schedules() {
  usePageTitle('schedules:pageTitle');

  const { t } = useTranslation(['schedules', 'common']);
  const queryClient = useQueryClient();
  const toast = useToast();
  const [activeView, setActiveView] = useState('list');
  const [showForm, setShowForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);

  const views = [
    { key: 'list', label: t('common:list'), icon: List },
    { key: 'calendar', label: t('common:calendar'), icon: CalendarDays },
    { key: 'board', label: t('common:board'), icon: Columns3 },
  ];

  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ['schedules'],
    queryFn: () => scheduleApi.list({ with_all_completions: true }).then((r) => r.data),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['schedules'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const createMutation = useMutation({
    mutationFn: (data) => scheduleApi.create(data),
  });

  const todayStr = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }, []);

  const completeMutation = useMutation({
    mutationFn: (id) => scheduleApi.complete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['schedules'] });
      const previous = queryClient.getQueryData(['schedules']);
      queryClient.setQueryData(['schedules'], (old) =>
        (old || []).map((s) =>
          s.id === id
            ? {
                ...s,
                completions: [
                  ...(s.completions || []),
                  { completed_date: todayStr },
                ],
              }
            : s,
        ),
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['schedules'], context.previous);
      }
      toast.error(t('schedules:toast_complete_error'));
    },
    onSettled: invalidate,
  });

  const uncompleteMutation = useMutation({
    mutationFn: (id) => scheduleApi.uncomplete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['schedules'] });
      const previous = queryClient.getQueryData(['schedules']);
      queryClient.setQueryData(['schedules'], (old) =>
        (old || []).map((s) =>
          s.id === id
            ? {
                ...s,
                completions: (s.completions || []).filter(
                  (c) => (c.completed_date?.split('T')[0] || c.completed_date) !== todayStr,
                ),
              }
            : s,
        ),
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['schedules'], context.previous);
      }
      toast.error(t('schedules:toast_complete_error'));
    },
    onSettled: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => scheduleApi.delete(id),
    onSuccess: () => {
      invalidate();
      toast.success(t('schedules:toast_deleted'));
    },
    onError: () => {
      toast.error(t('schedules:toast_delete_error'));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => scheduleApi.update(id, data),
    onSuccess: () => {
      invalidate();
      setEditingSchedule(null);
      toast.success(t('schedules:toast_updated'));
    },
    onError: () => {
      toast.error(t('schedules:toast_update_error'));
    },
  });

  /* Today's progress stats */
  const todayStats = useMemo(() => {
    const todaySchedules = getSchedulesForToday(schedules);
    const completed = todaySchedules.filter((s) => isCompletedToday(s)).length;
    return { total: todaySchedules.length, completed };
  }, [schedules]);

  const handleCreate = (formData, resetForm) => {
    createMutation.mutate(formData, {
      onSuccess: () => {
        resetForm();
        invalidate();
        setShowForm(false);
        toast.success(t('schedules:toast_created'));
      },
      onError: () => {
        toast.error(t('schedules:toast_create_error'));
      },
    });
  };

  const handleComplete = (id) => completeMutation.mutate(id);
  const handleUncomplete = (id) => uncompleteMutation.mutate(id);

  const handleDelete = (id) => {
    if (window.confirm(t('schedules:deleteConfirm'))) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (schedule) => setEditingSchedule(schedule);
  const handleUpdate = (id, data) => updateMutation.mutate({ id, data });
  const handleUpdateType = (id, data) => updateMutation.mutate({ id, data });

  return (
    <div className="schedules-container">
      {/* Header */}
      <div className="schedules-header">
        <div className="schedules-header-info">
          <h1 className="schedules-title">{t('schedules:pageTitle')}</h1>
          <p className="schedules-subtitle">{t('schedules:pageSubtitle')}</p>
        </div>
        <div className="schedules-header-actions">
          <button
            onClick={() => setShowForm(!showForm)}
            className="schedules-new-btn"
          >
            {showForm ? (
              <X className="schedules-new-icon" />
            ) : (
              <Plus className="schedules-new-icon" />
            )}
            {showForm ? t('common:cancel') : t('schedules:newSchedule')}
          </button>
        </div>
      </div>

      {/* Today's Progress */}
      {todayStats.total > 0 && (
        <div className="schedules-progress">
          <div className="schedules-progress-info">
            <CheckCircle2 className="schedules-progress-icon" />
            <span className="schedules-progress-label">{t('common:today')}</span>
            <span className="schedules-progress-count">
              {todayStats.completed} / {todayStats.total}
            </span>
          </div>
          <div className="schedules-progress-bar">
            <div
              className={`schedules-progress-fill${todayStats.completed === todayStats.total ? ' complete' : ''}`}
              style={{
                width: `${(todayStats.completed / todayStats.total) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Create Form */}
      {showForm && (
        <ScheduleCreateForm
          onSubmit={handleCreate}
          isPending={createMutation.isPending}
        />
      )}

      {/* View Tabs */}
      <div className="schedules-view-tabs">
        {views.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveView(key)}
            className={`schedules-view-tab ${activeView === key ? 'active' : 'inactive'}`}
          >
            <Icon className="schedules-view-tab-icon" />
            <span className="schedules-view-tab-label">{label}</span>
          </button>
        ))}
      </div>

      {/* Active View */}
      {activeView === 'list' && (
        <ScheduleListView
          schedules={schedules}
          isLoading={isLoading}
          onComplete={handleComplete}
          onUncomplete={handleUncomplete}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      )}
      {activeView === 'calendar' && (
        <ScheduleCalendarView
          schedules={schedules}
          isLoading={isLoading}
          onComplete={handleComplete}
          onUncomplete={handleUncomplete}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      )}
      {activeView === 'board' && (
        <ScheduleBoardView
          schedules={schedules}
          isLoading={isLoading}
          onComplete={handleComplete}
          onUncomplete={handleUncomplete}
          onDelete={handleDelete}
          onEdit={handleEdit}
          onUpdateType={handleUpdateType}
        />
      )}

      {/* Edit Modal */}
      {editingSchedule && (
        <ScheduleEditModal
          schedule={editingSchedule}
          onSave={(data) => handleUpdate(editingSchedule.id, data)}
          onClose={() => setEditingSchedule(null)}
          isPending={updateMutation.isPending}
        />
      )}
    </div>
  );
}

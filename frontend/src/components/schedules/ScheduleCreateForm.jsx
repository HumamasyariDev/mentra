import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import '../../styles/components/schedules/ScheduleComponents.css';

const dayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

export default function ScheduleCreateForm({ onSubmit, isPending }) {
  const { t } = useTranslation(['schedules', 'common']);
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'daily',
    start_time: '',
    end_time: '',
    days_of_week: [],
    day_of_month: '',
  });

  const toggleDay = (day) => {
    setForm((prev) => ({
      ...prev,
      days_of_week: prev.days_of_week.includes(day)
        ? prev.days_of_week.filter((d) => d !== day)
        : [...prev.days_of_week, day],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...form };
    if (payload.days_of_week.length === 0) delete payload.days_of_week;
    if (!payload.day_of_month) delete payload.day_of_month;
    if (!payload.start_time) delete payload.start_time;
    if (!payload.end_time) delete payload.end_time;
    onSubmit(payload, () => {
      setForm({
        title: '',
        description: '',
        type: 'daily',
        start_time: '',
        end_time: '',
        days_of_week: [],
        day_of_month: '',
      });
    });
  };

  return (
    <form onSubmit={handleSubmit} className="schedule-create-form">
      <div className="schedule-create-form-grid">
        {/* Title */}
        <div className="schedule-form-group">
          <label className="schedule-form-label">{t('common:title')}</label>
          <input
            type="text"
            className="schedule-form-input"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder={t('schedules:createForm.titlePlaceholder')}
            required
          />
        </div>

        {/* Description */}
        <div className="schedule-form-group">
          <label className="schedule-form-label">{t('schedules:createForm.descriptionLabel')}</label>
          <textarea
            className="schedule-form-input schedule-form-textarea"
            rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder={t('schedules:createForm.descriptionPlaceholder')}
          />
        </div>

        {/* Type / Times row */}
        <div className="schedule-create-form-row">
          <div className="schedule-form-group">
            <label className="schedule-form-label">{t('common:type')}</label>
            <select
              className="schedule-form-input schedule-form-select"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="daily">{t('schedules:type.daily')}</option>
              <option value="weekly">{t('schedules:type.weekly')}</option>
              <option value="monthly">{t('schedules:type.monthly')}</option>
            </select>
          </div>
          <div className="schedule-form-group">
            <label className="schedule-form-label">{t('schedules:createForm.startTime')}</label>
            <input
              type="time"
              className="schedule-form-input"
              value={form.start_time}
              onChange={(e) => setForm({ ...form, start_time: e.target.value })}
            />
          </div>
          <div className="schedule-form-group">
            <label className="schedule-form-label">{t('schedules:createForm.endTime')}</label>
            <input
              type="time"
              className="schedule-form-input"
              value={form.end_time}
              onChange={(e) => setForm({ ...form, end_time: e.target.value })}
            />
          </div>
        </div>

        {/* Weekly: Days of Week */}
        {form.type === 'weekly' && (
          <div className="schedule-form-group">
            <label className="schedule-form-label">{t('schedules:createForm.daysOfWeek')}</label>
            <div className="schedule-days-grid">
              {dayKeys.map((key, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => toggleDay(i)}
                  className={`schedule-day-btn ${form.days_of_week.includes(i) ? 'selected' : ''}`}
                >
                  {t(`common:days.${key}`)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Monthly: Day of Month */}
        {form.type === 'monthly' && (
          <div className="schedule-form-group">
            <label className="schedule-form-label">{t('schedules:createForm.dayOfMonth')}</label>
            <input
              type="number"
              className="schedule-form-input schedule-day-input"
              min={1}
              max={31}
              value={form.day_of_month}
              onChange={(e) => setForm({ ...form, day_of_month: e.target.value })}
              placeholder={t('schedules:createForm.dayOfMonthPlaceholder')}
            />
          </div>
        )}

        {/* Submit */}
        <div className="schedule-form-actions">
          <button
            type="submit"
            className="schedule-form-btn schedule-form-btn-primary schedule-form-submit-btn"
            disabled={isPending}
          >
            {isPending && <Loader2 className="schedule-form-spinner" />}
            {t('schedules:createForm.createBtn')}
          </button>
        </div>
      </div>
    </form>
  );
}

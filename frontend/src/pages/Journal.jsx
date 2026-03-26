import { usePageTitle } from "../hooks/usePageTitle";
import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { journalApi } from '../services/api';
import {
  PenLine,
  Sparkles,
  TrendingUp,
  Eye,
  Lightbulb,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Loader2,
  Check,
} from 'lucide-react';
import '../styles/pages/Journal.css';

const moodEmojis = {
  happy: '😄', good: '🙂', neutral: '😐', stressed: '😰',
  sad: '😢', anxious: '😟', energetic: '⚡', tired: '😴',
  frustrated: '😤', grateful: '🙏',
};

const moodColors = {
  happy: '#22c55e', good: '#4ade80', neutral: '#94a3b8',
  stressed: '#f97316', sad: '#3b82f6', anxious: '#a855f7',
  energetic: '#eab308', tired: '#6b7280', frustrated: '#ef4444',
  grateful: '#ec4899',
};

const todayISO = () => new Date().toISOString().split('T')[0];

export default function JournalPage() {
  usePageTitle('journal:pageTitle');

  const { t, i18n } = useTranslation(['journal', 'common']);
  const queryClient = useQueryClient();
  const textareaRef = useRef(null);
  const [content, setContent] = useState('');
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [showRecent, setShowRecent] = useState(false);
  const [insightsData, setInsightsData] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState(false);

  const isToday = selectedDate === todayISO();

  // Fetch entry for the selected date
  const { data: dateEntry, isLoading: loadingEntry } = useQuery({
    queryKey: ['journal-entry', selectedDate],
    queryFn: () =>
      isToday
        ? journalApi.today().then((r) => r.data)
        : journalApi.byDate(selectedDate).then((r) => r.data),
  });

  // Fetch recent entries
  const { data: recentEntries } = useQuery({
    queryKey: ['journal-recent'],
    queryFn: () => journalApi.recent(14).then((r) => r.data),
  });

  // Populate textarea when entry loads (or clear if no entry for that date)
  useEffect(() => {
    if (dateEntry?.content) {
      setContent(dateEntry.content);
    } else {
      setContent('');
    }
  }, [dateEntry, selectedDate]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: (data) => journalApi.save(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entry', selectedDate] });
      queryClient.invalidateQueries({ queryKey: ['journal-recent'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const handleSave = () => {
    if (!content.trim()) return;
    saveMutation.mutate({ content: content.trim(), date: selectedDate });
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  // Date navigation helpers
  const goToPrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const goToNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    const next = d.toISOString().split('T')[0];
    // Don't go past today
    if (next <= todayISO()) {
      setSelectedDate(next);
    }
  };

  const goToToday = () => {
    setSelectedDate(todayISO());
  };

  const handleDateInput = (e) => {
    const val = e.target.value;
    if (val && val <= todayISO()) {
      setSelectedDate(val);
    }
  };

  // Format selected date for display
  const formattedSelectedDate = new Date(selectedDate + 'T00:00:00').toLocaleDateString(
    i18n.language === 'id' ? 'id-ID' : 'en-US',
    { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  );

  // Paper title changes based on whether we're looking at today
  const paperTitle = isToday
    ? t('journal:today.title')
    : t('journal:datePicker.title', { date: formattedSelectedDate });

  // AI Insights
  const fetchInsights = async () => {
    setInsightsLoading(true);
    setInsightsError(false);
    try {
      const res = await journalApi.insights();
      if (res.data.success && res.data.has_data) {
        setInsightsData(res.data);
      } else {
        setInsightsData(null);
      }
    } catch {
      setInsightsError(true);
    } finally {
      setInsightsLoading(false);
    }
  };

  // Format date for recent entries display
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return t('journal:recent.today');
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return t('journal:recent.yesterday');
    }
    return date.toLocaleDateString(i18n.language === 'id' ? 'id-ID' : 'en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get max score for trend chart scaling
  const maxScore = insightsData?.insights?.mood_trend?.length
    ? Math.max(...insightsData.insights.mood_trend.map(m => m.score))
    : 10;

  return (
    <div className="journal-page">
      <div className="journal-header">
        <div className="journal-header-text">
          <h1>{t('journal:pageTitle')}</h1>
          <p>{t('journal:pageSubtitle')}</p>
        </div>
      </div>

      {/* ── Date Navigator ── */}
      <div className="journal-date-nav">
        <button
          className="journal-date-arrow"
          onClick={goToPrevDay}
          aria-label="Previous day"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="journal-date-center">
          <Calendar size={15} className="journal-date-icon" />
          <input
            type="date"
            className="journal-date-input"
            value={selectedDate}
            max={todayISO()}
            onChange={handleDateInput}
          />
          <span className="journal-date-display">{formattedSelectedDate}</span>
        </div>

        <button
          className="journal-date-arrow"
          onClick={goToNextDay}
          disabled={isToday}
          aria-label="Next day"
        >
          <ChevronRight size={18} />
        </button>

        {!isToday && (
          <button className="journal-date-today-btn" onClick={goToToday}>
            {t('journal:datePicker.today')}
          </button>
        )}
      </div>

      {loadingEntry ? (
        <div className="journal-loading">
          <Loader2 className="journal-spinner" />
        </div>
      ) : (
        <div className="journal-content">
          {/* ── Left Column: Writing Area ── */}
          <div className="journal-write-col">
            {/* Paper */}
            <div className="journal-paper">
              <div className="journal-paper-header">
                <div className="journal-paper-title-row">
                  <PenLine size={18} className="journal-paper-icon" />
                  <h2>{paperTitle}</h2>
                </div>
                <div className="journal-paper-date">
                  {formattedSelectedDate}
                </div>
              </div>

              <textarea
                ref={textareaRef}
                className="journal-textarea"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={t('journal:today.placeholder')}
                rows={8}
              />

              <div className="journal-paper-footer">
                <span className="journal-word-count">
                  {t('journal:today.wordCount', { count: wordCount })}
                </span>
                <div className="journal-paper-actions">
                  {saveMutation.isSuccess && !saveMutation.isPending && (
                    <span className="journal-saved-badge">
                      <Check size={14} />
                      {t('journal:today.saved')}
                    </span>
                  )}
                  <button
                    onClick={handleSave}
                    className="journal-save-btn"
                    disabled={!content.trim() || saveMutation.isPending}
                  >
                    {saveMutation.isPending
                      ? t('journal:today.saving')
                      : dateEntry
                        ? t('journal:today.update')
                        : t('journal:today.save')}
                  </button>
                </div>
              </div>
            </div>

            {/* Past Entries */}
            {recentEntries && recentEntries.length > 0 && (
              <div className="journal-recent">
                <button
                  className="journal-recent-toggle"
                  onClick={() => setShowRecent(!showRecent)}
                >
                  <div className="journal-recent-toggle-left">
                    <Calendar size={16} />
                    <span>{t('journal:recent.title')}</span>
                    <span className="journal-recent-count">{recentEntries.length}</span>
                  </div>
                  {showRecent ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {showRecent && (
                  <div className="journal-recent-list">
                    {recentEntries
                      .filter(e => e.date !== selectedDate)
                      .map((entry) => (
                        <div
                          key={entry.id}
                          className="journal-recent-entry journal-recent-entry--clickable"
                          onClick={() => setSelectedDate(entry.date)}
                        >
                          <div className="journal-recent-date">{formatDate(entry.date)}</div>
                          <p className="journal-recent-text">{entry.content}</p>
                        </div>
                      ))}
                    {recentEntries.filter(e => e.date !== selectedDate).length === 0 && (
                      <p className="journal-recent-empty">{t('journal:recent.empty')}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Right Column: AI Insights ── */}
          <div className="journal-insights-col">
            <div className="journal-insights-card">
              <div className="journal-insights-header">
                <div className="journal-insights-title-row">
                  <Sparkles size={18} className="journal-insights-icon" />
                  <h3>{t('journal:insights.title')}</h3>
                </div>
                {insightsData && (
                  <span className="journal-insights-badge">
                    {t('journal:insights.basedOn', { count: insightsData.entry_count })}
                  </span>
                )}
              </div>

              {/* No data state */}
              {!insightsData && !insightsLoading && !insightsError && (
                <div className="journal-insights-empty">
                  <p>{t('journal:insights.noData')}</p>
                  <button
                    className="journal-insights-btn"
                    onClick={fetchInsights}
                    disabled={!recentEntries || recentEntries.length === 0}
                  >
                    <Sparkles size={14} />
                    {t('journal:insights.generate')}
                  </button>
                </div>
              )}

              {/* Loading state */}
              {insightsLoading && (
                <div className="journal-insights-loading">
                  <Loader2 className="journal-spinner" />
                  <p>{t('journal:insights.generating')}</p>
                </div>
              )}

              {/* Error state */}
              {insightsError && !insightsLoading && (
                <div className="journal-insights-error">
                  <p>{t('journal:insights.error')}</p>
                  <button className="journal-insights-btn" onClick={fetchInsights}>
                    <RefreshCw size={14} />
                    {t('common:retry')}
                  </button>
                </div>
              )}

              {/* Insights content */}
              {insightsData && !insightsLoading && (
                <div className="journal-insights-content">
                  {/* Mood Trend Chart */}
                  {insightsData.insights.mood_trend?.length > 0 && (
                    <div className="journal-insight-section">
                      <div className="journal-insight-label">
                        <TrendingUp size={14} />
                        <span>{t('journal:insights.moodTrend')}</span>
                      </div>
                      <div className="journal-mood-chart">
                        {insightsData.insights.mood_trend.map((point, i) => (
                          <div key={i} className="journal-mood-bar-wrap">
                            <div
                              className="journal-mood-bar"
                              style={{
                                height: `${(point.score / 10) * 100}%`,
                                background: moodColors[point.label] || '#6366f1',
                              }}
                              title={`${point.date}: ${point.score}/10 (${point.label})`}
                            />
                            <span className="journal-mood-bar-emoji">
                              {moodEmojis[point.label] || '😐'}
                            </span>
                            <span className="journal-mood-bar-date">
                              {new Date(point.date).getDate()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Summary */}
                  {insightsData.insights.summary && (
                    <div className="journal-insight-section">
                      <div className="journal-insight-label">
                        <Eye size={14} />
                        <span>{t('journal:insights.summary')}</span>
                      </div>
                      <p className="journal-insight-text">{insightsData.insights.summary}</p>
                    </div>
                  )}

                  {/* Patterns */}
                  {insightsData.insights.patterns?.length > 0 && (
                    <div className="journal-insight-section">
                      <div className="journal-insight-label">
                        <TrendingUp size={14} />
                        <span>{t('journal:insights.patterns')}</span>
                      </div>
                      <ul className="journal-insight-patterns">
                        {insightsData.insights.patterns.map((pattern, i) => (
                          <li key={i}>{pattern}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Suggestion */}
                  {insightsData.insights.suggestion && (
                    <div className="journal-insight-section journal-insight-suggestion">
                      <div className="journal-insight-label">
                        <Lightbulb size={14} />
                        <span>{t('journal:insights.suggestion')}</span>
                      </div>
                      <p className="journal-insight-text">{insightsData.insights.suggestion}</p>
                    </div>
                  )}

                  {/* Refresh button */}
                  <button className="journal-insights-refresh" onClick={fetchInsights}>
                    <RefreshCw size={14} />
                    {t('journal:insights.refresh')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

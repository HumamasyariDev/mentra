import { usePageTitle } from "../hooks/usePageTitle";
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { moodApi } from '../services/api';
import { CalendarDays } from 'lucide-react';
import '../styles/pages/Mood.css';

const moodValues = ['great', 'good', 'okay', 'bad', 'terrible'];
const moodEmojis = {
    great: '😄',
    good: '🙂',
    okay: '😐',
    bad: '😞',
    terrible: '😢',
};

export default function MoodPage() {
  usePageTitle('mood:pageTitle');

    const { t } = useTranslation(['mood', 'common']);
    const queryClient = useQueryClient();
    const [selectedMood, setSelectedMood] = useState('');
    const [energy, setEnergy] = useState(5);
    const [note, setNote] = useState('');

    const dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

    const { data: todayMood, isLoading: loadingToday } = useQuery({
        queryKey: ['mood-today'],
        queryFn: () => moodApi.today().then((r) => r.data),
    });

    const { data: weeklyMoods } = useQuery({
        queryKey: ['mood-weekly'],
        queryFn: () => moodApi.weekly().then((r) => r.data),
    });

    const saveMutation = useMutation({
        mutationFn: (data) => moodApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['mood-today'] });
            queryClient.invalidateQueries({ queryKey: ['mood-weekly'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            setSelectedMood('');
            setNote('');
        },
    });

    const handleSave = () => {

        if (!selectedMood) return;
        saveMutation.mutate({
            mood: selectedMood,
            energy_level: energy,
            note: note || undefined,
        });
    };

    return (
        <div className="mood-page">
            <div className="mood-page-header">
                <h1>{t('mood:pageTitle')}</h1>
                <p>{t('mood:pageSubtitle')}</p>
            </div>

            {loadingToday ? (
                <div className="mood-loading">
                    <div className="mood-spinner" />
                </div>
            ) : (
                <>
                    {todayMood && (
                        <div className="mood-today">
                            <div className="mood-today-badge">{t('mood:todayMood')}</div>
                            <div className="mood-today-emoji">
                                {moodEmojis[todayMood.mood]}
                            </div>
                            <p className="mood-today-label">{t(`mood:moods.${todayMood.mood}`)}</p>
                            <p className="mood-today-energy">{t('mood:energy', { value: todayMood.energy_level })}</p>
                            {todayMood.note && (
                                <p className="mood-today-note">"{todayMood.note}"</p>
                            )}
                            <p className="mood-today-hint">{t('mood:updateHint')}</p>
                        </div>
                    )}

                    <div className="mood-content">
                        <div className="mood-selector-card">
                            <h3 className="mood-selector-title">
                                {todayMood ? t('mood:selector.updateTitle') : t('mood:selector.howFeeling')}
                            </h3>

                            <div className="mood-options">
                                {moodValues.map((value) => (
                                    <button
                                        key={value}
                                        onClick={() => setSelectedMood(value)}
                                        className={`mood-opt-btn ${selectedMood === value ? 'active' : ''}`}
                                    >
                                        <span className="mood-opt-emoji">{moodEmojis[value]}</span>
                                        <span className="mood-opt-label">{t(`mood:moods.${value}`)}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="mood-energy">
                                <div className="mood-energy-header">
                                    <span className="mood-energy-title">{t('mood:energyLevel.title')}</span>
                                    <span className="mood-energy-value">{energy}/10</span>
                                </div>
                                <input
                                    type="range"
                                    min={1}
                                    max={10}
                                    value={energy}
                                    onChange={(e) => setEnergy(parseInt(e.target.value))}
                                    className="mood-energy-slider"
                                />
                                <div className="mood-energy-labels">
                                    <span>{t('mood:energyLevel.low')}</span>
                                    <span>{t('mood:energyLevel.high')}</span>
                                </div>
                            </div>

                            <div className="mood-note">
                                <label className="mood-note-label">
                                    {t('mood:note.label')} <span>({t('common:optional')})</span>
                                </label>
                                <textarea
                                    className="mood-note-input"
                                    rows={2}
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder={t('mood:note.placeholder')}
                                />
                            </div>

                            <button
                                onClick={handleSave}
                                className="mood-save-btn"
                                disabled={!selectedMood || saveMutation.isPending}
                            >
                                {saveMutation.isPending ? t('mood:save.saving') : todayMood ? t('mood:save.updateMood') : t('mood:save.saveMood')}
                            </button>
                        </div>

                        {weeklyMoods && weeklyMoods.length > 0 && (
                            <div className="mood-weekly">
                                <div className="mood-weekly-header">
                                    <CalendarDays />
                                    <h3>{t('mood:weekly.title')}</h3>
                                </div>
                                <div className="mood-weekly-days">
                                    {dayKeys.map((dayKey, i) => {
                                        const moodEntry = weeklyMoods.find((m) => {
                                            const d = new Date(m.date);
                                            const dayOfWeek = d.getDay();
                                            const mondayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
                                            return mondayIndex === i;
                                        });
                                        return (
                                            <div key={dayKey} className="mood-day">
                                                <p className="mood-day-label">{t(`common:days.${dayKey}`)}</p>
                                                <div className="mood-day-emoji">
                                                    {moodEntry ? (
                                                        moodEmojis[moodEntry.mood]
                                                    ) : (
                                                        <span className="mood-day-empty">-</span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

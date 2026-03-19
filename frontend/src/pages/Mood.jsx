import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { moodApi } from '../services/api';
import { CalendarDays } from 'lucide-react';
import '../styles/pages/Mood.css';

const moods = [
    { value: 'great', emoji: '😄', label: 'Great' },
    { value: 'good', emoji: '🙂', label: 'Good' },
    { value: 'okay', emoji: '😐', label: 'Okay' },
    { value: 'bad', emoji: '😞', label: 'Bad' },
    { value: 'terrible', emoji: '😢', label: 'Terrible' },
];

const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function MoodPage() {
    const queryClient = useQueryClient();
    const [selectedMood, setSelectedMood] = useState('');
    const [energy, setEnergy] = useState(5);
    const [note, setNote] = useState('');

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
                <h1>Mood Tracker</h1>
                <p>Track how you feel each day</p>
            </div>

            {loadingToday ? (
                <div className="mood-loading">
                    <div className="mood-spinner" />
                </div>
            ) : (
                <>
                    {todayMood && (
                        <div className="mood-today">
                            <div className="mood-today-badge">Today's Mood</div>
                            <div className="mood-today-emoji">
                                {moods.find((m) => m.value === todayMood.mood)?.emoji}
                            </div>
                            <p className="mood-today-label">{todayMood.mood}</p>
                            <p className="mood-today-energy">Energy {todayMood.energy_level}/10</p>
                            {todayMood.note && (
                                <p className="mood-today-note">"{todayMood.note}"</p>
                            )}
                            <p className="mood-today-hint">You can update your mood anytime today</p>
                        </div>
                    )}

                    <div className="mood-content">
                        <div className="mood-selector-card">
                            <h3 className="mood-selector-title">
                                {todayMood ? 'Update Your Mood' : 'How are you feeling?'}
                            </h3>

                            <div className="mood-options">
                                {moods.map((m) => (
                                    <button
                                        key={m.value}
                                        onClick={() => setSelectedMood(m.value)}
                                        className={`mood-opt-btn ${selectedMood === m.value ? 'active' : ''}`}
                                    >
                                        <span className="mood-opt-emoji">{m.emoji}</span>
                                        <span className="mood-opt-label">{m.label}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="mood-energy">
                                <div className="mood-energy-header">
                                    <span className="mood-energy-title">Energy Level</span>
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
                                    <span>Low</span>
                                    <span>High</span>
                                </div>
                            </div>

                            <div className="mood-note">
                                <label className="mood-note-label">
                                    Note <span>(optional)</span>
                                </label>
                                <textarea
                                    className="mood-note-input"
                                    rows={2}
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="How's your day going?"
                                />
                            </div>

                            <button
                                onClick={handleSave}
                                className="mood-save-btn"
                                disabled={!selectedMood || saveMutation.isPending}
                            >
                                {saveMutation.isPending ? 'Saving...' : todayMood ? 'Update Mood' : 'Save Mood'}
                            </button>
                        </div>

                        {weeklyMoods && weeklyMoods.length > 0 && (
                            <div className="mood-weekly">
                                <div className="mood-weekly-header">
                                    <CalendarDays />
                                    <h3>This Week</h3>
                                </div>
                                <div className="mood-weekly-days">
                                    {dayLabels.map((day, i) => {
                                        const moodEntry = weeklyMoods.find((m) => {
                                            const d = new Date(m.date);
                                            const dayOfWeek = d.getDay();
                                            const mondayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
                                            return mondayIndex === i;
                                        });
                                        return (
                                            <div key={day} className="mood-day">
                                                <p className="mood-day-label">{day}</p>
                                                <div className="mood-day-emoji">
                                                    {moodEntry ? (
                                                        moods.find((m) => m.value === moodEntry.mood)?.emoji
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

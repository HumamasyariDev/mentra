import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { moodApi } from '../services/api';
import { Loader2, Smile } from 'lucide-react';
import '../styles/pages/CommonPages.css';

const moods = [
  { value: 'great', emoji: '😄', label: 'Great', color: '#10b981' },
  { value: 'good', emoji: '🙂', label: 'Good', color: '#22c55e' },
  { value: 'okay', emoji: '😐', label: 'Okay', color: '#eab308' },
  { value: 'bad', emoji: '😞', label: 'Bad', color: '#f97316' },
  { value: 'terrible', emoji: '😢', label: 'Terrible', color: '#ef4444' },
];

const energyLevels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

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

  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="page-container">
      <div className="page-header" style={{ borderBottom: 'none', padding: '0 0 1.5rem 0' }}>
        <h1 className="page-title">Mood Tracker</h1>
        <p className="page-subtitle">Track how you feel each day</p>
      </div>

      {/* Today's Mood Status */}
      {loadingToday ? (
        <div className="page-loading" style={{ padding: '2rem 0' }}>
          <Loader2 className="page-loading-spinner" style={{ width: '1.5rem', height: '1.5rem' }} />
        </div>
      ) : todayMood ? (
        <div className="mood-today-card">
          <p className="mood-today-label">Today's Mood</p>
          <span className="mood-today-emoji">
            {moods.find((m) => m.value === todayMood.mood)?.emoji}
          </span>
          <p className="mood-today-mood">
            {todayMood.mood}
          </p>
          <p className="mood-today-energy">Energy: {todayMood.energy_level}/10</p>
          {todayMood.note && (
            <p className="mood-today-note">"{todayMood.note}"</p>
          )}
          <p className="mood-today-hint">You can update your mood anytime today</p>
        </div>
      ) : null}

      {/* Mood Selector */}
      <div className="mood-selector-card">
        <h3 className="mood-selector-title">
          {todayMood ? 'Update Your Mood' : 'How are you feeling?'}
        </h3>

        <div className="mood-options-grid">
          {moods.map((m) => (
            <button
              key={m.value}
              onClick={() => setSelectedMood(m.value)}
              className="mood-option"
              style={{
                borderColor: selectedMood === m.value ? m.color : 'transparent',
                backgroundColor: selectedMood === m.value ? `${m.color}15` : '#f8fafc',
                transform: selectedMood === m.value ? 'scale(1.05)' : 'scale(1)'
              }}
            >
              <span style={{ fontSize: '1.875rem' }}>{m.emoji}</span>
              <span className="mood-option-label">{m.label}</span>
            </button>
          ))}
        </div>

        {/* Energy Level */}
        <div className="mood-energy-section">
          <label className="mood-energy-label">Energy Level: {energy}/10</label>
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

        {/* Note */}
        <div className="mood-note-section">
          <label className="form-label">Note (optional)</label>
          <textarea
            className="form-textarea"
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
          {saveMutation.isPending && <Loader2 className="page-loading-spinner" style={{ width: '1rem', height: '1rem' }} />}
          {todayMood ? 'Update Mood' : 'Save Mood'}
        </button>
      </div>

      {/* Weekly Overview */}
      {weeklyMoods && weeklyMoods.length > 0 && (
        <div className="mood-weekly-card">
          <h3 className="mood-weekly-title">
            <Smile style={{ width: '1.25rem', height: '1.25rem', color: '#eab308' }} />
            This Week
          </h3>
          <div className="mood-weekly-grid">
            {dayLabels.map((day, i) => {
              const moodEntry = weeklyMoods.find((m) => {
                const d = new Date(m.date);
                const dayOfWeek = d.getDay();
                const mondayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
                return mondayIndex === i;
              });
              return (
                <div key={day} className="mood-weekly-day">
                  <p className="mood-weekly-day-label">{day}</p>
                  <div className="mood-weekly-day-emoji">
                    {moodEntry ? (
                      <span style={{ fontSize: '1.25rem' }}>
                        {moods.find((m) => m.value === moodEntry.mood)?.emoji}
                      </span>
                    ) : (
                      <span style={{ color: '#cbd5e1', fontSize: '1.125rem' }}>-</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { moodApi } from '../services/api';
import { Loader2, Smile } from 'lucide-react';

const moods = [
  { value: 'great', emoji: '😄', label: 'Great', color: 'border-emerald-400 bg-emerald-50' },
  { value: 'good', emoji: '🙂', label: 'Good', color: 'border-green-400 bg-green-50' },
  { value: 'okay', emoji: '😐', label: 'Okay', color: 'border-yellow-400 bg-yellow-50' },
  { value: 'bad', emoji: '😞', label: 'Bad', color: 'border-orange-400 bg-orange-50' },
  { value: 'terrible', emoji: '😢', label: 'Terrible', color: 'border-red-400 bg-red-50' },
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mood Tracker</h1>
        <p className="text-slate-500 text-sm mt-1">Track how you feel each day</p>
      </div>

      {/* Today's Mood Status */}
      {loadingToday ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
        </div>
      ) : todayMood ? (
        <div className="card text-center">
          <p className="text-sm text-slate-500 mb-2">Today's Mood</p>
          <span className="text-5xl">
            {moods.find((m) => m.value === todayMood.mood)?.emoji}
          </span>
          <p className="text-lg font-semibold text-slate-900 mt-2 capitalize">
            {todayMood.mood}
          </p>
          <p className="text-sm text-slate-500">Energy: {todayMood.energy_level}/10</p>
          {todayMood.note && (
            <p className="text-sm text-slate-400 mt-2 italic">"{todayMood.note}"</p>
          )}
          <p className="text-xs text-slate-400 mt-3">You can update your mood anytime today</p>
        </div>
      ) : null}

      {/* Mood Selector */}
      <div className="card">
        <h3 className="font-semibold text-slate-900 mb-4">
          {todayMood ? 'Update Your Mood' : 'How are you feeling?'}
        </h3>

        <div className="grid grid-cols-5 gap-3 mb-6">
          {moods.map((m) => (
            <button
              key={m.value}
              onClick={() => setSelectedMood(m.value)}
              className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
                selectedMood === m.value
                  ? m.color + ' scale-105'
                  : 'border-transparent bg-slate-50 hover:bg-slate-100'
              }`}
            >
              <span className="text-3xl">{m.emoji}</span>
              <span className="text-xs font-medium mt-1 text-slate-600">{m.label}</span>
            </button>
          ))}
        </div>

        {/* Energy Level */}
        <div className="mb-6">
          <label className="label">Energy Level: {energy}/10</label>
          <input
            type="range"
            min={1}
            max={10}
            value={energy}
            onChange={(e) => setEnergy(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>

        {/* Note */}
        <div className="mb-6">
          <label className="label">Note (optional)</label>
          <textarea
            className="input-field"
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="How's your day going?"
          />
        </div>

        <button
          onClick={handleSave}
          className="btn-primary w-full flex items-center justify-center gap-2"
          disabled={!selectedMood || saveMutation.isPending}
        >
          {saveMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {todayMood ? 'Update Mood' : 'Save Mood'}
        </button>
      </div>

      {/* Weekly Overview */}
      {weeklyMoods && weeklyMoods.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Smile className="w-5 h-5 text-yellow-500" />
            This Week
          </h3>
          <div className="grid grid-cols-7 gap-2">
            {dayLabels.map((day, i) => {
              const moodEntry = weeklyMoods.find((m) => {
                const d = new Date(m.date);
                const dayOfWeek = d.getDay();
                const mondayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
                return mondayIndex === i;
              });
              return (
                <div key={day} className="text-center">
                  <p className="text-xs text-slate-400 mb-1">{day}</p>
                  <div className="w-10 h-10 mx-auto rounded-lg bg-slate-50 flex items-center justify-center">
                    {moodEntry ? (
                      <span className="text-xl">
                        {moods.find((m) => m.value === moodEntry.mood)?.emoji}
                      </span>
                    ) : (
                      <span className="text-slate-300 text-lg">-</span>
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

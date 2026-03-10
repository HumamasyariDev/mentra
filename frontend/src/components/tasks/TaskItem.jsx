import { useState, useEffect, useRef } from 'react';
import { CheckCircle2, Circle, Trash2, Clock, Zap } from 'lucide-react';
import { checkQuizzability } from '../../utils/quizHelpers';
import { quizApi } from '../../services/api';
import QuizModal from './QuizModal';

const priorityColors = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
};

export default function TaskItem({ task, onComplete, onUncomplete, onDelete, compact = false }) {
  const isCompleted = task.status === 'completed';
  const cardRef = useRef(null);

  // --- Quiz state ---
  const [isQuizzable, setIsQuizzable] = useState(false);
  const [showModal, setShowModal]     = useState(false);
  const [quizList, setQuizList]       = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [bonusMsg, setBonusMsg]       = useState('');

  useEffect(() => {
    if (compact) return;
    let cancelled = false;
    checkQuizzability(task.title).then((result) => {
      if (!cancelled) setIsQuizzable(result);
    });
    return () => { cancelled = true; };
  }, [task.title, compact]);

  const handleToggle = () => {
    if (isCompleted) {
      onUncomplete?.(task.id);
    } else {
      onComplete?.(task.id, cardRef.current);
    }
  };

  /**
   * generateAndSave — call Puter.js, parse JSON output, save to DB.
   */
  const generateAndSave = async () => {
    if (!window.puter?.ai?.chat) {
      throw new Error('Puter.js tidak tersedia. Pastikan kamu sudah login.');
    }

    const prompt = `Buatkan 3 soal pilihan ganda (bahasa Indonesia) tentang task: "${task.title}".
Output WAJIB JSON murni tanpa teks pengantar, format array:
[
  {
    "question": "Pertanyaan?",
    "options": ["Pilihan A", "Pilihan B", "Pilihan C", "Pilihan D"],
    "answer": 0,
    "explanation": "Penjelasan singkat mengapa jawaban ini benar."
  }
]
answer adalah indeks (0-3) dari options yang benar.`;

    const raw = await window.puter.ai.chat([
      { role: 'system', content: 'Kamu adalah pembuat soal kuis. Output HANYA JSON murni, tanpa teks lain.' },
      { role: 'user',   content: prompt },
    ], { model: 'claude-sonnet-4-5' });

    const text = typeof raw === 'string' ? raw
        : raw?.message?.content?.[0]?.text ?? raw?.text ?? String(raw);

    // Extract JSON array from response (safe parse)
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('AI tidak mengembalikan format JSON yang valid.');

    const parsed = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error('Format pertanyaan kuis tidak valid.');
    }

    // Normalize: map "answer" field to correct_index for QuizModal
    const normalized = parsed.map((q) => ({
      question:      q.question,
      options:       q.options,
      correct_index: typeof q.answer === 'string'
          ? (isNaN(Number(q.answer)) ? q.options.findIndex((o) => o === q.answer) : Number(q.answer))
          : Number(q.answer ?? q.correct_index ?? 0),
      explanation: q.explanation ?? '',
    }));

    // Save to Supabase
    await quizApi.save(task.id, normalized);

    return normalized;
  };

  /**
   * handleOpenQuiz — fetch from DB first, generate if not found.
   */
  const handleOpenQuiz = async () => {
    setQuizList(null);
    setShowModal(true);
    setQuizLoading(true);

    try {
      // 1. Try to get cached quiz from DB
      const response = await quizApi.get(task.id);
      setQuizList(response.data.questions);
    } catch (err) {
      if (err.response?.status === 404) {
        // 2. Not found → generate with Puter, then save
        try {
          const questions = await generateAndSave();
          setQuizList(questions);
        } catch (genErr) {
          console.error('[Quiz] Generation error:', genErr);
          setQuizList(null);
        }
      } else {
        console.error('[Quiz] Fetch error:', err);
        setQuizList(null);
      }
    } finally {
      setQuizLoading(false);
    }
  };

  /**
   * handleRegenerate — force a new quiz from Puter (ignore DB cache).
   */
  const handleRegenerate = async () => {
    setQuizList(null);
    setQuizLoading(true);
    try {
      const questions = await generateAndSave();
      setQuizList(questions);
    } catch (err) {
      console.error('[Quiz] Regenerate error:', err);
      setQuizList(null);
    } finally {
      setQuizLoading(false);
    }
  };

  const handleCorrect = (count) => {
    if (count > 0) {
      setBonusMsg(`+${count} Log`);
      setTimeout(() => setBonusMsg(''), 3000);
    }
  };

  // ── Compact view (used in Dashboard, etc.) ───────────────────────
  if (compact) {
    return (
      <div ref={cardRef} className={`flex items-center gap-2 py-1.5 group ${isCompleted ? 'opacity-50' : ''}`}>
        <button onClick={handleToggle} className="flex-shrink-0">
          {isCompleted ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 hover:text-amber-500 transition-colors" />
          ) : (
            <Circle className="w-4 h-4 text-slate-300 hover:text-indigo-500 transition-colors" />
          )}
        </button>
        <span
          className={`text-xs truncate flex-1 ${isCompleted ? 'line-through text-slate-400' : 'text-slate-700'
            }`}
        >
          {task.title}
        </span>
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${priorityColors[task.priority]}`}>
          {task.priority[0].toUpperCase()}
        </span>
      </div>
    );
  }

  // ── Full card view ───────────────────────────────────────────────
  return (
    <>
      <div ref={cardRef} className={`card flex items-start gap-3 p-4 ${isCompleted ? 'opacity-60' : ''}`}>
        <button onClick={handleToggle} className="mt-0.5 flex-shrink-0">
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 hover:text-amber-500 transition-colors" />
          ) : (
            <Circle className="w-5 h-5 text-slate-300 hover:text-indigo-500 transition-colors" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <p className={`font-medium ${isCompleted ? 'line-through text-slate-400' : 'text-slate-900'}`}>
            {task.title}
          </p>
          {task.description && (
            <p className="text-sm text-slate-500 mt-0.5 truncate">{task.description}</p>
          )}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[task.priority]}`}>
              {task.priority}
            </span>
            {task.due_date && (
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(task.due_date).toLocaleDateString()}
              </span>
            )}
            <span className="text-xs text-indigo-500 font-medium">+{task.exp_reward} EXP</span>

            {/* Bonus earned flash */}
            {bonusMsg && (
              <span className="text-xs font-bold text-amber-500 animate-bounce">
                {bonusMsg} 🎉
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Quiz button — only shown for quizzable tasks */}
          {isQuizzable && !isCompleted && (
            <button
              onClick={handleOpenQuiz}
              title="Challenge Quiz"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-violet-100 text-violet-700 hover:bg-violet-200 transition-colors text-xs font-semibold"
            >
              <Zap className="w-3.5 h-3.5 fill-violet-500" />
              Quiz
            </button>
          )}

          <button
            onClick={() => onDelete?.(task.id)}
            className="text-slate-300 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quiz Modal */}
      {showModal && (
        <QuizModal
          quizList={quizList}
          isLoading={quizLoading}
          onClose={() => setShowModal(false)}
          onCorrect={handleCorrect}
          onRegenerate={handleRegenerate}
        />
      )}
    </>
  );
}

import { useState, useEffect, useRef } from 'react';
import { CheckCircle2, Circle, Trash2, Clock, Zap } from 'lucide-react';
import { checkQuizzability } from '../../utils/quizHelpers';
import { quizApi } from '../../services/api';
import QuizModal from './QuizModal';
import '../../styles/components/tasks/TaskComponents.css';

const priorityColors = {
  low: 'task-item-priority-low',
  medium: 'task-item-priority-medium',
  high: 'task-item-priority-high',
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
      <div ref={cardRef} className={`task-item-compact ${isCompleted ? 'completed' : ''}`}>
        <button onClick={handleToggle} className="task-item-toggle-btn">
          {isCompleted ? (
            <CheckCircle2 className="task-item-icon completed" />
          ) : (
            <Circle className="task-item-icon incomplete" />
          )}
        </button>
        <span className={`task-item-title-compact ${isCompleted ? 'completed' : 'incomplete'}`}>
          {task.title}
        </span>
        <span className={`task-item-priority-badge ${priorityColors[task.priority]}`}>
          {task.priority[0].toUpperCase()}
        </span>
      </div>
    );
  }

  // ── Full card view ───────────────────────────────────────────────
  return (
    <>
      <div ref={cardRef} className={`task-item-card ${isCompleted ? 'completed' : ''}`}>
        <button onClick={handleToggle} className="task-item-toggle-btn-full">
          {isCompleted ? (
            <CheckCircle2 className="task-item-icon-full completed" />
          ) : (
            <Circle className="task-item-icon-full incomplete" />
          )}
        </button>

        <div className="task-item-content">
          <p className={`task-item-title ${isCompleted ? 'completed' : 'incomplete'}`}>
            {task.title}
          </p>
          {task.description && (
            <p className="task-item-description">{task.description}</p>
          )}
          <div className="task-item-meta">
            <span className={`task-item-priority-badge ${priorityColors[task.priority]}`}>
              {task.priority}
            </span>
            {task.due_date && (
              <span className="task-item-meta-item">
                <Clock className="task-item-meta-icon" />
                {new Date(task.due_date).toLocaleDateString()}
              </span>
            )}
            <span className="task-item-exp-badge">+{task.exp_reward} EXP</span>

            {/* Bonus earned flash */}
            {bonusMsg && (
              <span className="task-item-bonus-msg">
                {bonusMsg} 🎉
              </span>
            )}
          </div>
        </div>

        <div className="task-item-actions">
          {/* Quiz button — only shown for quizzable tasks */}
          {isQuizzable && !isCompleted && (
            <button
              onClick={handleOpenQuiz}
              title="Challenge Quiz"
              className="task-item-quiz-btn"
            >
              <Zap className="task-item-quiz-icon" />
              Quiz
            </button>
          )}

          <button
            onClick={() => onDelete?.(task.id)}
            className="task-item-delete-btn"
          >
            <Trash2 className="task-item-delete-icon" />
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

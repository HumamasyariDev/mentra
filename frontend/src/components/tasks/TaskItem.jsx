import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Trash2, Clock, Zap } from 'lucide-react';
import { checkQuizzability, generateQuiz } from '../../utils/quizHelpers';
import QuizModal from './QuizModal';

const priorityColors = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
};

export default function TaskItem({ task, onComplete, onUncomplete, onDelete, compact = false }) {
  const isCompleted = task.status === 'completed';

  // --- Quiz state ---
  const [isQuizzable, setIsQuizzable] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [quizList, setQuizList] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [bonusMsg, setBonusMsg] = useState('');

  // Check quizzability once on mount (only for non-compact full cards)
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
      onComplete?.(task.id);
    }
  };

  const handleOpenQuiz = async () => {
    setQuizList(null);
    setShowModal(true);
    setQuizLoading(true);
    const result = await generateQuiz(task.title, 5);
    setQuizList(result);
    setQuizLoading(false);
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
      <div className={`flex items-center gap-2 py-1.5 group ${isCompleted ? 'opacity-50' : ''}`}>
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
      <div className={`card flex items-start gap-3 p-4 ${isCompleted ? 'opacity-60' : ''}`}>
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
        />
      )}
    </>
  );
}

import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Circle, Trash2, Clock, Zap, Lock, BookOpen } from 'lucide-react';
import { quizApi } from '../../services/api';
import QuizModal from './QuizModal';
import '../../styles/components/tasks/TaskComponents.css';

const priorityColors = {
  low: 'task-item-priority-low',
  medium: 'task-item-priority-medium',
  high: 'task-item-priority-high',
};

export default function TaskItem({ task, onComplete, onUncomplete, onDelete, compact = false }) {
  const { t, i18n } = useTranslation(['tasks', 'common']);
  const isCompleted = task.status === 'completed';
  const isQuizTask = task.type === 'quiz';
  const isBurned = (task.exp_logs_count ?? 0) > 0;
  const cardRef = useRef(null);

  // Quiz attempt status from eager-loaded data
  const hasQuizAttempt = task.quiz?.attempts?.length > 0;
  const quizLocked = isQuizTask && !hasQuizAttempt && !isCompleted;

  // --- Quiz state ---
  const [showModal, setShowModal]     = useState(false);
  const [quizList, setQuizList]       = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [bonusMsg, setBonusMsg]       = useState('');
  // Track if user just completed a quiz attempt (to unlock complete btn)
  const [justAttempted, setJustAttempted] = useState(false);
  const [flashcardMode, setFlashcardMode] = useState(false);

  const handleToggle = () => {
    if (isCompleted) {
      onUncomplete?.(task.id);
    } else if (quizLocked && !justAttempted) {
      // Can't complete — quiz not attempted
      return;
    } else {
      onComplete?.(task.id, cardRef.current);
    }
  };

  /**
   * handleOpenQuiz — fetch quiz from DB.
   */
  const handleOpenQuiz = async () => {
    setQuizList(null);
    setShowModal(true);
    setQuizLoading(true);

    try {
      const response = await quizApi.get(task.id);
      setQuizList(response.data.questions);
    } catch (err) {
      console.error('[Quiz] Fetch error:', err);
      setQuizList(null);
    } finally {
      setQuizLoading(false);
    }
  };

  /**
   * handleQuizDone — called when quiz modal finishes (user clicks Done).
   * Records the attempt to backend.
   */
  const handleQuizDone = async (correctCount, totalCount, answersMap) => {
    try {
      await quizApi.attempt(task.id, correctCount, totalCount, answersMap);
      setJustAttempted(true);
      if (correctCount > 0) {
        setBonusMsg(t('tasks:item.bonusLog', { count: correctCount }));
        setTimeout(() => setBonusMsg(''), 3000);
      }
    } catch (err) {
      console.error('[Quiz] Attempt save error:', err);
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
        {isQuizTask && (
          <span className="task-item-quiz-badge-compact">
            <Zap style={{ width: '0.625rem', height: '0.625rem' }} /> {t('tasks:item.quizBadge')}
          </span>
        )}
        <span className={`task-item-priority-badge ${priorityColors[task.priority]}`}>
          {task.priority[0].toUpperCase()}
        </span>
      </div>
    );
  }

  // ── Full card view ───────────────────────────────────────────────
  return (
    <>
      <div ref={cardRef} className={`task-item-card ${isCompleted ? 'completed' : ''} ${isQuizTask ? 'quiz-task' : ''} ${isBurned && !isCompleted ? 'burned' : ''}`}>
        <button
          onClick={handleToggle}
          className="task-item-toggle-btn-full"
          disabled={quizLocked && !justAttempted}
          title={quizLocked && !justAttempted ? t('tasks:item.completeQuizFirst') : undefined}
        >
          {isCompleted ? (
            <CheckCircle2 className="task-item-icon-full completed" />
          ) : quizLocked && !justAttempted ? (
            <Lock className="task-item-icon-full locked" />
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
              {t(`common:priority.${task.priority}`)}
            </span>
            {isQuizTask && (
              <span className="task-item-type-badge quiz">
                <Zap style={{ width: '0.75rem', height: '0.75rem' }} /> {t('tasks:item.quizTaskBadge')}
              </span>
            )}
            {task.due_date && (
              <span className="task-item-meta-item">
                <Clock className="task-item-meta-icon" />
                {new Date(task.due_date).toLocaleDateString(i18n.language === 'id' ? 'id-ID' : 'en-US')}
              </span>
            )}
            <span className="task-item-exp-badge">{t('tasks:item.expReward', { exp: task.exp_reward })}</span>

            {bonusMsg && (
              <span className="task-item-bonus-msg">
                {bonusMsg}
              </span>
            )}
          </div>

          {/* Quiz gate hint */}
          {quizLocked && !justAttempted && (
            <p className="task-item-quiz-hint">{t('tasks:item.quizGateHint')}</p>
          )}
        </div>

        <div className="task-item-actions">
          {/* Quiz button — shown for all quiz tasks (take or retake) */}
          {isQuizTask && (
            <>
              {(hasQuizAttempt || justAttempted) && (
                <label className="task-item-flashcard-toggle" title={t('tasks:item.flashcardToggle')}>
                  <input
                    type="checkbox"
                    checked={flashcardMode}
                    onChange={(e) => setFlashcardMode(e.target.checked)}
                  />
                  <BookOpen style={{ width: '0.75rem', height: '0.75rem' }} />
                  {t('tasks:item.cards')}
                </label>
              )}
              <button
                onClick={handleOpenQuiz}
                title={hasQuizAttempt || justAttempted ? t('tasks:item.retakeQuiz') : t('tasks:item.takeQuiz')}
                className="task-item-quiz-btn"
              >
                <Zap className="task-item-quiz-icon" />
                {hasQuizAttempt || justAttempted ? t('tasks:item.retake') : t('tasks:item.quizBadge')}
              </button>
            </>
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
          onDone={handleQuizDone}
          flashcardMode={flashcardMode}
        />
      )}
    </>
  );
}

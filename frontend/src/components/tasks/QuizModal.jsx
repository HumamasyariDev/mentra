import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, CheckCircle2, XCircle, Loader2, Zap, ChevronLeft, ChevronRight, SkipForward, Trophy, Target, RotateCcw, BookOpen } from 'lucide-react';
import '../../styles/components/tasks/QuizModal.css';

/**
 * QuizModal — multi-question quiz with back/skip navigation + flashcard mode.
 *
 * Props:
 *   quizList: array of { question, options, correct_index, explanation } | null
 *   isLoading: boolean
 *   onClose: () => void
 *   onDone: (correctCount, totalCount, answersMap) => void
 *   flashcardMode: boolean — if true, shows flashcards instead of quiz
 */
export default function QuizModal({ quizList, isLoading, onClose, onDone, flashcardMode = false }) {
    const { t } = useTranslation(['tasks', 'common']);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState({});
    const [flipped, setFlipped] = useState(false);

    const total = quizList?.length ?? 0;
    const quiz = quizList?.[currentIndex];
    const selectedOption = answers[currentIndex] ?? null;
    const isSubmitted = submitted[currentIndex] ?? false;
    const isCorrect = isSubmitted && selectedOption === quiz?.correct_index;

    const correctCount = Object.keys(submitted).filter(
        (i) => answers[i] === quizList?.[i]?.correct_index
    ).length;

    const handleSelect = (idx) => {
        if (isSubmitted) return;
        setAnswers((prev) => ({ ...prev, [currentIndex]: idx }));
    };

    const handleSubmit = () => {
        if (selectedOption === null || isSubmitted) return;
        setSubmitted((prev) => ({ ...prev, [currentIndex]: true }));
    };

    const handleNext = () => {
        if (currentIndex < total - 1) {
            setCurrentIndex((i) => i + 1);
            setFlipped(false);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex((i) => i - 1);
            setFlipped(false);
        }
    };

    const handleSkip = () => {
        setSubmitted((prev) => ({ ...prev, [currentIndex]: true }));
        if (currentIndex < total - 1) {
            setCurrentIndex((i) => i + 1);
        }
    };

    const isDone = Object.keys(submitted).length === total;

    const handleClose = () => {
        if (!flashcardMode && isDone && onDone) {
            const answersMap = {};
            Object.keys(submitted).forEach((i) => {
                answersMap[i] = answers[i] ?? null;
            });
            onDone(correctCount, total, answersMap);
        }
        onClose();
    };

    // Score ring calculations
    const scorePercent = total > 0 ? correctCount / total : 0;
    const circumference = 2 * Math.PI * 38; // radius = 38
    const scoreLevel = scorePercent >= 0.7 ? 'great' : scorePercent >= 0.4 ? 'okay' : 'poor';

    const feedbackClass = isSubmitted
        ? (selectedOption === null ? 'skipped' : isCorrect ? 'correct' : 'wrong')
        : '';

    return (
        <div
            className="quiz-modal-overlay"
            onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
            <div className="quiz-modal-container">

                {/* Header */}
                <div className="quiz-modal-header">
                    <div className="quiz-modal-header-top">
                        <div className="quiz-modal-title">
                            {flashcardMode ? (
                                <BookOpen className="quiz-modal-title-icon" />
                            ) : (
                                <Zap className="quiz-modal-title-icon" />
                            )}
                            <span className="quiz-modal-title-text">
                                {flashcardMode ? t('tasks:quiz.flashcards') : t('tasks:quiz.challengeQuiz')}
                            </span>
                        </div>
                        <button onClick={handleClose} className="quiz-modal-close-btn">
                            <X style={{ width: '1.125rem', height: '1.125rem' }} />
                        </button>
                    </div>

                    {!isLoading && quizList && (
                        <div className="quiz-modal-progress">
                            <div className="quiz-modal-progress-bar">
                                <div
                                    className="quiz-modal-progress-fill"
                                    style={{ width: `${((flashcardMode ? currentIndex + 1 : Object.keys(submitted).length) / total) * 100}%` }}
                                />
                            </div>
                            <span className="quiz-modal-progress-text">
                                {t('tasks:quiz.questionOf', { current: currentIndex + 1, total })}
                            </span>
                        </div>
                    )}
                </div>

                <div className="quiz-modal-body">
                    {/* Loading */}
                    {isLoading && (
                        <div className="quiz-modal-loading">
                            <Loader2 className="quiz-modal-loading-spinner" />
                            <p className="quiz-modal-loading-text">
                                {flashcardMode ? t('tasks:quiz.loadingFlashcards') : t('tasks:quiz.loadingQuiz')}
                            </p>
                        </div>
                    )}

                    {/* Error */}
                    {!isLoading && !quizList && (
                        <div className="quiz-modal-error">
                            <XCircle className="quiz-modal-error-icon" />
                            <p className="quiz-modal-error-title">{flashcardMode ? t('tasks:quiz.failedLoadFlashcards') : t('tasks:quiz.failedLoadQuiz')}</p>
                            <p className="quiz-modal-error-text">{t('tasks:quiz.errorText')}</p>
                            <button onClick={onClose} className="quiz-modal-done-btn">
                                {t('common:close')}
                            </button>
                        </div>
                    )}

                    {/* ═══════ FLASHCARD MODE ═══════ */}
                    {flashcardMode && !isLoading && quizList && (
                        <>
                            <p className="quiz-modal-question-number">
                                {t('tasks:quiz.cardNumber', { number: currentIndex + 1 })}
                            </p>

                            <div
                                className={`flashcard ${flipped ? 'flipped' : ''}`}
                                onClick={() => setFlipped((f) => !f)}
                            >
                                <div className="flashcard-inner">
                                    <div className="flashcard-front">
                                        <p className="flashcard-label">{t('tasks:quiz.questionLabel')}</p>
                                        <p className="flashcard-text">{quiz?.question}</p>
                                        <p className="flashcard-hint">{t('tasks:quiz.tapToFlip')}</p>
                                    </div>
                                    <div className="flashcard-back">
                                        <p className="flashcard-label">{t('tasks:quiz.answerLabel')}</p>
                                        <p className="flashcard-answer">{quiz?.options?.[quiz?.correct_index]}</p>
                                        {quiz?.explanation && (
                                            <p className="flashcard-explanation">{quiz.explanation}</p>
                                        )}
                                        <p className="flashcard-hint">{t('tasks:quiz.tapToFlipBack')}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="quiz-modal-footer">
                                <div className="quiz-modal-nav">
                                    <button
                                        onClick={handlePrev}
                                        disabled={currentIndex === 0}
                                        className="quiz-modal-nav-btn"
                                    >
                                        <ChevronLeft style={{ width: '1rem', height: '1rem' }} />
                                        {t('common:back')}
                                    </button>
                                </div>

                                <button
                                    onClick={() => setFlipped((f) => !f)}
                                    className="quiz-modal-action-btn quiz-modal-skip-btn"
                                >
                                    <RotateCcw style={{ width: '0.875rem', height: '0.875rem' }} />
                                    {t('tasks:quiz.flip')}
                                </button>

                                <button
                                    onClick={currentIndex < total - 1 ? handleNext : handleClose}
                                    className="quiz-modal-action-btn quiz-modal-submit-btn"
                                    style={{ flex: 1 }}
                                >
                                    {currentIndex < total - 1 ? (
                                        <>{t('common:next')} <ChevronRight style={{ width: '1rem', height: '1rem' }} /></>
                                    ) : (
                                        t('common:done')
                                    )}
                                </button>
                            </div>
                        </>
                    )}

                    {/* ═══════ QUIZ MODE ═══════ */}
                    {/* Done summary */}
                    {!flashcardMode && !isLoading && quizList && isDone && (
                        <div className="quiz-modal-done-summary">
                            {/* Score Ring */}
                            <div className="quiz-modal-score-ring">
                                <svg viewBox="0 0 88 88">
                                    <circle className="quiz-modal-score-ring-bg" cx="44" cy="44" r="38" />
                                    <circle
                                        className={`quiz-modal-score-ring-fill ${scoreLevel}`}
                                        cx="44" cy="44" r="38"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={circumference * (1 - scorePercent)}
                                    />
                                </svg>
                                <div className="quiz-modal-score-label">
                                    <span className="quiz-modal-score-number">{correctCount}</span>
                                    <span className="quiz-modal-score-of">{t('tasks:quiz.scoreOf', { total })}</span>
                                </div>
                            </div>

                            <h3 className="quiz-modal-done-title">
                                {scorePercent >= 0.7 ? t('tasks:quiz.excellentWork') : scorePercent >= 0.4 ? t('tasks:quiz.goodEffort') : t('tasks:quiz.keepPracticing')}
                            </h3>
                            <p className="quiz-modal-done-subtitle">
                                {t('tasks:quiz.scoreText', { correct: correctCount, total })}
                            </p>

                            {correctCount > 0 && (
                                <div className={`quiz-modal-done-badge ${scoreLevel}`}>
                                    <Trophy style={{ width: '0.875rem', height: '0.875rem' }} />
                                    {t('tasks:quiz.logEarned', { count: correctCount })}
                                </div>
                            )}

                            {/* Answer Review */}
                            <div className="quiz-modal-review">
                                {quizList.map((q, i) => {
                                    const wasSkipped = submitted[i] && answers[i] == null;
                                    const wasCorrect = answers[i] === q.correct_index;
                                    const iconClass = wasSkipped ? 'skipped' : wasCorrect ? 'correct' : 'wrong';
                                    return (
                                        <div key={i} className="quiz-modal-review-item">
                                            {wasSkipped ? (
                                                <SkipForward className={`quiz-modal-review-icon ${iconClass}`} />
                                            ) : wasCorrect ? (
                                                <CheckCircle2 className={`quiz-modal-review-icon ${iconClass}`} />
                                            ) : (
                                                <XCircle className={`quiz-modal-review-icon ${iconClass}`} />
                                            )}
                                            <span className="quiz-modal-review-text">{q.question}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            <button onClick={handleClose} className="quiz-modal-done-btn">
                                {t('common:done')}
                            </button>
                        </div>
                    )}

                    {/* Active quiz question */}
                    {!flashcardMode && !isLoading && quiz && !isDone && (
                        <>
                            <p className="quiz-modal-question-number">
                                {t('tasks:quiz.questionNumber', { number: currentIndex + 1 })}
                            </p>
                            <p className="quiz-modal-question">
                                {quiz.question}
                            </p>

                            {/* Options */}
                            <div className="quiz-modal-options" key={currentIndex}>
                                {quiz.options.map((option, idx) => {
                                    let className = 'quiz-modal-option';
                                    if (selectedOption === idx && !isSubmitted) {
                                        className += ' selected';
                                    }
                                    if (isSubmitted) {
                                        className += ' submitted';
                                        if (idx === quiz.correct_index) {
                                            className += ' correct';
                                        } else if (idx === selectedOption && selectedOption !== quiz.correct_index) {
                                            className += ' wrong';
                                        }
                                    }

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => handleSelect(idx)}
                                            disabled={isSubmitted}
                                            className={className}
                                        >
                                            <div className="quiz-modal-option-content">
                                                <span className="quiz-modal-option-letter">
                                                    {['A', 'B', 'C', 'D'][idx]}
                                                </span>
                                                <span className="quiz-modal-option-text">{option}</span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Feedback */}
                            {isSubmitted && (
                                <div className={`quiz-modal-explanation ${feedbackClass}`}>
                                    <div className="quiz-modal-explanation-title">
                                        {isCorrect ? (
                                            <><CheckCircle2 className="quiz-modal-option-icon" />{t('tasks:quiz.correct')}</>
                                        ) : selectedOption === null ? (
                                            <><SkipForward className="quiz-modal-option-icon" />{t('tasks:quiz.skipped')}</>
                                        ) : (
                                            <><XCircle className="quiz-modal-option-icon" />{t('tasks:quiz.incorrect')}</>
                                        )}
                                    </div>
                                    <p className="quiz-modal-explanation-text">{quiz.explanation}</p>
                                </div>
                            )}

                            {/* Action buttons */}
                            <div className="quiz-modal-footer">
                                <div className="quiz-modal-nav">
                                    <button
                                        onClick={handlePrev}
                                        disabled={currentIndex === 0}
                                        className="quiz-modal-nav-btn"
                                    >
                                        <ChevronLeft style={{ width: '1rem', height: '1rem' }} />
                                        {t('common:back')}
                                    </button>
                                </div>

                                {!isSubmitted ? (
                                    <div className="quiz-modal-actions-row">
                                        <button
                                            onClick={handleSubmit}
                                            disabled={selectedOption === null}
                                            className="quiz-modal-action-btn quiz-modal-submit-btn"
                                            style={{ flex: 1 }}
                                        >
                                            <Target style={{ width: '1rem', height: '1rem' }} />
                                            {t('common:submit')}
                                        </button>
                                        <button
                                            onClick={handleSkip}
                                            className="quiz-modal-action-btn quiz-modal-skip-btn"
                                        >
                                            {t('tasks:quiz.skip')}
                                            <SkipForward style={{ width: '0.875rem', height: '0.875rem' }} />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleNext}
                                        className="quiz-modal-action-btn quiz-modal-submit-btn"
                                        style={{ flex: 1 }}
                                    >
                                        {currentIndex < total - 1 ? (
                                            <>{t('common:next')} <ChevronRight style={{ width: '1rem', height: '1rem' }} /></>
                                        ) : (
                                            <>{t('tasks:quiz.seeResults')} <ChevronRight style={{ width: '1rem', height: '1rem' }} /></>
                                        )}
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

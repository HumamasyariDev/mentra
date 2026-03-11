import { useState } from 'react';
import { X, CheckCircle2, XCircle, Loader2, Zap, ChevronLeft, ChevronRight, SkipForward, RefreshCw } from 'lucide-react';
import '../../styles/components/tasks/QuizModal.css';

/**
 * QuizModal — multi-question quiz with back/skip navigation.
 *
 * Props:
 *   quizList: array of { question, options, correct_index, explanation } | null
 *   isLoading: boolean
 *   onClose: () => void
 *   onCorrect: (count: number) => void
 *   onRegenerate: () => Promise<void>  — force regenerate quiz from Puter
 */
export default function QuizModal({ quizList, isLoading, onClose, onCorrect, onRegenerate }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    // answers[i] = selected option index, or null if skipped/unanswered
    const [answers, setAnswers] = useState({});
    // submitted[i] = true when user hits Submit on question i
    const [submitted, setSubmitted] = useState({});

    const total = quizList?.length ?? 0;
    const quiz = quizList?.[currentIndex];
    const selectedOption = answers[currentIndex] ?? null;
    const isSubmitted = submitted[currentIndex] ?? false;
    const isCorrect = isSubmitted && selectedOption === quiz?.correct_index;
    const isWrong = isSubmitted && selectedOption !== quiz?.correct_index;

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
        if (currentIndex < total - 1) setCurrentIndex((i) => i + 1);
    };

    const handlePrev = () => {
        if (currentIndex > 0) setCurrentIndex((i) => i - 1);
    };

    const handleSkip = () => {
        // Mark as submitted with no answer (skip)
        setSubmitted((prev) => ({ ...prev, [currentIndex]: true }));
        if (currentIndex < total - 1) {
            setCurrentIndex((i) => i + 1);
        }
    };

    const isDone = Object.keys(submitted).length === total;

    const handleClose = () => {
        onCorrect?.(correctCount);
        onClose();
    };

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
                            <Zap className="quiz-modal-title-icon" />
                            <span className="quiz-modal-title-text">Challenge Quiz</span>
                        </div>
                        <div className="quiz-modal-header-actions">
                            {/* Regenerate button — always visible when not loading */}
                            {!isLoading && onRegenerate && (
                                <button
                                    onClick={onRegenerate}
                                    title="Regenerate quiz"
                                    className="quiz-modal-regenerate-btn"
                                >
                                    <RefreshCw style={{ width: '1rem', height: '1rem' }} />
                                </button>
                            )}
                            <button onClick={handleClose} className="quiz-modal-close-btn">
                                <X style={{ width: '1.25rem', height: '1.25rem' }} />
                            </button>
                        </div>
                    </div>

                    {/* Progress bar + counter */}
                    {!isLoading && quizList && (
                        <div className="quiz-modal-progress">
                            <div style={{ flex: 1, height: '0.375rem', backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '9999px', overflow: 'hidden' }}>
                                <div
                                    style={{ 
                                      height: '100%', 
                                      backgroundColor: '#ffffff', 
                                      borderRadius: '9999px', 
                                      transition: 'all 0.3s',
                                      width: `${((currentIndex + 1) / total) * 100}%` 
                                    }}
                                />
                            </div>
                            <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.75rem', fontWeight: '500', whiteSpace: 'nowrap' }}>
                                {currentIndex + 1} / {total}
                            </span>
                        </div>
                    )}
                </div>

                <div className="quiz-modal-body">
                    {/* Loading */}
                    {isLoading && (
                        <div className="quiz-modal-loading">
                            <Loader2 className="quiz-modal-loading-spinner" />
                            <p style={{ fontSize: '0.875rem' }}>{quizList === null ? 'Mengambil atau membuat kuis…' : 'Generating quiz questions...'}</p>
                        </div>
                    )}

                    {/* Error */}
                    {!isLoading && !quizList && (
                        <div style={{ textAlign: 'center', padding: '3rem 0', color: '#64748b' }}>
                            <XCircle style={{ width: '2.5rem', height: '2.5rem', margin: '0 auto 0.75rem', color: '#f87171' }} />
                            <p style={{ fontWeight: '500', color: '#334155' }}>Failed to generate quiz</p>
                            <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>Please try again later.</p>
                            <button onClick={onClose} className="quiz-modal-done-btn" style={{ marginTop: '1rem' }}>
                                Close
                            </button>
                        </div>
                    )}

                    {/* Done summary */}
                    {!isLoading && quizList && isDone && (
                        <div className="quiz-modal-done-summary">
                            <div style={{ 
                                width: '4rem', 
                                height: '4rem', 
                                margin: '0 auto 1rem', 
                                borderRadius: '50%', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                backgroundColor: correctCount >= total / 2 ? '#d1fae5' : '#fef3c7'
                            }}>
                                <span style={{ fontSize: '1.875rem' }}>{correctCount >= total / 2 ? '🏆' : '💪'}</span>
                            </div>
                            <h3 className="quiz-modal-done-title">Quiz Complete!</h3>
                            <p className="quiz-modal-done-score">
                                You got <span style={{ fontWeight: '700', color: '#6366f1' }}>{correctCount}</span> out of{' '}
                                <span style={{ fontWeight: '700' }}>{total}</span> correct.
                            </p>
                            {correctCount > 0 && (
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 1rem', backgroundColor: '#fef3c7', border: '1px solid #fde68a', borderRadius: '0.75rem', color: '#92400e', fontSize: '0.875rem', fontWeight: '600', marginBottom: '1.5rem' }}>
                                    +{correctCount} Log Earned 🎉
                                </div>
                            )}

                            {/* Mini answer review */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', textAlign: 'left', marginBottom: '1.5rem' }}>
                                {quizList.map((q, i) => {
                                    const wasSkipped = submitted[i] && answers[i] == null;
                                    const wasCorrect = answers[i] === q.correct_index;
                                    return (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                                            {wasSkipped ? (
                                                <SkipForward style={{ width: '1rem', height: '1rem', color: '#94a3b8', flexShrink: 0 }} />
                                            ) : wasCorrect ? (
                                                <CheckCircle2 style={{ width: '1rem', height: '1rem', color: '#10b981', flexShrink: 0 }} />
                                            ) : (
                                                <XCircle style={{ width: '1rem', height: '1rem', color: '#f87171', flexShrink: 0 }} />
                                            )}
                                            <span style={{ color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.question}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            <button
                                onClick={handleClose}
                                className="quiz-modal-done-btn"
                                style={{ width: '100%' }}
                            >
                                Done
                            </button>
                        </div>
                    )}

                    {/* Active quiz question */}
                    {!isLoading && quiz && !isDone && (
                        <>
                            <p className="quiz-modal-question">
                                {quiz.question}
                            </p>

                            {/* Options */}
                            <div className="quiz-modal-options">
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
                                                <span style={{ fontWeight: '700', marginRight: '0.5rem' }}>{['A', 'B', 'C', 'D'][idx]}.</span>
                                                <span className="quiz-modal-option-text">{option}</span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Feedback */}
                            {isSubmitted && (
                                <div className="quiz-modal-explanation" style={{ 
                                    backgroundColor: isCorrect ? '#d1fae5' : '#fee2e2',
                                    borderColor: isCorrect ? '#10b981' : '#ef4444'
                                }}>
                                    <div className="quiz-modal-explanation-title" style={{ color: isCorrect ? '#065f46' : '#991b1b' }}>
                                        {isCorrect ? (
                                            <><CheckCircle2 className="quiz-modal-option-icon" />Correct! +1 Log 🎉</>
                                        ) : selectedOption === null ? (
                                            <><SkipForward className="quiz-modal-option-icon" />Skipped</>
                                        ) : (
                                            <><XCircle className="quiz-modal-option-icon" />Wrong answer</>
                                        )}
                                    </div>
                                    <p className="quiz-modal-explanation-text" style={{ color: isCorrect ? '#065f46' : '#991b1b' }}>{quiz.explanation}</p>
                                </div>
                            )}

                            {/* Action buttons */}
                            <div className="quiz-modal-footer" style={{ padding: 0, border: 'none', background: 'transparent' }}>
                                <div className="quiz-modal-nav">
                                    {/* Back */}
                                    <button
                                        onClick={handlePrev}
                                        disabled={currentIndex === 0}
                                        className="quiz-modal-nav-btn"
                                        style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                    >
                                        <ChevronLeft style={{ width: '1rem', height: '1rem' }} />
                                        Back
                                    </button>
                                </div>

                                {/* Submit or Skip */}
                                {!isSubmitted ? (
                                    <div style={{ display: 'flex', gap: '0.5rem', flex: 1 }}>
                                        <button
                                            onClick={handleSubmit}
                                            disabled={selectedOption === null}
                                            className="quiz-modal-action-btn quiz-modal-submit-btn"
                                            style={{ flex: 1 }}
                                        >
                                            Submit Answer
                                        </button>
                                        <button
                                            onClick={handleSkip}
                                            className="quiz-modal-action-btn quiz-modal-skip-btn"
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                        >
                                            Skip
                                            <SkipForward style={{ width: '1rem', height: '1rem' }} />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleNext}
                                        className="quiz-modal-action-btn quiz-modal-submit-btn"
                                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
                                    >
                                        {currentIndex < total - 1 ? (
                                            <>Next <ChevronRight style={{ width: '1rem', height: '1rem' }} /></>
                                        ) : (
                                            'See Results'
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

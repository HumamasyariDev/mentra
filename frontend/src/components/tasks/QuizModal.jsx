import { useState } from 'react';
import { X, CheckCircle2, XCircle, Loader2, Zap, ChevronLeft, ChevronRight, SkipForward } from 'lucide-react';

/**
 * QuizModal — multi-question quiz with back/skip navigation.
 *
 * Props:
 *   quizList: array of { question, options, correct_index, explanation } | null
 *   isLoading: boolean
 *   onClose: () => void
 *   onCorrect: (count: number) => void  — called on modal close with correct count
 */
export default function QuizModal({ quizList, isLoading, onClose, onCorrect }) {
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">

                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-white">
                            <Zap className="w-5 h-5 fill-white" />
                            <span className="font-bold text-lg">Challenge Quiz</span>
                        </div>
                        <button onClick={handleClose} className="text-white/70 hover:text-white transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Progress bar + counter */}
                    {!isLoading && quizList && (
                        <div className="flex items-center gap-3">
                            <div className="flex-1 h-1.5 bg-white/30 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-white rounded-full transition-all duration-300"
                                    style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
                                />
                            </div>
                            <span className="text-white/90 text-xs font-medium whitespace-nowrap">
                                {currentIndex + 1} / {total}
                            </span>
                        </div>
                    )}
                </div>

                <div className="p-6">
                    {/* Loading */}
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-500">
                            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                            <p className="text-sm">Generating quiz questions...</p>
                        </div>
                    )}

                    {/* Error */}
                    {!isLoading && !quizList && (
                        <div className="text-center py-12 text-slate-500">
                            <XCircle className="w-10 h-10 mx-auto mb-3 text-red-400" />
                            <p className="font-medium text-slate-700">Failed to generate quiz</p>
                            <p className="text-sm mt-1">Please try again later.</p>
                            <button onClick={onClose} className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors">
                                Close
                            </button>
                        </div>
                    )}

                    {/* Done summary */}
                    {!isLoading && quizList && isDone && (
                        <div className="text-center py-6">
                            <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${correctCount >= total / 2 ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                                <span className="text-3xl">{correctCount >= total / 2 ? '🏆' : '💪'}</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-1">Quiz Complete!</h3>
                            <p className="text-slate-500 text-sm mb-4">
                                You got <span className="font-bold text-indigo-600">{correctCount}</span> out of{' '}
                                <span className="font-bold">{total}</span> correct.
                            </p>
                            {correctCount > 0 && (
                                <div className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm font-semibold mb-6">
                                    +{correctCount} Log Earned 🎉
                                </div>
                            )}

                            {/* Mini answer review */}
                            <div className="space-y-1.5 text-left mb-6">
                                {quizList.map((q, i) => {
                                    const wasSkipped = submitted[i] && answers[i] == null;
                                    const wasCorrect = answers[i] === q.correct_index;
                                    return (
                                        <div key={i} className="flex items-center gap-2 text-sm">
                                            {wasSkipped ? (
                                                <SkipForward className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                            ) : wasCorrect ? (
                                                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                            ) : (
                                                <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                                            )}
                                            <span className="text-slate-600 line-clamp-1">{q.question}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            <button
                                onClick={handleClose}
                                className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
                            >
                                Done
                            </button>
                        </div>
                    )}

                    {/* Active quiz question */}
                    {!isLoading && quiz && !isDone && (
                        <>
                            <p className="font-semibold text-slate-800 text-base mb-5 leading-snug">
                                {quiz.question}
                            </p>

                            {/* Options */}
                            <div className="space-y-3 mb-5">
                                {quiz.options.map((option, idx) => {
                                    let style = 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50';

                                    if (selectedOption === idx && !isSubmitted) {
                                        style = 'border-indigo-500 bg-indigo-50 text-indigo-800';
                                    }
                                    if (isSubmitted) {
                                        if (idx === quiz.correct_index) {
                                            style = 'border-emerald-500 bg-emerald-50 text-emerald-800';
                                        } else if (idx === selectedOption && selectedOption !== quiz.correct_index) {
                                            style = 'border-red-400 bg-red-50 text-red-700';
                                        } else {
                                            style = 'border-slate-200 bg-white text-slate-400 opacity-50';
                                        }
                                    }

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => handleSelect(idx)}
                                            disabled={isSubmitted}
                                            className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${style} ${!isSubmitted ? 'cursor-pointer' : 'cursor-default'}`}
                                        >
                                            <span className="font-bold mr-2">{['A', 'B', 'C', 'D'][idx]}.</span>
                                            {option}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Feedback */}
                            {isSubmitted && (
                                <div className={`rounded-xl px-4 py-3 mb-5 text-sm ${isCorrect ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
                                    <div className="flex items-center gap-2 font-semibold mb-1">
                                        {isCorrect ? (
                                            <><CheckCircle2 className="w-4 h-4" />Correct! +1 Log 🎉</>
                                        ) : selectedOption === null ? (
                                            <><SkipForward className="w-4 h-4" />Skipped</>
                                        ) : (
                                            <><XCircle className="w-4 h-4" />Wrong answer</>
                                        )}
                                    </div>
                                    <p className="opacity-90 leading-relaxed">{quiz.explanation}</p>
                                </div>
                            )}

                            {/* Action buttons */}
                            <div className="flex gap-2">
                                {/* Back */}
                                <button
                                    onClick={handlePrev}
                                    disabled={currentIndex === 0}
                                    className="flex items-center gap-1 px-3 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Back
                                </button>

                                {/* Submit or Skip */}
                                {!isSubmitted ? (
                                    <>
                                        <button
                                            onClick={handleSubmit}
                                            disabled={selectedOption === null}
                                            className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                                        >
                                            Submit Answer
                                        </button>
                                        <button
                                            onClick={handleSkip}
                                            className="flex items-center gap-1 px-3 py-2.5 rounded-xl border border-slate-200 text-slate-500 text-sm font-medium hover:bg-slate-50 transition-colors"
                                        >
                                            Skip
                                            <SkipForward className="w-4 h-4" />
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={handleNext}
                                        className="flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors text-sm"
                                    >
                                        {currentIndex < total - 1 ? (
                                            <>Next <ChevronRight className="w-4 h-4" /></>
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

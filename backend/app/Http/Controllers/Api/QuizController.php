<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * QuizController
 *
 * GET  /api/tasks/{taskId}/quiz   — return saved quiz or 404
 * POST /api/tasks/{taskId}/quiz   — save (or overwrite) quiz questions
 */
class QuizController extends Controller
{
    /**
     * GET /api/tasks/{taskId}/quiz
     *
     * Returns the quiz for this task if one exists, 404 otherwise.
     * Frontend checks this FIRST before calling NVIDIA API to generate.
     */
    public function show(Request $request, int $taskId): JsonResponse
    {
        // Verify the task belongs to the authenticated user
        $task = $request->user()->tasks()->findOrFail($taskId);

        $quiz = $task->quiz;

        if (!$quiz) {
            return response()->json(['message' => 'No quiz found for this task.'], 404);
        }

        $latestAttempt = $quiz->attempts()
            ->where('user_id', $request->user()->id)
            ->latest()
            ->first();

        return response()->json([
            'id' => $quiz->id,
            'task_id' => $quiz->task_id,
            'questions' => $quiz->questions, // auto-decoded from JSONB
            'has_attempt' => $latestAttempt !== null,
            'latest_attempt' => $latestAttempt,
            'created_at' => $quiz->created_at,
            'updated_at' => $quiz->updated_at,
        ]);
    }

    /**
     * POST /api/tasks/{taskId}/quiz
     *
     * Saves AI-generated questions. If a quiz already exists for this task,
     * it is overwritten (updateOrCreate). Frontend calls this after NVIDIA
     * generates the quiz, and also on "Regenerate".
     *
     * Body: { "questions": [...] }
     */
    public function store(Request $request, int $taskId): JsonResponse
    {
        $task = $request->user()->tasks()->findOrFail($taskId);

        $validated = $request->validate([
            'questions' => ['required', 'array', 'min:1', 'max:20'],
            'questions.*.question' => ['required', 'string'],
            'questions.*.options' => ['required', 'array', 'min:2'],
            // Accept either correct_index (from frontend) or answer (raw AI output)
            'questions.*.correct_index' => ['nullable', 'integer'],
            'questions.*.answer' => ['nullable'],
            'questions.*.explanation' => ['nullable', 'string'],
            'material' => ['nullable', 'string', 'max:50000'],
        ]);

        // Normalise: resolve answer → correct_index integer
        $normalized = array_map(function (array $q) {
            // Prefer correct_index if already set, fall back to answer
            $answer = $q['correct_index'] ?? $q['answer'] ?? 0;

            if (is_string($answer) && preg_match('/^[A-Da-d]$/', $answer)) {
                $answer = ord(strtoupper($answer)) - ord('A');
            }

            return [
            'question' => $q['question'],
            'options' => array_values($q['options']),
            'correct_index' => (int)$answer,
            'explanation' => $q['explanation'] ?? null,
            ];
        }, $validated['questions']);

        // updateOrCreate: save or overwrite
        $quiz = Quiz::updateOrCreate(
        ['task_id' => $task->id],
        [
            'questions' => $normalized,
            'material' => $validated['material'] ?? null,
        ]
        );

        return response()->json([
            'id' => $quiz->id,
            'task_id' => $quiz->task_id,
            'questions' => $quiz->questions,
            'message' => $quiz->wasRecentlyCreated ? 'Quiz saved.' : 'Quiz updated.',
        ], $quiz->wasRecentlyCreated ? 201 : 200);
    }

    /**
     * POST /api/tasks/{taskId}/quiz/attempt
     *
     * Records a quiz attempt. Frontend sends score, total, and answers map.
     */
    public function attempt(Request $request, int $taskId): JsonResponse
    {
        $task = $request->user()->tasks()->findOrFail($taskId);
        $quiz = $task->quiz;

        if (!$quiz) {
            return response()->json(['message' => 'No quiz found for this task.'], 404);
        }

        $validated = $request->validate([
            'score' => ['required', 'integer', 'min:0'],
            'total' => ['required', 'integer', 'min:1'],
            'answers' => ['nullable', 'array'],
        ]);

        $attempt = $quiz->attempts()->create([
            'user_id' => $request->user()->id,
            'score' => $validated['score'],
            'total' => $validated['total'],
            'answers' => $validated['answers'] ?? null,
        ]);

        return response()->json([
            'attempt' => $attempt,
            'message' => "Quiz attempt recorded: {$attempt->score}/{$attempt->total}",
        ], 201);
    }
}
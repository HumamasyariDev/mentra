<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ExpService;
use App\Services\StreakService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function __construct(
        private ExpService $expService,
        private StreakService $streakService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $tasks = $request->user()->tasks()
            ->with(['quiz:id,task_id', 'quiz.attempts' => function ($q) use ($request) {
                $q->where('user_id', $request->user()->id)->latest()->limit(1);
            }])
            ->withCount('expLogs')
            ->when($request->status, fn($q, $status) => $q->where('status', $status))
            ->when($request->priority, fn($q, $priority) => $q->where('priority', $priority))
            ->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 15);

        return response()->json($tasks);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'type' => ['sometimes', 'in:normal,quiz'],
            'priority' => ['in:low,medium,high'],
            'due_date' => ['nullable', 'date'],
            'exp_reward' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $task = $request->user()->tasks()->create($validated);

        return response()->json($task, 201);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $task = $request->user()->tasks()->findOrFail($id);

        return response()->json($task);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $task = $request->user()->tasks()->findOrFail($id);

        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'priority' => ['in:low,medium,high'],
            'status' => ['in:pending,in_progress,completed'],
            'due_date' => ['nullable', 'date'],
        ]);

        $task->update($validated);

        return response()->json($task);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $task = $request->user()->tasks()->findOrFail($id);
        $task->delete();

        return response()->json(['message' => 'Task deleted.']);
    }

    public function complete(Request $request, int $id): JsonResponse
    {
        $task = $request->user()->tasks()->findOrFail($id);

        if ($task->status === 'completed') {
            return response()->json(['message' => 'Task already completed.'], 422);
        }

        // Quiz gate: quiz tasks require at least one quiz attempt
        if ($task->type === 'quiz') {
            $quiz = $task->quiz;
            if (!$quiz) {
                return response()->json(['message' => 'Quiz task has no quiz. Cannot complete.'], 422);
            }
            $hasAttempt = $quiz->attempts()->where('user_id', $request->user()->id)->exists();
            if (!$hasAttempt) {
                return response()->json(['message' => 'You must complete the quiz before marking this task as done.'], 422);
            }
        }

        $task->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        // Only award EXP on first completion (prevent double reward after uncomplete→re-complete)
        $alreadyBurned = $task->expLogs()->where('amount', '>', 0)->exists();
        $expAwarded = false;

        if (!$alreadyBurned) {
            $this->expService->awardExp(
                $request->user(),
                $task->exp_reward,
                'task',
                $task,
                "Completed task: {$task->title}"
            );
            $expAwarded = true;
        }

        $this->streakService->recordActivity($request->user());

        return response()->json([
            'task' => $task->fresh(),
            'exp_awarded' => $expAwarded,
            'message' => $expAwarded
                ? "Task completed! +{$task->exp_reward} EXP"
                : "Task completed!",
        ]);
    }

    public function uncomplete(Request $request, int $id): JsonResponse
    {
        $task = $request->user()->tasks()->findOrFail($id);

        if ($task->status !== 'completed') {
            return response()->json(['message' => 'Task is not completed.'], 422);
        }

        $task->update([
            'status' => 'pending',
            'completed_at' => null,
        ]);

        // EXP from burning is permanent — no deduction on uncomplete

        return response()->json([
            'task' => $task->fresh(),
            'message' => 'Task uncompleted.',
        ]);
    }
}

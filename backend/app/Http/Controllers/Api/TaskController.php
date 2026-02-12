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

        $task->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        $this->expService->awardExp(
            $request->user(),
            $task->exp_reward,
            'task',
            $task,
            "Completed task: {$task->title}"
        );

        $this->streakService->recordActivity($request->user());

        return response()->json([
            'task' => $task->fresh(),
            'message' => "Task completed! +{$task->exp_reward} EXP",
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

        $this->expService->deductExp(
            $request->user(),
            $task->exp_reward,
            'task_uncomplete',
            $task,
            "Uncompleted task: {$task->title}"
        );

        return response()->json([
            'task' => $task->fresh(),
            'message' => "Task uncompleted. -{$task->exp_reward} EXP",
        ]);
    }
}

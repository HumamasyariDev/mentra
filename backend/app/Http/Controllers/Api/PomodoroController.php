<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ExpService;
use App\Services\StreakService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PomodoroController extends Controller
{
    public function __construct(
        private ExpService $expService,
        private StreakService $streakService,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $sessions = $request->user()->pomodoroSessions()
            ->with('task:id,title')
            ->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 15);

        return response()->json($sessions);
    }

    public function start(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'task_id' => ['nullable', 'exists:tasks,id'],
            'duration_minutes' => ['nullable', 'integer', 'min:1', 'max:120'],
            'break_minutes' => ['nullable', 'integer', 'min:1', 'max:30'],
        ]);

        // Auto-cancel any old incomplete sessions (older than 24 hours)
        $request->user()->pomodoroSessions()
            ->whereIn('status', ['running', 'paused'])
            ->where('created_at', '<', now()->subDay())
            ->update([
                'status' => 'cancelled',
                'ended_at' => now(),
            ]);

        // Check for recent active sessions
        $running = $request->user()->pomodoroSessions()
            ->whereIn('status', ['running', 'paused'])
            ->where('created_at', '>=', now()->subDay())
            ->first();

        if ($running) {
            return response()->json([
                'message' => 'Please complete or cancel your current session first.',
            ], 422);
        }

        $session = $request->user()->pomodoroSessions()->create([
            'task_id' => $validated['task_id'] ?? null,
            'duration_minutes' => $validated['duration_minutes'] ?? 25,
            'break_minutes' => $validated['break_minutes'] ?? 5,
            'status' => 'running',
            'started_at' => now(),
        ]);

        return response()->json($session, 201);
    }

    public function pause(Request $request, int $id): JsonResponse
    {
        $session = $request->user()->pomodoroSessions()->findOrFail($id);

        if ($session->status !== 'running') {
            return response()->json(['message' => 'Session is not running.'], 422);
        }

        $session->update(['status' => 'paused']);

        return response()->json($session);
    }

    public function resume(Request $request, int $id): JsonResponse
    {
        $session = $request->user()->pomodoroSessions()->findOrFail($id);

        if ($session->status !== 'paused') {
            return response()->json(['message' => 'Session is not paused.'], 422);
        }

        $session->update(['status' => 'running']);

        return response()->json($session);
    }

    public function complete(Request $request, int $id): JsonResponse
    {
        $session = $request->user()->pomodoroSessions()->findOrFail($id);

        if ($session->status === 'completed') {
            return response()->json(['message' => 'Session already completed.'], 422);
        }

        $session->update([
            'status' => 'completed',
            'ended_at' => now(),
        ]);

        $this->expService->awardExp(
            $request->user(),
            $session->exp_reward,
            'pomodoro',
            $session,
            "Completed {$session->duration_minutes}min focus session"
        );

        $this->streakService->recordActivity($request->user());

        return response()->json([
            'session' => $session->fresh(),
            'message' => "Focus session completed! +{$session->exp_reward} EXP",
        ]);
    }

    public function cancel(Request $request, int $id): JsonResponse
    {
        $session = $request->user()->pomodoroSessions()->findOrFail($id);

        if (in_array($session->status, ['completed', 'cancelled'])) {
            return response()->json(['message' => 'Session cannot be cancelled.'], 422);
        }

        $session->update([
            'status' => 'cancelled',
            'ended_at' => now(),
        ]);

        return response()->json(['message' => 'Session cancelled.']);
    }

    public function stats(Request $request): JsonResponse
    {
        $user = $request->user();

        $todaySessions = $user->pomodoroSessions()
            ->where('status', 'completed')
            ->whereDate('created_at', today())
            ->count();

        $totalMinutes = $user->pomodoroSessions()
            ->where('status', 'completed')
            ->sum('duration_minutes');

        $weekSessions = $user->pomodoroSessions()
            ->where('status', 'completed')
            ->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])
            ->count();

        return response()->json([
            'today_sessions' => $todaySessions,
            'total_focus_minutes' => $totalMinutes,
            'week_sessions' => $weekSessions,
        ]);
    }
}

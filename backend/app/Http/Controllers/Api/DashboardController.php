<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\StreakService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(
        private StreakService $streakService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $taskStats = [
            'total' => $user->tasks()->count(),
            'completed' => $user->tasks()->where('status', 'completed')->count(),
            'pending' => $user->tasks()->where('status', 'pending')->count(),
            'in_progress' => $user->tasks()->where('status', 'in_progress')->count(),
            'today_completed' => $user->tasks()
                ->where('status', 'completed')
                ->whereDate('completed_at', today())
                ->count(),
        ];

        $pomodoroStats = [
            'today_sessions' => $user->pomodoroSessions()
                ->where('status', 'completed')
                ->whereDate('created_at', today())
                ->count(),
            'today_minutes' => $user->pomodoroSessions()
                ->where('status', 'completed')
                ->whereDate('created_at', today())
                ->sum('duration_minutes'),
            'total_sessions' => $user->pomodoroSessions()
                ->where('status', 'completed')
                ->count(),
        ];

        $streak = $this->streakService->getStreak($user);

        $todayMood = $user->moods()->where('date', today())->first();

        $recentExp = $user->expLogs()
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        $todaySchedules = $user->schedules()
            ->where('is_active', true)
            ->with(['completions' => fn($q) => $q->whereDate('completed_date', today())])
            ->get();

        return response()->json([
            'user' => [
                'name' => $user->name,
                'level' => $user->level,
                'current_exp' => $user->current_exp,
                'exp_to_next_level' => $user->exp_to_next_level,
                'total_exp' => $user->total_exp,
            ],
            'tasks' => $taskStats,
            'pomodoro' => $pomodoroStats,
            'streak' => $streak,
            'today_mood' => $todayMood,
            'recent_exp' => $recentExp,
            'today_schedules' => $todaySchedules,
        ]);
    }
}

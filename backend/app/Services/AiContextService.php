<?php

namespace App\Services;

use App\Models\User;
use Carbon\Carbon;

class AiContextService
{
    public function buildContext(User $user): array
    {
        return [
            'user_profile' => $this->getUserProfile($user),
            'tasks' => $this->getTaskContext($user),
            'pomodoro' => $this->getPomodoroContext($user),
            'schedules' => $this->getScheduleContext($user),
            'mood' => $this->getMoodContext($user),
            'streak' => $this->getStreakContext($user),
            'patterns' => $this->getPatterns($user),
        ];
    }

    public function buildSystemPrompt(array $context): string
    {
        $profile = $context['user_profile'];
        $tasks = $context['tasks'];
        $pomodoro = $context['pomodoro'];
        $schedules = $context['schedules'];
        $mood = $context['mood'];
        $streak = $context['streak'];
        $patterns = $context['patterns'];

        return <<<PROMPT
You are Mentra AI, a friendly and insightful productivity assistant. You have access to the user's productivity data and should provide personalized advice, encouragement, and actionable suggestions.

Be concise, supportive, and data-driven. Use the context below to give relevant advice.

## User Profile
- Name: {$profile['name']}
- Level: {$profile['level']} (EXP: {$profile['current_exp']}/{$profile['exp_to_next_level']})
- Total EXP: {$profile['total_exp']}

## Tasks
- Pending: {$tasks['pending_count']}
- In Progress: {$tasks['in_progress_count']}
- Completed Today: {$tasks['completed_today']}
- Total Completed: {$tasks['completed_total']}
- Overdue: {$tasks['overdue_count']}
- Pending Tasks: {$tasks['pending_list']}

## Pomodoro (Focus Sessions)
- Today: {$pomodoro['today_sessions']} sessions ({$pomodoro['today_minutes']} min)
- This Week: {$pomodoro['week_sessions']} sessions
- Total Focus Time: {$pomodoro['total_minutes']} min

## Schedules
- Active Routines: {$schedules['active_count']}
- Completed Today: {$schedules['completed_today']}
- Pending Today: {$schedules['pending_today']}
- Routines: {$schedules['routine_list']}

## Mood
- Today: {$mood['today']}
- Recent Trend: {$mood['recent_trend']}

## Streak
- Current: {$streak['current']} days
- Longest: {$streak['longest']} days

## Patterns
{$patterns['summary']}

Guidelines:
- Be encouraging but honest
- Give specific, actionable advice based on the data
- If mood is low, be extra supportive
- Suggest focus strategies if pomodoro usage is low
- Remind about overdue tasks gently
- Celebrate achievements and streaks
- Keep responses concise (2-4 paragraphs max)
- Use emoji sparingly for warmth
PROMPT;
    }

    private function getUserProfile(User $user): array
    {
        return [
            'name' => $user->name,
            'level' => $user->level,
            'total_exp' => $user->total_exp,
            'current_exp' => $user->current_exp,
            'exp_to_next_level' => $user->exp_to_next_level,
        ];
    }

    private function getTaskContext(User $user): array
    {
        $tasks = $user->tasks();

        $pendingTasks = $user->tasks()
            ->whereIn('status', ['pending', 'in_progress'])
            ->orderBy('priority', 'desc')
            ->limit(10)
            ->get(['title', 'priority', 'status', 'due_date']);

        $pendingList = $pendingTasks->map(function ($t) {
            $due = $t->due_date ? " (due: {$t->due_date->format('M d')})" : '';
            return "- [{$t->priority}] {$t->title} ({$t->status}){$due}";
        })->implode("\n");

        return [
            'pending_count' => $tasks->where('status', 'pending')->count(),
            'in_progress_count' => $tasks->where('status', 'in_progress')->count(),
            'completed_today' => $user->tasks()->where('status', 'completed')->whereDate('completed_at', today())->count(),
            'completed_total' => $tasks->where('status', 'completed')->count(),
            'overdue_count' => $user->tasks()->whereIn('status', ['pending', 'in_progress'])->where('due_date', '<', today())->count(),
            'pending_list' => $pendingList ?: 'None',
        ];
    }

    private function getPomodoroContext(User $user): array
    {
        $sessions = $user->pomodoroSessions()->where('status', 'completed');

        return [
            'today_sessions' => (clone $sessions)->whereDate('created_at', today())->count(),
            'today_minutes' => (clone $sessions)->whereDate('created_at', today())->sum('duration_minutes'),
            'week_sessions' => (clone $sessions)->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
            'total_minutes' => $sessions->sum('duration_minutes'),
        ];
    }

    private function getScheduleContext(User $user): array
    {
        $schedules = $user->schedules()->where('is_active', true)->get();

        $completedToday = 0;
        $pendingToday = 0;
        $routineList = [];

        foreach ($schedules as $schedule) {
            $done = $schedule->completions()->where('completed_date', today())->exists();
            if ($done) {
                $completedToday++;
            } else {
                $pendingToday++;
            }
            $status = $done ? '✓' : '○';
            $time = $schedule->start_time ? " at {$schedule->start_time}" : '';
            $routineList[] = "- {$status} {$schedule->title} ({$schedule->type}){$time}";
        }

        return [
            'active_count' => $schedules->count(),
            'completed_today' => $completedToday,
            'pending_today' => $pendingToday,
            'routine_list' => implode("\n", $routineList) ?: 'None',
        ];
    }

    private function getMoodContext(User $user): array
    {
        $todayMood = $user->moods()->where('date', today())->first();
        $recentMoods = $user->moods()->orderBy('date', 'desc')->limit(7)->get();

        $trend = $recentMoods->map(fn($m) => "{$m->mood} (energy: {$m->energy_level}/10)")->implode(', ');

        return [
            'today' => $todayMood
                ? "{$todayMood->mood} (energy: {$todayMood->energy_level}/10)" . ($todayMood->note ? " - \"{$todayMood->note}\"" : '')
                : 'Not logged yet',
            'recent_trend' => $trend ?: 'No data',
        ];
    }

    private function getStreakContext(User $user): array
    {
        $streak = $user->streak;

        return [
            'current' => $streak?->current_streak ?? 0,
            'longest' => $streak?->longest_streak ?? 0,
        ];
    }

    private function getPatterns(User $user): array
    {
        $completedTasks7d = $user->tasks()
            ->where('status', 'completed')
            ->where('completed_at', '>=', now()->subDays(7))
            ->count();

        $pomodoro7d = $user->pomodoroSessions()
            ->where('status', 'completed')
            ->where('created_at', '>=', now()->subDays(7))
            ->count();

        $moodAvgEnergy = $user->moods()
            ->where('date', '>=', now()->subDays(7))
            ->avg('energy_level');

        $lines = [];
        $lines[] = "- Tasks completed (7d): {$completedTasks7d}";
        $lines[] = "- Focus sessions (7d): {$pomodoro7d}";
        $lines[] = "- Avg energy (7d): " . ($moodAvgEnergy ? round($moodAvgEnergy, 1) . "/10" : "N/A");

        if ($completedTasks7d === 0 && $pomodoro7d === 0) {
            $lines[] = "- Note: User has been inactive this week";
        }

        return [
            'summary' => implode("\n", $lines),
        ];
    }
}

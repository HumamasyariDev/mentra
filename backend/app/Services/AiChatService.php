<?php

namespace App\Services;

use App\Models\ChatMessage;
use App\Models\User;
use Illuminate\Support\Facades\Http;

class AiChatService
{
    public function __construct(
        private AiContextService $contextService,
    ) {}

    public function chat(User $user, string $message): ChatMessage
    {
        // Save user message
        $userMessage = ChatMessage::create([
            'user_id' => $user->id,
            'role' => 'user',
            'content' => $message,
        ]);

        // Build context
        $context = $this->contextService->buildContext($user);
        $systemPrompt = $this->contextService->buildSystemPrompt($context);

        // Get recent chat history (last 10 messages for context)
        $history = ChatMessage::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->reverse()
            ->values();

        // Build messages array for API
        $messages = [
            ['role' => 'system', 'content' => $systemPrompt],
        ];

        foreach ($history as $msg) {
            $messages[] = [
                'role' => $msg->role,
                'content' => $msg->content,
            ];
        }

        // Call AI API
        $aiResponse = $this->callAiApi($messages);

        // Save assistant response
        $assistantMessage = ChatMessage::create([
            'user_id' => $user->id,
            'role' => 'assistant',
            'content' => $aiResponse,
            'context_snapshot' => $context,
        ]);

        return $assistantMessage;
    }

    private function callAiApi(array $messages): string
    {
        $apiKey = config('services.openai.key');

        if (!$apiKey) {
            return $this->fallbackResponse($messages);
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$apiKey}",
                'Content-Type' => 'application/json',
            ])->timeout(30)->post('https://api.openai.com/v1/chat/completions', [
                'model' => config('services.openai.model', 'gpt-3.5-turbo'),
                'messages' => $messages,
                'max_tokens' => 500,
                'temperature' => 0.7,
            ]);

            if ($response->successful()) {
                return $response->json('choices.0.message.content') ?? 'Sorry, I could not generate a response.';
            }

            return $this->fallbackResponse($messages);
        } catch (\Exception $e) {
            return $this->fallbackResponse($messages);
        }
    }

    private function fallbackResponse(array $messages): string
    {
        // Smart fallback when no API key is configured
        // Parse the system prompt to extract context data
        $systemPrompt = $messages[0]['content'] ?? '';
        $userMessage = end($messages)['content'] ?? '';

        $response = $this->generateContextualResponse($systemPrompt, $userMessage);

        return $response;
    }

    private function generateContextualResponse(string $systemPrompt, string $userMessage): string
    {
        $lower = strtolower($userMessage);

        // Extract data from system prompt
        preg_match('/Pending: (\d+)/', $systemPrompt, $pendingMatch);
        preg_match('/Completed Today: (\d+)/', $systemPrompt, $completedMatch);
        preg_match('/Overdue: (\d+)/', $systemPrompt, $overdueMatch);
        preg_match('/Current: (\d+) days/', $systemPrompt, $streakMatch);
        preg_match('/Today: (.+)/', $systemPrompt, $moodMatch);
        preg_match('/Today: (\d+) sessions \((\d+) min\)/', $systemPrompt, $pomodoroMatch);
        preg_match('/Level: (\d+)/', $systemPrompt, $levelMatch);

        $pending = $pendingMatch[1] ?? 0;
        $completedToday = $completedMatch[1] ?? 0;
        $overdue = $overdueMatch[1] ?? 0;
        $streak = $streakMatch[1] ?? 0;
        $level = $levelMatch[1] ?? 1;
        $todaySessions = $pomodoroMatch[1] ?? 0;
        $todayMinutes = $pomodoroMatch[2] ?? 0;

        // Task-related questions
        if (str_contains($lower, 'task') || str_contains($lower, 'tugas') || str_contains($lower, 'todo')) {
            $parts = [];
            if ($completedToday > 0) {
                $parts[] = "Great job! You've completed **{$completedToday} task(s)** today. 🎉";
            }
            if ($pending > 0) {
                $parts[] = "You have **{$pending} pending task(s)** waiting. Try tackling the high-priority ones first.";
            }
            if ($overdue > 0) {
                $parts[] = "⚠️ You have **{$overdue} overdue task(s)**. Consider reviewing and updating their deadlines.";
            }
            if (empty($parts)) {
                $parts[] = "You're all caught up on tasks! Consider planning ahead for tomorrow.";
            }
            return implode("\n\n", $parts);
        }

        // Focus/Pomodoro questions
        if (str_contains($lower, 'focus') || str_contains($lower, 'pomodoro') || str_contains($lower, 'timer') || str_contains($lower, 'fokus')) {
            if ($todaySessions > 0) {
                return "You've completed **{$todaySessions} focus session(s)** today ({$todayMinutes} minutes). " .
                    ($todaySessions >= 4 ? "That's excellent deep work! Remember to take proper breaks. 💪" : "Keep going! Try to aim for at least 4 sessions today for optimal productivity.");
            }
            return "You haven't started any focus sessions today. A 25-minute Pomodoro is a great way to build momentum! Start with your most important task. 🎯";
        }

        // Mood questions
        if (str_contains($lower, 'mood') || str_contains($lower, 'feel') || str_contains($lower, 'perasaan') || str_contains($lower, 'rasa')) {
            $moodStr = $moodMatch[1] ?? 'Not logged yet';
            if (str_contains($moodStr, 'Not logged')) {
                return "You haven't logged your mood today. Taking a moment to check in with yourself is important for self-awareness. Head to the Mood page to log how you're feeling! 😊";
            }
            if (str_contains($moodStr, 'great') || str_contains($moodStr, 'good')) {
                return "You're feeling **{$moodStr}** today — that's wonderful! Ride this positive energy and tackle something challenging. 🌟";
            }
            if (str_contains($moodStr, 'bad') || str_contains($moodStr, 'terrible')) {
                return "I see you're not feeling your best today ({$moodStr}). That's okay — be gentle with yourself. Focus on small wins and don't hesitate to take breaks. Tomorrow is a new day. 💙";
            }
            return "Your mood today: **{$moodStr}**. Staying aware of your emotional state helps you work smarter. Keep tracking! 📊";
        }

        // Streak questions
        if (str_contains($lower, 'streak') || str_contains($lower, 'konsisten')) {
            if ($streak > 0) {
                return "🔥 You're on a **{$streak}-day streak**! Consistency is the key to growth. Keep showing up every day and your streak will keep climbing!";
            }
            return "Your streak is at 0. Complete a task, finish a focus session, or check off a schedule item to start building your streak today! 🚀";
        }

        // Level/EXP questions
        if (str_contains($lower, 'level') || str_contains($lower, 'exp') || str_contains($lower, 'progress')) {
            return "You're at **Level {$level}**. Every task you complete, every focus session you finish, and every schedule you check off earns you EXP. Keep grinding! 📈";
        }

        // General greeting / help
        if (str_contains($lower, 'hi') || str_contains($lower, 'hello') || str_contains($lower, 'halo') || str_contains($lower, 'hey')) {
            $parts = ["Hey there! 👋 Here's your quick summary:"];
            $parts[] = "- **{$pending}** pending tasks" . ($overdue > 0 ? " ({$overdue} overdue)" : "");
            $parts[] = "- **{$todaySessions}** focus sessions today ({$todayMinutes} min)";
            $parts[] = "- **{$streak}-day** streak";
            $parts[] = "- Level **{$level}**";
            $parts[] = "\nAsk me about your tasks, focus sessions, mood, streaks, or anything productivity-related!";
            return implode("\n", $parts);
        }

        // Advice / tips
        if (str_contains($lower, 'advice') || str_contains($lower, 'tip') || str_contains($lower, 'saran') || str_contains($lower, 'suggest')) {
            $tips = [];
            if ($overdue > 0) $tips[] = "Review your **{$overdue} overdue task(s)** — reschedule or break them into smaller pieces.";
            if ($todaySessions == 0) $tips[] = "Start a **Pomodoro session** to build focus momentum.";
            if ($pending > 3) $tips[] = "You have {$pending} pending tasks. Prioritize the top 3 and focus on those first.";
            if ($streak > 3) $tips[] = "Your {$streak}-day streak is impressive — keep it going!";
            if (empty($tips)) $tips[] = "You're doing well! Stay consistent and keep building good habits.";
            return "Here are my suggestions:\n\n" . implode("\n\n", $tips);
        }

        // Default
        return "I'm your Mentra productivity assistant! I can help you with:\n\n" .
            "- 📋 **Tasks** — Ask about your pending/completed tasks\n" .
            "- ⏱️ **Focus** — Check your Pomodoro stats\n" .
            "- 📅 **Schedules** — Review your routines\n" .
            "- 😊 **Mood** — Discuss your mood patterns\n" .
            "- 🔥 **Streaks** — Check your consistency\n" .
            "- 💡 **Advice** — Get productivity tips\n\n" .
            "Just ask me anything!";
    }
}

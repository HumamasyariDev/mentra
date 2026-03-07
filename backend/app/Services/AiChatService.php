<?php

namespace App\Services;

use App\Models\ChatMessage;
use App\Models\User;

/**
 * AiChatService (Refactored)
 *
 * BEFORE: Called OpenAI API to generate AI responses.
 * AFTER:  Acts as a pure message store service.
 *
 * The LLM (Puter.js / Claude) now runs entirely in the browser via
 * the LangChain.js agent on the frontend. The backend's only job is
 * to persist chat messages for history purposes.
 *
 * If you need a server-side AI fallback in the future, re-add the
 * HuggingFace or another provider here. For now, the frontend agent
 * handles all AI reasoning via PuterChatModel.
 */
class AiChatService
{
    /**
     * Store a user message and return a neutral acknowledgment.
     *
     * This is used by the legacy /api/chat/send endpoint.
     * The frontend Chat page (/chat) handles AI responses itself via Puter.js.
     * This endpoint now just persists the message and returns a basic response.
     *
     * @param User   $user    The authenticated user.
     * @param string $message The user's message text.
     * @return ChatMessage    The AI/assistant acknowledgment message.
     */
    public function chat(User $user, string $message): ChatMessage
    {
        // 1. Persist the user message
        ChatMessage::create([
            'user_id' => $user->id,
            'role' => 'user',
            'content' => $message,
        ]);

        // 2. Build a minimal context response
        //    Real AI is now handled by Puter.js in the browser (MentraAgent.jsx)
        $responseContent = $this->buildServerSideContext($user, $message);

        // 3. Persist and return the assistant message
        return ChatMessage::create([
            'user_id' => $user->id,
            'role' => 'assistant',
            'content' => $responseContent,
        ]);
    }

    /**
     * Build a lightweight server-side context response.
     * This replaces the old OpenAI call — it provides useful data
     * without making any external API calls.
     *
     * For richer AI responses, use the /agent page which uses Puter.js.
     */
    private function buildServerSideContext(User $user, string $message): string
    {
        $lower = strtolower($message);

        // Collect quick stats
        $pendingCount = $user->tasks()->whereIn('status', ['pending', 'in_progress'])->count();
        $overdueCount = $user->tasks()
            ->whereIn('status', ['pending', 'in_progress'])
            ->where('due_date', '<', today())
            ->count();
        $completedToday = $user->tasks()
            ->where('status', 'completed')
            ->whereDate('completed_at', today())
            ->count();
        $streak = $user->streak?->current_streak ?? 0;

        // Task queries
        if (str_contains($lower, 'task') || str_contains($lower, 'tugas')) {
            $parts = [];
            if ($completedToday > 0)
                $parts[] = "✅ Kamu sudah menyelesaikan **{$completedToday} task** hari ini!";
            if ($pendingCount > 0)
                $parts[] = "📋 Ada **{$pendingCount} task** yang menunggu.";
            if ($overdueCount > 0)
                $parts[] = "⚠️ **{$overdueCount} task** sudah melewati deadline.";
            if (empty($parts))
                $parts[] = "Semua task sudah beres! 🎉";
            return implode("\n\n", $parts) . "\n\n_Gunakan halaman **/agent** untuk AI yang lebih pintar._";
        }

        // Streak queries
        if (str_contains($lower, 'streak') || str_contains($lower, 'konsisten')) {
            return $streak > 0
                ? "🔥 Streak kamu sekarang **{$streak} hari**! Terus pertahankan!"
                : "Streak kamu masih 0. Selesaikan 1 task hari ini untuk memulai streak!";
        }

        // Level queries
        if (str_contains($lower, 'level') || str_contains($lower, 'exp')) {
            return "⚔️ Kamu di Level **{$user->level}** dengan **{$user->current_exp}/{$user->exp_to_next_level} EXP**. Keep going!";
        }

        // Default — redirect to agent
        return "💡 Halo, {$user->name}!\n\n" .
            "- Pending tasks: **{$pendingCount}** | Selesai hari ini: **{$completedToday}**\n" .
            "- Streak: **{$streak} hari** | Level: **{$user->level}**\n\n" .
            "_Untuk AI yang bisa buat task, cari info, dan berpikir untuk kamu — coba **/agent**!_";
    }
}

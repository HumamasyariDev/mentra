<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\NvidiaAIService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AIController extends Controller
{
    protected NvidiaAIService $ai;

    public function __construct(NvidiaAIService $ai)
    {
        $this->ai = $ai;
    }

    /**
     * Simple chat endpoint - single message exchange.
     * Used by: Chat.jsx (quick chat)
     */
    public function chat(Request $request): JsonResponse
    {
        $request->validate([
            'message' => 'required|string|max:4000',
            'system_prompt' => 'nullable|string|max:2000',
        ]);

        $systemPrompt = $request->input('system_prompt') ?? $this->getDefaultSystemPrompt();
        $response = $this->ai->ask($request->input('message'), $systemPrompt);

        return response()->json([
            'success' => true,
            'message' => $response,
        ]);
    }

    /**
     * Agent chat endpoint - with conversation history and action parsing.
     * Used by: MentraAgentWithSessions.jsx, MentraAgent.jsx
     */
    public function agentChat(Request $request): JsonResponse
    {
        $request->validate([
            'message' => 'required|string|max:4000',
            'history' => 'nullable|array',
            'history.*.role' => 'required_with:history|string|in:user,assistant,system',
            'history.*.content' => 'required_with:history|string',
            'system_prompt' => 'nullable|string|max:4000',
        ]);

        $history = $request->input('history', []);
        $systemPrompt = $request->input('system_prompt') ?? $this->getAgentSystemPrompt();

        $result = $this->ai->chatWithHistory(
            $history,
            $request->input('message'),
            $systemPrompt
        );

        return response()->json($result);
    }

    /**
     * Sandbox chat endpoint - for brainstorming/mind mapping.
     * Used by: SandboxChat.jsx, InfiniteCanvasMindMap.jsx
     */
    public function sandboxChat(Request $request): JsonResponse
    {
        $request->validate([
            'messages' => 'required|array|min:1',
            'messages.*.role' => 'required|string|in:user,assistant,system',
            'messages.*.content' => 'required|string',
        ]);

        $messages = $request->input('messages');
        
        $result = $this->ai->chat($messages, [
            'temperature' => 0.8,
            'max_tokens' => 2048,
        ]);

        return response()->json([
            'success' => $result['success'],
            'message' => $result['message'] ?? '',
            'error' => $result['error'] ?? null,
        ]);
    }

    /**
     * Quiz generation endpoint.
     * Used by: quizHelpers.js
     */
    public function generateQuiz(Request $request): JsonResponse
    {
        $request->validate([
            'material' => 'required|string|max:10000',
            'question_count' => 'nullable|integer|min:1|max:20',
        ]);

        $questionCount = $request->input('question_count', 5);
        $material = $request->input('material');

        $systemPrompt = "You are a quiz generator. Create educational multiple-choice questions based on the provided material. 
Output ONLY valid JSON array, no other text.";

        $userPrompt = "Generate {$questionCount} multiple-choice questions from this material:

{$material}

Output format (JSON array only):
[
  {
    \"question\": \"Question text?\",
    \"options\": [\"A. Option 1\", \"B. Option 2\", \"C. Option 3\", \"D. Option 4\"],
    \"correct\": 0
  }
]

Rules:
- correct is the 0-indexed position of the correct answer
- Each question must have exactly 4 options
- Questions should test understanding, not just memorization
- Output ONLY the JSON array, nothing else";

        $result = $this->ai->chat([
            ['role' => 'system', 'content' => $systemPrompt],
            ['role' => 'user', 'content' => $userPrompt],
        ], [
            'temperature' => 0.5,
            'max_tokens' => 3000,
        ]);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to generate quiz',
            ], 500);
        }

        // Try to parse JSON from response
        $content = $result['message'];
        $questions = $this->extractJsonArray($content);

        if (!$questions) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to parse quiz questions',
                'raw' => $content,
            ], 500);
        }

        return response()->json([
            'success' => true,
            'questions' => $questions,
        ]);
    }

    /**
     * Extract key points from study material.
     * Used by: quizHelpers.js (extractKeyPoints)
     */
    public function extractKeyPoints(Request $request): JsonResponse
    {
        $request->validate([
            'material' => 'required|string|max:10000',
        ]);

        $systemPrompt = "You are an educational content analyzer. Extract and summarize key learning points from study materials.";

        $userPrompt = "Extract the key learning points from this material. Be concise but comprehensive:

{$request->input('material')}

Format your response as a bulleted list of key points.";

        $response = $this->ai->ask($userPrompt, $systemPrompt);

        return response()->json([
            'success' => true,
            'key_points' => $response,
        ]);
    }

    /**
     * Mind map generation endpoint.
     * Used by: InfiniteCanvasMindMap.jsx
     */
    public function generateMindMap(Request $request): JsonResponse
    {
        $request->validate([
            'messages' => 'required|array|min:1',
        ]);

        $systemPrompt = "You are a mind map generator. Analyze the conversation and create a hierarchical mind map structure.
Output ONLY valid JSON with this structure, no other text:
{
  \"nodes\": [
    {\"id\": \"1\", \"label\": \"Central Topic\", \"x\": 0, \"y\": 0},
    {\"id\": \"2\", \"label\": \"Subtopic\", \"x\": 200, \"y\": -100}
  ],
  \"edges\": [
    {\"source\": \"1\", \"target\": \"2\"}
  ]
}";

        $conversationText = collect($request->input('messages'))
            ->map(fn($m) => "{$m['role']}: {$m['content']}")
            ->join("\n");

        $result = $this->ai->chat([
            ['role' => 'system', 'content' => $systemPrompt],
            ['role' => 'user', 'content' => "Generate a mind map from this conversation:\n\n{$conversationText}"],
        ], [
            'temperature' => 0.6,
            'max_tokens' => 2000,
        ]);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to generate mind map',
            ], 500);
        }

        $mindMap = $this->extractJsonObject($result['message']);

        return response()->json([
            'success' => true,
            'mindmap' => $mindMap,
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Private Helpers
    // ─────────────────────────────────────────────────────────────────────────

    private function getDefaultSystemPrompt(): string
    {
        return "You are Mentra AI, a helpful and friendly productivity assistant built into the Mentra app. 
You help users manage their tasks, focus sessions (Pomodoro), schedules, mood tracking, and streaks. 
Keep responses concise, motivating, and actionable. Use friendly, supportive language.
Respond in the same language as the user (Indonesian or English).";
    }

    private function getAgentSystemPrompt(): string
    {
        $today = date('Y-m-d');
        $tomorrow = date('Y-m-d', strtotime('+1 day'));
        $nextWeek = date('Y-m-d', strtotime('+7 days'));
        $endOfMonth = date('Y-m-t');

        return "Kamu adalah Mentra AI — asisten produktivitas personal yang cerdas dan ramah.
Tanggal hari ini: {$today}.

=== ATURAN PENTING ===

JIKA user meminta membuat task, to-do, jadwal, atau reminder — KELUARKAN HANYA format JSON ini (tanpa teks lain):
```json
{
  \"action\": \"create_task\",
  \"payload\": {
    \"title\": \"Judul task yang jelas dan singkat\",
    \"deadline\": \"YYYY-MM-DD\",
    \"difficulty\": \"Easy | Medium | Hard\",
    \"description\": \"Deskripsi opsional\"
  }
}
```

JIKA user meminta informasi atau tips produktivitas — KELUARKAN format ini:
```json
{
  \"action\": \"search_knowledge\",
  \"payload\": {
    \"query\": \"kata kunci pencarian dalam bahasa Inggris\"
  }
}
```

ATURAN konversi tanggal (deadline):
- \"besok\" → {$tomorrow}
- \"lusa\" → " . date('Y-m-d', strtotime('+2 days')) . "
- \"minggu depan\" → {$nextWeek}
- \"akhir bulan\" → {$endOfMonth}
- Jika tidak ada deadline → null

ATURAN difficulty:
- \"mudah\", \"gampang\", \"santai\" → Easy
- \"sedang\", \"biasa\", \"normal\" → Medium  
- \"susah\", \"sulit\", \"rumit\", \"penting\", \"urgent\" → Hard

JIKA hanya percakapan biasa (greeting, tanya kabar, diskusi umum) — jawab NATURAL dalam bahasa Indonesia, TANPA JSON.

=== KEMAMPUANMU ===
- Membuat task dan menyimpannya ke database
- Mencari tips produktivitas dari knowledge base
- Menjawab pertanyaan umum seputar produktivitas

Selalu ramah, singkat, dan to the point.";
    }

    private function extractJsonArray(string $content): ?array
    {
        // Try to find JSON array in the content
        if (preg_match('/\[[\s\S]*\]/m', $content, $matches)) {
            try {
                $decoded = json_decode($matches[0], true);
                if (is_array($decoded)) {
                    return $decoded;
                }
            } catch (\Exception $e) {
                // Fall through
            }
        }
        return null;
    }

    private function extractJsonObject(string $content): ?array
    {
        // Try to find JSON object in the content
        if (preg_match('/\{[\s\S]*\}/m', $content, $matches)) {
            try {
                $decoded = json_decode($matches[0], true);
                if (is_array($decoded)) {
                    return $decoded;
                }
            } catch (\Exception $e) {
                // Fall through
            }
        }
        return null;
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\NvidiaAIService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class JournalController extends Controller
{
    protected NvidiaAIService $ai;

    public function __construct(NvidiaAIService $ai)
    {
        $this->ai = $ai;
    }

    /**
     * List recent journal entries (paginated).
     */
    public function index(Request $request): JsonResponse
    {
        $journals = $request->user()->journals()
            ->orderBy('date', 'desc')
            ->paginate($request->per_page ?? 14);

        return response()->json($journals);
    }

    /**
     * Save or update a journal entry for a given date (defaults to today).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'content' => ['required', 'string', 'max:5000'],
            'date' => ['nullable', 'date'],
        ]);

        $date = $validated['date'] ?? today()->toDateString();

        $journal = $request->user()->journals()->updateOrCreate(
            ['date' => $date],
            ['content' => $validated['content']]
        );

        return response()->json($journal, 201);
    }

    /**
     * Get today's journal entry.
     */
    public function today(Request $request): JsonResponse
    {
        $journal = $request->user()->journals()
            ->where('date', today())
            ->first();

        return response()->json($journal);
    }

    /**
     * Get journal entry for a specific date.
     */
    public function byDate(Request $request): JsonResponse
    {
        $request->validate([
            'date' => ['required', 'date'],
        ]);

        $journal = $request->user()->journals()
            ->where('date', $request->date)
            ->first();

        return response()->json($journal);
    }

    /**
     * Get recent entries (last N days, default 14).
     */
    public function recent(Request $request): JsonResponse
    {
        $days = min((int) ($request->days ?? 14), 30);

        $journals = $request->user()->journals()
            ->where('date', '>=', now()->subDays($days)->toDateString())
            ->orderBy('date', 'desc')
            ->get();

        return response()->json($journals);
    }

    /**
     * AI-powered insights from recent journal entries.
     */
    public function insights(Request $request): JsonResponse
    {
        $journals = $request->user()->journals()
            ->where('date', '>=', now()->subDays(14)->toDateString())
            ->orderBy('date', 'asc')
            ->get();

        if ($journals->isEmpty()) {
            return response()->json([
                'success' => true,
                'has_data' => false,
                'message' => 'No journal entries found. Start writing to get insights!',
            ]);
        }

        // Build the entries text for AI
        $entriesText = $journals->map(function ($j) {
            return "[{$j->date->format('Y-m-d')} ({$j->date->format('l')})] {$j->content}";
        })->join("\n\n");

        $systemPrompt = <<<PROMPT
You are a personal wellness analyst. You will receive a user's daily journal entries from the past 1-2 weeks.

Analyze the entries and return a JSON response with the following structure (NO markdown, NO code blocks, ONLY raw JSON):

{
  "mood_trend": [
    {"date": "2026-03-20", "score": 7, "label": "happy"},
    {"date": "2026-03-21", "score": 4, "label": "stressed"}
  ],
  "summary": "A 2-3 sentence overview of the user's week/period.",
  "patterns": [
    "Pattern observation 1",
    "Pattern observation 2",
    "Pattern observation 3"
  ],
  "suggestion": "One actionable, encouraging suggestion for the user."
}

Rules:
- mood_trend: One entry per journal date. Score is 1-10 (1=very bad, 10=very happy). Label is one of: "happy", "good", "neutral", "stressed", "sad", "anxious", "energetic", "tired", "frustrated", "grateful".
- summary: Concise, empathetic, observational.
- patterns: 2-4 key patterns you notice (time-based, activity-based, emotional patterns).
- suggestion: Specific, kind, actionable.
- If the user writes in Indonesian, respond in Indonesian.
- If the user writes in English, respond in English.
- Match the language of the journal entries.
- Return ONLY valid JSON, nothing else.
PROMPT;

        $userMessage = "Here are my journal entries:\n\n{$entriesText}";

        $result = $this->ai->chat([
            ['role' => 'system', 'content' => $systemPrompt],
            ['role' => 'user', 'content' => $userMessage],
        ], [
            'temperature' => 0.4,
            'max_tokens' => 1024,
        ]);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to generate insights',
            ], 500);
        }

        // Parse the AI response as JSON
        $raw = $result['message'];

        // Try to extract JSON from the response (handle markdown code blocks if any)
        $jsonStr = $raw;
        if (preg_match('/```(?:json)?\s*([\s\S]*?)```/', $raw, $matches)) {
            $jsonStr = $matches[1];
        }

        $insights = json_decode(trim($jsonStr), true);

        if (!$insights) {
            // Fallback: return raw text as summary
            return response()->json([
                'success' => true,
                'has_data' => true,
                'insights' => [
                    'mood_trend' => [],
                    'summary' => $raw,
                    'patterns' => [],
                    'suggestion' => '',
                ],
                'entry_count' => $journals->count(),
            ]);
        }

        return response()->json([
            'success' => true,
            'has_data' => true,
            'insights' => $insights,
            'entry_count' => $journals->count(),
        ]);
    }
}

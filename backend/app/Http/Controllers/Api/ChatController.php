<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ChatMessage;
use App\Services\AiChatService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    public function __construct(
        private AiChatService $chatService,
    ) {}

    public function send(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'message' => ['required', 'string', 'max:1000'],
        ]);

        $response = $this->chatService->chat($request->user(), $validated['message']);

        return response()->json([
            'message' => $response,
        ]);
    }

    public function history(Request $request): JsonResponse
    {
        $messages = ChatMessage::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->limit($request->limit ?? 50)
            ->get()
            ->reverse()
            ->values();

        return response()->json($messages);
    }

    public function clear(Request $request): JsonResponse
    {
        ChatMessage::where('user_id', $request->user()->id)->delete();

        return response()->json(['message' => 'Chat history cleared.']);
    }
}

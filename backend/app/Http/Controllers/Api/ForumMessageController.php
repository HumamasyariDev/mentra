<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Channel;
use App\Models\ForumMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ForumMessageController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $messages = ForumMessage::query()
            ->with(['user', 'replyTo.user'])
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        return response()->json($messages);
    }

    public function channels(Request $request): JsonResponse
    {
        $channels = Channel::query()
            ->with('forum')
            ->orderBy('order')
            ->get();

        return response()->json($channels);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'channel_id' => 'required|exists:channels,id',
            'title' => 'nullable|string|max:255',
            'content' => 'required|string|max:2000',
            'reply_to_id' => 'nullable|exists:forum_messages,id',
        ]);

        $message = ForumMessage::create([
            'channel_id' => $validated['channel_id'],
            'user_id' => $request->user()->id,
            'title' => $validated['title'] ?? null,
            'content' => $validated['content'],
            'reply_to_id' => $validated['reply_to_id'] ?? null,
        ]);

        $message->load(['user', 'replyTo.user']);

        return response()->json($message, 201);
    }

    public function update(Request $request, ForumMessage $message): JsonResponse
    {
        if ($message->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'content' => 'required|string|max:2000',
        ]);

        $message->update([
            'title' => $validated['title'] ?? $message->title,
            'content' => $validated['content'],
            'is_edited' => true,
        ]);

        $message->load(['user', 'replyTo.user']);

        return response()->json($message);
    }

    public function destroy(Request $request, ForumMessage $message): JsonResponse
    {
        if ($message->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $message->delete();

        return response()->json(['message' => 'Message deleted successfully']);
    }
}

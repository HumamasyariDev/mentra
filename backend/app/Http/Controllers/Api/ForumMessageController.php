<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ForumMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ForumMessageController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $messages = ForumMessage::query()
            ->with(['user', 'replyTo.user'])
            ->withCount('replies')
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        return response()->json($messages);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'content' => 'required|string|max:2000',
            'reply_to_id' => 'nullable|exists:forum_messages,id',
        ]);

        $messageData = [
            'user_id' => $request->user()->id,
            'title' => $validated['title'] ?? null,
            'content' => $validated['content'],
            'reply_to_id' => $validated['reply_to_id'] ?? null,
        ];

        // Safeguard for unmigrated production DBs
        if (\Illuminate\Support\Facades\Schema::hasColumn('forum_messages', 'channel_id')) {
            $messageData['channel_id'] = 1; // Default fallback
        }

        $message = ForumMessage::create($messageData);

        $message->load(['user', 'replyTo.user']);
        $message->loadCount('replies');

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
        $message->loadCount('replies');

        return response()->json($message);
    }

    public function destroy(Request $request, ForumMessage $message): JsonResponse
    {
        $isOwner = $message->user_id === $request->user()->id;
        $isAdmin = (bool) $request->user()->is_admin;

        if (!$isOwner && !$isAdmin) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Cascade-delete all replies to this message
        ForumMessage::where('reply_to_id', $message->id)->delete();
        $message->delete();

        return response()->json(['message' => 'Message deleted successfully']);
    }
}

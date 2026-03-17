<?php

namespace App\Http\Controllers;

use App\Models\ChatSession;
use App\Models\AgentMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ChatSessionController extends Controller
{
    public function index()
    {
        $sessions = ChatSession::where('user_id', Auth::id())
            ->orderBy('last_message_at', 'desc')
            ->orderBy('updated_at', 'desc')
            ->get();

        return response()->json($sessions);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
        ]);

        $session = ChatSession::create([
            'user_id' => Auth::id(),
            'title' => $validated['title'] ?? 'New Chat',
            'last_message_at' => now(),
        ]);

        return response()->json($session, 201);
    }

    public function show($id)
    {
        $session = ChatSession::where('user_id', Auth::id())
            ->with('messages')
            ->findOrFail($id);

        return response()->json($session);
    }

    public function update(Request $request, $id)
    {
        $session = ChatSession::where('user_id', Auth::id())->findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
        ]);

        $session->update($validated);

        return response()->json($session);
    }

    public function destroy($id)
    {
        $session = ChatSession::where('user_id', Auth::id())->findOrFail($id);
        $session->delete();

        return response()->json(['message' => 'Session deleted successfully']);
    }

    public function storeMessage(Request $request, $id)
    {
        $session = ChatSession::where('user_id', Auth::id())->findOrFail($id);

        $validated = $request->validate([
            'role' => 'required|in:user,agent,error',
            'content' => 'required|string',
            'type' => 'nullable|string',
            'metadata' => 'nullable|array',
        ]);

        $message = $session->messages()->create($validated);

        $session->update(['last_message_at' => now()]);

        return response()->json($message, 201);
    }

    public function getMessages($id)
    {
        $session = ChatSession::where('user_id', Auth::id())->findOrFail($id);
        $messages = $session->messages()->orderBy('created_at', 'asc')->get();

        return response()->json($messages);
    }

    public function clearMessages($id)
    {
        $session = ChatSession::where('user_id', Auth::id())->findOrFail($id);
        $session->messages()->delete();

        return response()->json(['message' => 'Messages cleared successfully']);
    }
}

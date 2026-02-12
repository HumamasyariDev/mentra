<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SandboxController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $sandboxes = $request->user()->sandboxes()
            ->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 15);

        return response()->json($sandboxes);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        $sandbox = $request->user()->sandboxes()->create($validated);

        return response()->json($sandbox, 201);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $sandbox = $request->user()->sandboxes()
            ->with('messages')
            ->findOrFail($id);

        return response()->json($sandbox);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $sandbox = $request->user()->sandboxes()->findOrFail($id);

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        $sandbox->update($validated);

        return response()->json($sandbox);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $sandbox = $request->user()->sandboxes()->findOrFail($id);
        $sandbox->delete();

        return response()->json(['message' => 'Sandbox deleted.']);
    }

    public function sendMessage(Request $request, int $id): JsonResponse
    {
        $sandbox = $request->user()->sandboxes()->findOrFail($id);

        $validated = $request->validate([
            'content' => ['required', 'string'],
        ]);

        // Create user message
        $userMessage = $sandbox->messages()->create([
            'role' => 'user',
            'content' => $validated['content'],
        ]);

        // Mock AI response (placeholder for puter.com integration)
        $aiResponse = $sandbox->messages()->create([
            'role' => 'assistant',
            'content' => 'This is a placeholder AI response. Real AI integration with puter.com will be added soon!',
        ]);

        return response()->json([
            'user_message' => $userMessage,
            'ai_response' => $aiResponse,
        ]);
    }
}

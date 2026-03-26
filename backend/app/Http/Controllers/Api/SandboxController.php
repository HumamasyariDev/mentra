<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\NvidiaAIService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SandboxController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $sandboxes = $request->user()->sandboxes()
            ->withCount('messages')
            ->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 15);

        return response()->json($sandboxes);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'purposes' => ['nullable', 'array'],
            'purposes.*' => ['string', 'max:50'],
        ]);

        $sandbox = $request->user()->sandboxes()->create($validated);

        return response()->json($sandbox, 201);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $sandbox = $request->user()->sandboxes()
            ->with(['messages' => function ($q) {
                $q->orderBy('created_at', 'asc');
            }])
            ->findOrFail($id);

        return response()->json($sandbox);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $sandbox = $request->user()->sandboxes()->findOrFail($id);

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'purposes' => ['nullable', 'array'],
            'purposes.*' => ['string', 'max:50'],
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

    /**
     * Store a message in the sandbox (user or assistant).
     * Used by frontend to persist chat messages.
     */
    public function storeMessage(Request $request, int $id): JsonResponse
    {
        $sandbox = $request->user()->sandboxes()->findOrFail($id);

        $validated = $request->validate([
            'role' => ['required', 'string', 'in:user,assistant'],
            'content' => ['required', 'string'],
        ]);

        $message = $sandbox->messages()->create($validated);

        return response()->json($message, 201);
    }

    /**
     * Get all messages for a sandbox.
     */
    public function getMessages(Request $request, int $id): JsonResponse
    {
        $sandbox = $request->user()->sandboxes()->findOrFail($id);

        $messages = $sandbox->messages()
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json($messages);
    }
}

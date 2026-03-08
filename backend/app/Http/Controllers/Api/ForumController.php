<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Forum;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ForumController extends Controller
{
    public function index(): JsonResponse
    {
        $forums = Forum::with('channels')->orderBy('order')->get();
        
        return response()->json($forums);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'icon' => 'nullable|string',
            'order' => 'integer',
        ]);

        $forum = Forum::create($validated);

        return response()->json($forum, 201);
    }

    public function show(Forum $forum): JsonResponse
    {
        $forum->load('channels');
        
        return response()->json($forum);
    }

    public function update(Request $request, Forum $forum): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'string|max:255',
            'description' => 'nullable|string',
            'icon' => 'nullable|string',
            'order' => 'integer',
        ]);

        $forum->update($validated);

        return response()->json($forum);
    }

    public function destroy(Forum $forum): JsonResponse
    {
        $forum->delete();

        return response()->json(['message' => 'Forum deleted successfully']);
    }
}

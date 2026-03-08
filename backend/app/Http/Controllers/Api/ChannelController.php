<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Channel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChannelController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Channel::with('forum');

        if ($request->has('forum_id')) {
            $query->where('forum_id', $request->forum_id);
        }

        $channels = $query->orderBy('order')->get();

        return response()->json($channels);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'forum_id' => 'required|exists:forums,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'in:text,voice',
            'order' => 'integer',
        ]);

        $channel = Channel::create($validated);
        $channel->load('forum');

        return response()->json($channel, 201);
    }

    public function show(Channel $channel): JsonResponse
    {
        $channel->load('forum');

        return response()->json($channel);
    }

    public function update(Request $request, Channel $channel): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'string|max:255',
            'description' => 'nullable|string',
            'type' => 'in:text,voice',
            'order' => 'integer',
        ]);

        $channel->update($validated);
        $channel->load('forum');

        return response()->json($channel);
    }

    public function destroy(Channel $channel): JsonResponse
    {
        $channel->delete();

        return response()->json(['message' => 'Channel deleted successfully']);
    }
}

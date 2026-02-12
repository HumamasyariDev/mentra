<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MoodController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $moods = $request->user()->moods()
            ->orderBy('date', 'desc')
            ->paginate($request->per_page ?? 30);

        return response()->json($moods);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'mood' => ['required', 'in:great,good,okay,bad,terrible'],
            'energy_level' => ['nullable', 'integer', 'between:1,10'],
            'note' => ['nullable', 'string', 'max:500'],
            'date' => ['nullable', 'date'],
        ]);

        $date = $validated['date'] ?? today()->toDateString();

        $mood = $request->user()->moods()->updateOrCreate(
            ['date' => $date],
            [
                'mood' => $validated['mood'],
                'energy_level' => $validated['energy_level'] ?? 5,
                'note' => $validated['note'] ?? null,
            ]
        );

        return response()->json($mood, 201);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $mood = $request->user()->moods()->findOrFail($id);

        return response()->json($mood);
    }

    public function today(Request $request): JsonResponse
    {
        $mood = $request->user()->moods()
            ->where('date', today())
            ->first();

        return response()->json($mood);
    }

    public function weekly(Request $request): JsonResponse
    {
        $moods = $request->user()->moods()
            ->whereBetween('date', [now()->startOfWeek(), now()->endOfWeek()])
            ->orderBy('date')
            ->get();

        return response()->json($moods);
    }
}

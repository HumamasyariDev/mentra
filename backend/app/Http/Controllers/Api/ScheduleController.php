<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ExpService;
use App\Services\StreakService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ScheduleController extends Controller
{
    public function __construct(
        private ExpService $expService,
        private StreakService $streakService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $schedules = $request->user()->schedules()
            ->when($request->type, fn($q, $type) => $q->where('type', $type))
            ->when(
                $request->boolean('with_all_completions'),
                fn($q) => $q->with('completions'),
                fn($q) => $q->with(['completions' => fn($q) => $q->whereDate('completed_date', today())])
            )
            ->orderBy('start_time')
            ->get();

        return response()->json($schedules);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'type' => ['required', 'in:daily,weekly,monthly'],
            'start_time' => ['nullable', 'date_format:H:i'],
            'end_time' => ['nullable', 'date_format:H:i'],
            'days_of_week' => ['nullable', 'array'],
            'days_of_week.*' => ['integer', 'between:0,6'],
            'day_of_month' => ['nullable', 'integer', 'between:1,31'],
            'exp_reward' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        $schedule = $request->user()->schedules()->create($validated);

        return response()->json($schedule, 201);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $schedule = $request->user()->schedules()
            ->with('completions')
            ->findOrFail($id);

        return response()->json($schedule);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $schedule = $request->user()->schedules()->findOrFail($id);

        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'type' => ['in:daily,weekly,monthly'],
            'start_time' => ['nullable', 'date_format:H:i'],
            'end_time' => ['nullable', 'date_format:H:i'],
            'days_of_week' => ['nullable', 'array'],
            'day_of_month' => ['nullable', 'integer', 'between:1,31'],
            'is_active' => ['boolean'],
        ]);

        $schedule->update($validated);

        return response()->json($schedule);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $schedule = $request->user()->schedules()->findOrFail($id);
        $schedule->delete();

        return response()->json(['message' => 'Schedule deleted.']);
    }

    public function complete(Request $request, int $id): JsonResponse
    {
        $schedule = $request->user()->schedules()->findOrFail($id);

        $existing = $schedule->completions()
            ->where('completed_date', today())
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Already completed today.'], 422);
        }

        $schedule->completions()->create([
            'user_id' => $request->user()->id,
            'completed_date' => today(),
        ]);

        $this->expService->awardExp(
            $request->user(),
            $schedule->exp_reward,
            'schedule',
            $schedule,
            "Completed schedule: {$schedule->title}"
        );

        $this->streakService->recordActivity($request->user());

        return response()->json([
            'schedule' => $schedule->fresh()->load(['completions' => fn($q) => $q->whereDate('completed_date', today())]),
            'message' => "Schedule completed! +{$schedule->exp_reward} EXP",
        ]);
    }

    public function uncomplete(Request $request, int $id): JsonResponse
    {
        $schedule = $request->user()->schedules()->findOrFail($id);

        $completion = $schedule->completions()
            ->where('completed_date', today())
            ->first();

        if (!$completion) {
            return response()->json(['message' => 'Not completed today.'], 422);
        }

        $completion->delete();

        $this->expService->deductExp(
            $request->user(),
            $schedule->exp_reward,
            'schedule_uncomplete',
            $schedule,
            "Uncompleted schedule: {$schedule->title}"
        );

        return response()->json([
            'schedule' => $schedule->fresh()->load(['completions' => fn($q) => $q->whereDate('completed_date', today())]),
            'message' => "Schedule uncompleted. -{$schedule->exp_reward} EXP",
        ]);
    }
}

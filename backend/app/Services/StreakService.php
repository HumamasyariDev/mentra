<?php

namespace App\Services;

use App\Models\Streak;
use App\Models\User;
use Carbon\Carbon;

class StreakService
{
    public function recordActivity(User $user): Streak
    {
        $streak = $user->streak ?? Streak::create(['user_id' => $user->id]);
        $today = Carbon::today();

        if ($streak->last_activity_date === null) {
            $streak->current_streak = 1;
            $streak->longest_streak = 1;
            $streak->last_activity_date = $today;
            $streak->save();
            return $streak;
        }

        $lastDate = Carbon::parse($streak->last_activity_date);

        if ($lastDate->isSameDay($today)) {
            return $streak;
        }

        if ($lastDate->isSameDay($today->copy()->subDay())) {
            $streak->current_streak += 1;
        } else {
            $streak->current_streak = 1;
        }

        if ($streak->current_streak > $streak->longest_streak) {
            $streak->longest_streak = $streak->current_streak;
        }

        $streak->last_activity_date = $today;
        $streak->save();

        return $streak;
    }

    public function getStreak(User $user): Streak
    {
        return $user->streak ?? Streak::create(['user_id' => $user->id]);
    }
}

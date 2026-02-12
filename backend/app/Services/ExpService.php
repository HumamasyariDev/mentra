<?php

namespace App\Services;

use App\Models\ExpLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class ExpService
{
    public function awardExp(User $user, int $amount, string $source, Model $sourceable, ?string $description = null): ExpLog
    {
        $expLog = ExpLog::create([
            'user_id' => $user->id,
            'amount' => $amount,
            'source' => $source,
            'description' => $description,
            'sourceable_type' => get_class($sourceable),
            'sourceable_id' => $sourceable->id,
        ]);

        $user->total_exp += $amount;
        $user->current_exp += $amount;

        while ($user->current_exp >= $user->exp_to_next_level) {
            $user->current_exp -= $user->exp_to_next_level;
            $user->level += 1;
        }

        $user->save();

        return $expLog;
    }

    public function deductExp(User $user, int $amount, string $source, Model $sourceable, ?string $description = null): ExpLog
    {
        $expLog = ExpLog::create([
            'user_id' => $user->id,
            'amount' => -$amount,
            'source' => $source,
            'description' => $description,
            'sourceable_type' => get_class($sourceable),
            'sourceable_id' => $sourceable->id,
        ]);

        $user->total_exp = max(0, $user->total_exp - $amount);
        $user->current_exp = max(0, $user->current_exp - $amount);

        if ($user->current_exp < 0 && $user->level > 1) {
            $user->level -= 1;
            $user->current_exp = $user->exp_to_next_level + $user->current_exp;
        }

        $user->save();

        return $expLog;
    }

    public function getExpHistory(User $user, int $limit = 20)
    {
        return $user->expLogs()
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }
}

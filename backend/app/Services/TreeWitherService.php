<?php

namespace App\Services;

use App\Models\User;

class TreeWitherService
{
    /**
     * Check and update wither status for a user's trees.
     * Called on forest page load to sync wither states.
     */
    public function checkWitherStatus(User $user): void
    {
        $trees = $user->trees()
            ->where('is_withered', false)
            ->where('is_permanent', false)
            ->get();

        foreach ($trees as $tree) {
            if ($tree->shouldWither()) {
                $tree->update(['is_withered' => true]);
            }
        }
    }

    /**
     * Remove trees that are past their rescue window.
     * Returns the count of removed trees.
     */
    public function removeDeadTrees(User $user): int
    {
        $count = 0;
        $trees = $user->trees()->where('is_withered', true)->get();

        foreach ($trees as $tree) {
            if (!$tree->isInRescueWindow()) {
                $tree->delete();
                $count++;
            }
        }

        return $count;
    }
}

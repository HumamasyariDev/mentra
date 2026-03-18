<?php

namespace App\Services;

use App\Models\Tree;
use App\Models\User;

class WateringCanService
{
    protected function generateNextWaterAt()
    {
        return now()->addHours(random_int(6, 12));
    }

    /**
     * Award watering cans based on Pomodoro duration.
     * Preset durations: 15min=1, 25min=2, 45min=3, 60min=4
     * Custom durations use tiered brackets.
     */
    public function awardFromPomodoro(User $user, int $durationMinutes): int
    {
        $cans = match (true) {
            $durationMinutes >= 60 => 4,
            $durationMinutes >= 45 => 3,
            $durationMinutes >= 25 => 2,
            $durationMinutes >= 15 => 1,
            default => 0,
        };

        if ($cans > 0) {
            $user->increment('watering_cans', $cans);
        }

        return $cans;
    }

    /**
     * Water an active tree (with cooldown check).
     * Returns result array with success status and tree data.
     */
    public function waterActiveTree(User $user, Tree $tree): array
    {
        if (!$tree->is_active) {
            return ['success' => false, 'error' => 'Tree is not active'];
        }

        if ($user->watering_cans < 1) {
            return ['success' => false, 'error' => 'No watering cans available'];
        }

        if (!$tree->isActiveWaterReady()) {
            return [
                'success' => false,
                'error' => 'Cooldown active',
                'cooldown_remaining_seconds' => $tree->getActiveCooldownRemainingSeconds(),
                'next_water_at' => $tree->next_water_at,
            ];
        }

        // Handle withered tree rescue
        if ($tree->is_withered) {
            if (!$tree->isInRescueWindow()) {
                return ['success' => false, 'error' => 'Tree cannot be rescued'];
            }
            $tree->update([
                'is_withered' => false,
                'last_watered_at' => now(),
                'next_water_at' => $this->generateNextWaterAt(),
            ]);
            $user->decrement('watering_cans');
            return [
                'success' => true,
                'rescued' => true,
                'tree' => $tree->fresh()->load('treeType'),
            ];
        }

        // Cannot water a final stage active tree (should auto-archive)
        if ($tree->stage >= 5) {
            return ['success' => false, 'error' => 'Tree is already at final stage'];
        }

        // Normal watering
        $user->decrement('watering_cans');
        $tree->increment('water_progress');
        $tree->update([
            'last_watered_at' => now(),
            'next_water_at' => $this->generateNextWaterAt(),
        ]);

        // Check for stage advancement
        $advanced = false;
        $archived = false;
        $currentStageCost = $tree->treeType->getCostForStage($tree->stage);

        if ($tree->water_progress >= $currentStageCost) {
            $tree->update([
                'stage' => $tree->stage + 1,
                'water_progress' => 0,
            ]);
            $advanced = true;

            // If reached final stage (5), archive the tree
            if ($tree->fresh()->stage === 5) {
                $tree->update([
                    'is_active' => false,
                    'next_water_at' => null,
                ]);
                $archived = true;
            }
        }

        return [
            'success' => true,
            'advanced' => $advanced,
            'new_stage' => $advanced ? $tree->fresh()->stage : null,
            'archived' => $archived,
            'tree' => $tree->fresh()->load('treeType'),
        ];
    }

    /**
     * Water an archived tree (no cooldown, counts toward permanence).
     * Reviving a withered archived tree does NOT count toward the 10 waterings.
     */
    public function waterArchivedTree(User $user, Tree $tree): array
    {
        if ($tree->is_active) {
            return ['success' => false, 'error' => 'Tree is active, not archived'];
        }

        if ($tree->is_permanent) {
            return ['success' => false, 'error' => 'Tree is already permanent'];
        }

        if ($user->watering_cans < 1) {
            return ['success' => false, 'error' => 'No watering cans available'];
        }

        // Handle withered archived tree rescue
        if ($tree->is_withered) {
            if (!$tree->isInRescueWindow()) {
                return ['success' => false, 'error' => 'Tree cannot be rescued'];
            }
            $tree->update([
                'is_withered' => false,
                'last_watered_at' => now(),
            ]);
            $user->decrement('watering_cans');
            // Note: rescue watering does NOT count toward archive_waterings
            return [
                'success' => true,
                'rescued' => true,
                'tree' => $tree->fresh()->load('treeType'),
            ];
        }

        // Normal archived watering
        $user->decrement('watering_cans');
        $tree->update(['last_watered_at' => now()]);
        $tree->increment('archive_waterings');

        // Check for permanence
        $becamePermanent = false;
        if ($tree->fresh()->archive_waterings >= 10) {
            $tree->update(['is_permanent' => true]);
            $becamePermanent = true;
        }

        return [
            'success' => true,
            'became_permanent' => $becamePermanent,
            'tree' => $tree->fresh()->load('treeType'),
        ];
    }
}

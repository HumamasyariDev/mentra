<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TreeType extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'display_name',
        'stage_costs',
    ];

    protected $casts = [
        'stage_costs' => 'array',
    ];

    public function trees(): HasMany
    {
        return $this->hasMany(Tree::class);
    }

    /**
     * Get the incremental cost for a specific stage (0-4).
     * Stage 5 (final) has no cost as it's the last stage.
     */
    public function getCostForStage(int $stage): int
    {
        if ($stage < 0 || $stage >= count($this->stage_costs)) {
            return 0;
        }
        return $this->stage_costs[$stage] ?? 0;
    }

    /**
     * Get the cumulative total cans needed to reach a stage.
     * e.g., if stage_costs = [5, 10, 15, 20, 25]:
     *   Stage 0 (seed->1): 5 total
     *   Stage 1 (1->2): 15 total
     *   Stage 2 (2->3): 30 total
     *   Stage 3 (3->4): 50 total
     *   Stage 4 (4->final): 75 total
     */
    public function getCumulativeCost(int $stage): int
    {
        return array_sum(array_slice($this->stage_costs, 0, $stage + 1));
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Tree extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'tree_type_id',
        'stage',
        'water_progress',
        'is_active',
        'is_withered',
        'is_permanent',
        'archive_waterings',
        'last_watered_at',
        'next_water_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_withered' => 'boolean',
        'is_permanent' => 'boolean',
        'last_watered_at' => 'datetime',
        'next_water_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function treeType(): BelongsTo
    {
        return $this->belongsTo(TreeType::class);
    }

    /**
     * Get the asset name for this tree's current stage.
     * e.g., "pine_purple_seed", "pine_purple_stage_1", "pine_purple_stage_final"
     */
    public function getAssetName(): string
    {
        $stageName = match ($this->stage) {
            0 => 'seed',
            5 => 'stage_final',
            default => "stage_{$this->stage}",
        };
        return "{$this->treeType->name}_{$stageName}";
    }

    /**
     * Check if this tree can be watered.
     */
    public function canBeWatered(): bool
    {
        if ($this->is_active) {
            // Active trees can be watered until they reach final stage
            return $this->stage < 5;
        }
        // Archived trees can be watered if not yet permanent
        return !$this->is_permanent;
    }

    /**
     * Check whether an active tree is ready for its next watering.
     */
    public function isActiveWaterReady(): bool
    {
        if (!$this->is_active) {
            return false;
        }

        return !$this->next_water_at || !$this->next_water_at->isFuture();
    }

    /**
     * Get the remaining cooldown for an active tree in seconds.
     */
    public function getActiveCooldownRemainingSeconds(): int
    {
        if (!$this->is_active || !$this->next_water_at || !$this->next_water_at->isFuture()) {
            return 0;
        }

        return now()->diffInSeconds($this->next_water_at);
    }

    /**
     * Check if this tree should wither based on time since last watering.
     * Active trees wither after 48 hours.
     * Archived trees wither after 7 days (168 hours).
     */
    public function shouldWither(): bool
    {
        if (!$this->last_watered_at || $this->is_permanent) {
            return false;
        }

        $hours = $this->is_active ? 48 : 168;
        return $this->last_watered_at->copy()->addHours($hours)->isPast();
    }

    /**
     * Check if this withered tree is still within the 24-hour rescue window.
     */
    public function isInRescueWindow(): bool
    {
        if (!$this->is_withered || !$this->last_watered_at) {
            return false;
        }

        $witherTime = $this->is_active ? 48 : 168;
        $rescueWindow = 24;
        return $this->last_watered_at->copy()->addHours($witherTime + $rescueWindow)->isFuture();
    }

    /**
     * Get hours remaining until wither (for UI display).
     */
    public function getHoursUntilWither(): ?int
    {
        if (!$this->last_watered_at || $this->is_permanent || $this->is_withered) {
            return null;
        }

        $hours = $this->is_active ? 48 : 168;
        $witherAt = $this->last_watered_at->copy()->addHours($hours);

        if ($witherAt->isPast()) {
            return 0;
        }

        return (int) now()->diffInHours($witherAt);
    }

    /**
     * Get hours remaining in rescue window (for UI display).
     */
    public function getRescueHoursRemaining(): ?int
    {
        if (!$this->is_withered || !$this->isInRescueWindow()) {
            return null;
        }

        $witherTime = $this->is_active ? 48 : 168;
        $rescueEnd = $this->last_watered_at->copy()->addHours($witherTime + 24);

        return (int) now()->diffInHours($rescueEnd);
    }
}

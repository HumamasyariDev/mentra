<?php

namespace Tests\Feature;

use App\Models\Tree;
use App\Models\TreeType;
use App\Models\User;
use App\Services\WateringCanService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class WateringCanServiceTest extends TestCase
{
    use RefreshDatabase;

    private WateringCanService $service;
    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service = new WateringCanService();
        $this->user = User::factory()->create(['watering_cans' => 0]);
    }

    protected function tearDown(): void
    {
        $this->travelBack();

        parent::tearDown();
    }

    public function test_awards_1_can_for_15_min_session(): void
    {
        $cans = $this->service->awardFromPomodoro($this->user, 15);

        $this->assertEquals(1, $cans);
        $this->assertEquals(1, $this->user->fresh()->watering_cans);
    }

    public function test_awards_2_cans_for_25_min_session(): void
    {
        $cans = $this->service->awardFromPomodoro($this->user, 25);

        $this->assertEquals(2, $cans);
        $this->assertEquals(2, $this->user->fresh()->watering_cans);
    }

    public function test_awards_3_cans_for_45_min_session(): void
    {
        $cans = $this->service->awardFromPomodoro($this->user, 45);

        $this->assertEquals(3, $cans);
        $this->assertEquals(3, $this->user->fresh()->watering_cans);
    }

    public function test_awards_4_cans_for_60_min_session(): void
    {
        $cans = $this->service->awardFromPomodoro($this->user, 60);

        $this->assertEquals(4, $cans);
        $this->assertEquals(4, $this->user->fresh()->watering_cans);
    }

    public function test_awards_correct_cans_for_custom_durations(): void
    {
        // 14 min = 0 cans
        $this->assertEquals(0, $this->service->awardFromPomodoro($this->user, 14));

        // 20 min = 1 can (>=15 but <25)
        $user2 = User::factory()->create(['watering_cans' => 0]);
        $this->assertEquals(1, $this->service->awardFromPomodoro($user2, 20));

        // 30 min = 2 cans (>=25 but <45)
        $user3 = User::factory()->create(['watering_cans' => 0]);
        $this->assertEquals(2, $this->service->awardFromPomodoro($user3, 30));

        // 50 min = 3 cans (>=45 but <60)
        $user4 = User::factory()->create(['watering_cans' => 0]);
        $this->assertEquals(3, $this->service->awardFromPomodoro($user4, 50));

        // 90 min = 4 cans (>=60)
        $user5 = User::factory()->create(['watering_cans' => 0]);
        $this->assertEquals(4, $this->service->awardFromPomodoro($user5, 90));
    }

    public function test_does_not_award_cans_for_short_sessions(): void
    {
        $cans = $this->service->awardFromPomodoro($this->user, 10);

        $this->assertEquals(0, $cans);
        $this->assertEquals(0, $this->user->fresh()->watering_cans);
    }

    public function test_active_watering_sets_random_cooldown_between_6_and_12_hours(): void
    {
        $now = Carbon::parse('2026-03-18 12:00:00');
        $this->travelTo($now);

        $treeType = TreeType::create([
            'name' => 'pine_purple',
            'display_name' => 'Purple Pine',
            'stage_costs' => [5, 10, 15, 20, 25],
        ]);

        $tree = Tree::create([
            'user_id' => $this->user->id,
            'tree_type_id' => $treeType->id,
            'stage' => 0,
            'water_progress' => 0,
            'is_active' => true,
            'last_watered_at' => now()->subDay(),
            'next_water_at' => now()->subMinute(),
        ]);

        $this->user->update(['watering_cans' => 3]);

        $result = $this->service->waterActiveTree($this->user->fresh(), $tree);

        $this->assertTrue($result['success']);
        $this->assertTrue($tree->fresh()->next_water_at->betweenIncluded(
            $now->copy()->addHours(6),
            $now->copy()->addHours(12)
        ));
    }
}

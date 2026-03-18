<?php

namespace Tests\Feature;

use App\Models\Tree;
use App\Models\TreeType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class ForestTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private TreeType $treeType;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create([
            'watering_cans' => 10,
        ]);

        $this->treeType = TreeType::create([
            'name' => 'pine_purple',
            'display_name' => 'Purple Pine',
            'stage_costs' => [5, 10, 15, 20, 25],
        ]);
    }

    protected function tearDown(): void
    {
        $this->travelBack();

        parent::tearDown();
    }

    public function test_can_get_forest_state(): void
    {
        $response = $this->actingAs($this->user)
            ->getJson('/api/forest');

        $response->assertOk()
            ->assertJsonStructure([
                'watering_cans',
                'active_tree',
                'archived_trees',
                'tree_types',
                'can_plant',
            ]);
    }

    public function test_forest_state_includes_active_tree_timing_metadata(): void
    {
        $now = Carbon::parse('2026-03-18 08:00:00');
        $this->travelTo($now);

        $tree = Tree::create([
            'user_id' => $this->user->id,
            'tree_type_id' => $this->treeType->id,
            'stage' => 2,
            'water_progress' => 3,
            'is_active' => true,
            'last_watered_at' => $now->copy()->subHour(),
            'next_water_at' => now()->addHours(8),
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/forest');

        $response->assertOk()
            ->assertJsonPath('active_tree.id', $tree->id)
            ->assertJsonPath('active_tree.can_water_now', false)
            ->assertJsonPath('active_tree.hours_until_wither', 47);

        $this->assertNotNull($response->json('active_tree.cooldown_remaining_seconds'));
        $this->assertNotNull($response->json('active_tree.next_water_at'));
    }

    public function test_can_plant_tree_when_none_active(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/forest/plant', [
                'tree_type_id' => $this->treeType->id,
            ]);

        $response->assertCreated()
            ->assertJsonPath('tree.stage', 0)
            ->assertJsonPath('tree.is_active', true)
            ->assertJsonPath('tree.can_water_now', true);

        $this->assertDatabaseHas('trees', [
            'user_id' => $this->user->id,
            'tree_type_id' => $this->treeType->id,
            'stage' => 0,
            'is_active' => true,
        ]);
    }

    public function test_cannot_plant_when_active_tree_exists(): void
    {
        Tree::create([
            'user_id' => $this->user->id,
            'tree_type_id' => $this->treeType->id,
            'stage' => 0,
            'is_active' => true,
            'last_watered_at' => now(),
        ]);

        $response = $this->actingAs($this->user)
            ->postJson('/api/forest/plant', [
                'tree_type_id' => $this->treeType->id,
            ]);

        $response->assertStatus(422)
            ->assertJsonPath('error', 'Already have an active tree');
    }

    public function test_can_water_active_tree(): void
    {
        $now = Carbon::parse('2026-03-18 10:00:00');
        $this->travelTo($now);

        $tree = Tree::create([
            'user_id' => $this->user->id,
            'tree_type_id' => $this->treeType->id,
            'stage' => 0,
            'water_progress' => 0,
            'is_active' => true,
            'last_watered_at' => now()->subMinutes(1),
            'next_water_at' => now()->subMinute(),
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/api/forest/water/{$tree->id}");

        $response->assertOk()
            ->assertJsonPath('success', true);

        $freshTree = $tree->fresh();
        $this->assertEquals(9, $this->user->fresh()->watering_cans);
        $this->assertEquals(1, $freshTree->water_progress);
        $this->assertTrue($freshTree->next_water_at->betweenIncluded(
            $now->copy()->addHours(6),
            $now->copy()->addHours(12)
        ));

    }

    public function test_watering_respects_cooldown(): void
    {
        $tree = Tree::create([
            'user_id' => $this->user->id,
            'tree_type_id' => $this->treeType->id,
            'stage' => 0,
            'water_progress' => 0,
            'is_active' => true,
            'last_watered_at' => now()->subHour(),
            'next_water_at' => now()->addHours(7),
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/api/forest/water/{$tree->id}");

        $response->assertStatus(422)
            ->assertJsonPath('error', 'Cooldown active');

        $this->assertGreaterThan(0, $response->json('cooldown_remaining_seconds'));
        $this->assertNotNull($response->json('next_water_at'));
    }

    public function test_stage_advances_at_threshold(): void
    {
        $tree = Tree::create([
            'user_id' => $this->user->id,
            'tree_type_id' => $this->treeType->id,
            'stage' => 0,
            'water_progress' => 4,  // One more to advance (cost is 5)
            'is_active' => true,
            'last_watered_at' => now()->subMinutes(1),
            'next_water_at' => now()->subMinute(),
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/api/forest/water/{$tree->id}");

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('advanced', true)
            ->assertJsonPath('new_stage', 1);

        $this->assertEquals(1, $tree->fresh()->stage);
        $this->assertEquals(0, $tree->fresh()->water_progress);
    }

    public function test_tree_archives_at_final_stage(): void
    {
        $tree = Tree::create([
            'user_id' => $this->user->id,
            'tree_type_id' => $this->treeType->id,
            'stage' => 4,
            'water_progress' => 24,  // One more to reach final (cost is 25)
            'is_active' => true,
            'last_watered_at' => now()->subMinutes(1),
            'next_water_at' => now()->subMinute(),
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/api/forest/water/{$tree->id}");

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('archived', true);

        $freshTree = $tree->fresh();
        $this->assertEquals(5, $freshTree->stage);
        $this->assertFalse($freshTree->is_active);
        $this->assertNull($freshTree->next_water_at);
    }

    public function test_archived_tree_watering_counts_toward_permanence(): void
    {
        $tree = Tree::create([
            'user_id' => $this->user->id,
            'tree_type_id' => $this->treeType->id,
            'stage' => 5,
            'is_active' => false,
            'archive_waterings' => 9,
            'last_watered_at' => now()->subMinutes(1),
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/api/forest/water/{$tree->id}");

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('became_permanent', true);

        $this->assertTrue($tree->fresh()->is_permanent);
    }

    public function test_cannot_water_permanent_tree(): void
    {
        $tree = Tree::create([
            'user_id' => $this->user->id,
            'tree_type_id' => $this->treeType->id,
            'stage' => 5,
            'is_active' => false,
            'is_permanent' => true,
            'archive_waterings' => 10,
            'last_watered_at' => now()->subMinutes(1),
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/api/forest/water/{$tree->id}");

        $response->assertStatus(422)
            ->assertJsonPath('error', 'Tree is already permanent');
    }

    public function test_cannot_water_without_cans(): void
    {
        $this->user->update(['watering_cans' => 0]);

        $tree = Tree::create([
            'user_id' => $this->user->id,
            'tree_type_id' => $this->treeType->id,
            'stage' => 0,
            'is_active' => true,
            'last_watered_at' => now()->subMinutes(1),
            'next_water_at' => now()->subMinute(),
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/api/forest/water/{$tree->id}");

        $response->assertStatus(422)
            ->assertJsonPath('error', 'No watering cans available');
    }

    public function test_cannot_water_another_users_tree(): void
    {
        $otherUser = User::factory()->create();
        $tree = Tree::create([
            'user_id' => $otherUser->id,
            'tree_type_id' => $this->treeType->id,
            'stage' => 0,
            'is_active' => true,
            'last_watered_at' => now()->subMinutes(1),
            'next_water_at' => now()->subMinute(),
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/api/forest/water/{$tree->id}");

        $response->assertStatus(403);
    }
}

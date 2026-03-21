<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tree;
use App\Models\TreeType;
use App\Services\TreeWitherService;
use App\Services\WateringCanService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ForestController extends Controller
{
    public function __construct(
        private WateringCanService $wateringService,
        private TreeWitherService $witherService
    ) {}

    private function serializeTree(?Tree $tree): ?array
    {
        if (!$tree) {
            return null;
        }

        $tree->loadMissing('treeType');

        return array_merge($tree->toArray(), [
            'can_water_now' => $tree->is_active ? $tree->isActiveWaterReady() : !$tree->is_permanent,
            'cooldown_remaining_seconds' => $tree->is_active ? $tree->getActiveCooldownRemainingSeconds() : 0,
            'hours_until_wither' => $tree->getHoursUntilWither(),
            'rescue_hours_remaining' => $tree->getRescueHoursRemaining(),
        ]);
    }

    /**
     * GET /api/forest
     * Get forest state including active tree and archived trees.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        // Check wither status on page load
        $this->witherService->checkWitherStatus($user);
        $this->witherService->removeDeadTrees($user);

        $activeTree = $user->activeTree()->with('treeType')->first();
        $archivedTrees = $user->archivedTrees()->with('treeType')->get();
        $treeTypes = TreeType::all();

        return response()->json([
            'watering_cans' => $user->watering_cans,
            'active_tree' => $this->serializeTree($activeTree),
            'archived_trees' => $archivedTrees->map(fn (Tree $tree) => $this->serializeTree($tree))->values(),
            'tree_types' => $treeTypes,
            'can_plant' => $activeTree === null,
        ]);
    }

    /**
     * POST /api/forest/plant
     * Plant a new active tree.
     */
    public function plant(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->activeTree()->exists()) {
            return response()->json(['error' => 'Already have an active tree'], 422);
        }

        $request->validate([
            'tree_type_id' => 'required|exists:tree_types,id',
        ]);

        $tree = Tree::create([
            'user_id' => $user->id,
            'tree_type_id' => $request->tree_type_id,
            'stage' => 1,
            'water_progress' => 0,
            'is_active' => true,
            'last_watered_at' => now(),
            'next_water_at' => now(),
        ]);

        return response()->json([
            'tree' => $this->serializeTree($tree->load('treeType')),
        ], 201);
    }

    /**
     * POST /api/forest/water/{tree}
     * Water a tree (active or archived).
     */
    public function water(Request $request, Tree $tree): JsonResponse
    {
        $user = $request->user();

        if ($tree->user_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $result = $tree->is_active
            ? $this->wateringService->waterActiveTree($user, $tree)
            : $this->wateringService->waterArchivedTree($user, $tree);

        if (!$result['success']) {
            return response()->json($result, 422);
        }

        if (isset($result['tree']) && $result['tree'] instanceof Tree) {
            $result['tree'] = $this->serializeTree($result['tree']);
        }

        $result['watering_cans'] = $user->fresh()->watering_cans;
        return response()->json($result);
    }

    /**
     * GET /api/forest/tree-types
     * Get available tree types.
     */
    public function treeTypes(): JsonResponse
    {
        return response()->json(TreeType::all());
    }

    /**
     * POST /api/forest/debug/skip-stage/{tree}
     * DEV ONLY: Skip to next stage instantly.
     */
    public function debugSkipStage(Request $request, Tree $tree): JsonResponse
    {
        if (!app()->environment('local', 'testing')) {
            return response()->json(['error' => 'Debug endpoint not available'], 403);
        }

        $user = $request->user();

        if ($tree->user_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if (!$tree->is_active) {
            return response()->json(['error' => 'Can only skip stages on active trees'], 422);
        }

        $totalStages = count($tree->treeType->stage_costs);

        if ($tree->stage >= $totalStages) {
            // Already at final stage, archive it
            $tree->update([
                'is_active' => false,
                'is_permanent' => true,
                'archive_waterings' => 10,
                'last_watered_at' => now(),
                'next_water_at' => null,
            ]);

            return response()->json([
                'success' => true,
                'archived' => true,
                'tree' => $this->serializeTree($tree->fresh()->load('treeType')),
            ]);
        }

        // Advance to next stage
        $newStage = $tree->stage + 1;
        
        $updateData = [
            'stage' => $newStage,
            'water_progress' => 0,
            'last_watered_at' => now(),
        ];

        // If advancing to final stage, reset archive_waterings counter
        if ($newStage === $totalStages) {
            $updateData['archive_waterings'] = 0;
            $updateData['next_water_at'] = now()->addHours(random_int(6, 12));
        } else {
            $updateData['next_water_at'] = now()->addHours(random_int(6, 12));
        }

        $tree->update($updateData);

        return response()->json([
            'success' => true,
            'new_stage' => $newStage,
            'archived' => false,
            'tree' => $this->serializeTree($tree->fresh()->load('treeType')),
        ]);
    }
}

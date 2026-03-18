# Forest Tree Care - Implementation Plan

## Overview

Build a gamified "Forest Tree Care" feature where users earn watering cans from completing Pomodoro sessions, then use those cans to grow trees through stages. Completed trees join a background forest, creating a visual representation of productivity over time.

---

## Phase 1: Database & Backend Foundation

### 1.1 Database Migrations

**Migration: Add watering_cans to users table**
```php
// database/migrations/xxxx_add_watering_cans_to_users_table.php
Schema::table('users', function (Blueprint $table) {
    $table->unsignedInteger('watering_cans')->default(0);
});
```

**Migration: Create tree_types table**
```php
// database/migrations/xxxx_create_tree_types_table.php
Schema::create('tree_types', function (Blueprint $table) {
    $table->id();
    $table->string('name');           // e.g., "pine_purple"
    $table->string('display_name');   // e.g., "Purple Pine"
    $table->json('stage_costs');      // [5, 10, 15, 20, 25] (incremental costs)
    $table->timestamps();
});
```

**Migration: Create trees table**
```php
// database/migrations/xxxx_create_trees_table.php
Schema::create('trees', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
    $table->foreignId('tree_type_id')->constrained()->onDelete('cascade');
    $table->unsignedTinyInteger('stage')->default(0);  // 0=seed, 1-4=stages, 5=final
    $table->unsignedInteger('water_progress')->default(0);  // Progress toward next stage
    $table->boolean('is_active')->default(true);  // Active (spotlight) vs archived (forest)
    $table->boolean('is_withered')->default(false);
    $table->boolean('is_permanent')->default(false);  // True after 10 archive waterings
    $table->unsignedTinyInteger('archive_waterings')->default(0);  // 0-10, for archived trees
    $table->timestamp('last_watered_at')->nullable();
    $table->timestamps();
    
    $table->index(['user_id', 'is_active']);
});
```

### 1.2 Models

**TreeType Model**
```php
// app/Models/TreeType.php
class TreeType extends Model
{
    protected $fillable = ['name', 'display_name', 'stage_costs'];
    protected $casts = ['stage_costs' => 'array'];
    
    public function trees(): HasMany
    {
        return $this->hasMany(Tree::class);
    }
    
    public function getCostForStage(int $stage): int
    {
        // stage_costs is incremental: [5, 10, 15, 20, 25]
        return $this->stage_costs[$stage] ?? 0;
    }
    
    public function getCumulativeCost(int $stage): int
    {
        // Returns total cans needed to reach a stage: [5, 15, 30, 50, 75]
        return array_sum(array_slice($this->stage_costs, 0, $stage + 1));
    }
}
```

**Tree Model**
```php
// app/Models/Tree.php
class Tree extends Model
{
    protected $fillable = [
        'user_id', 'tree_type_id', 'stage', 'water_progress',
        'is_active', 'is_withered', 'is_permanent', 
        'archive_waterings', 'last_watered_at'
    ];
    
    protected $casts = [
        'is_active' => 'boolean',
        'is_withered' => 'boolean',
        'is_permanent' => 'boolean',
        'last_watered_at' => 'datetime',
    ];
    
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
    
    public function treeType(): BelongsTo
    {
        return $this->belongsTo(TreeType::class);
    }
    
    public function getAssetName(): string
    {
        $stageName = $this->stage === 0 ? 'seed' : 
                    ($this->stage === 5 ? 'stage_final' : "stage_{$this->stage}");
        return "{$this->treeType->name}_{$stageName}";
    }
    
    public function canBeWatered(): bool
    {
        if ($this->is_active) {
            return $this->stage < 5;  // Not yet final
        }
        // Archived: can water if not permanent and not withered (unless rescuing)
        return !$this->is_permanent;
    }
    
    public function shouldWither(): bool
    {
        if (!$this->last_watered_at) return false;
        
        $hours = $this->is_active ? 48 : 168;  // 48h active, 7 days archived
        return $this->last_watered_at->addHours($hours)->isPast();
    }
    
    public function isInRescueWindow(): bool
    {
        if (!$this->is_withered || !$this->last_watered_at) return false;
        
        $witherTime = $this->is_active ? 48 : 168;
        $rescueWindow = 24;
        return $this->last_watered_at->addHours($witherTime + $rescueWindow)->isFuture();
    }
}
```

**Update User Model**
```php
// app/Models/User.php - Add to existing model
protected $fillable = [..., 'watering_cans'];

public function trees(): HasMany
{
    return $this->hasMany(Tree::class);
}

public function activeTree(): HasOne
{
    return $this->hasOne(Tree::class)->where('is_active', true);
}

public function archivedTrees(): HasMany
{
    return $this->hasMany(Tree::class)->where('is_active', false);
}
```

### 1.3 TreeType Seeder

```php
// database/seeders/TreeTypeSeeder.php
class TreeTypeSeeder extends Seeder
{
    public function run(): void
    {
        TreeType::create([
            'name' => 'pine_purple',
            'display_name' => 'Purple Pine',
            'stage_costs' => [5, 10, 15, 20, 25],  // Cumulative: 5, 15, 30, 50, 75
        ]);
    }
}
```

---

## Phase 2: Backend Services & Controllers

### 2.1 WateringCanService

```php
// app/Services/WateringCanService.php
class WateringCanService
{
    /**
     * Award watering cans based on Pomodoro duration
     */
    public function awardFromPomodoro(User $user, int $durationMinutes): int
    {
        $cans = match(true) {
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
     * Water an active tree (with cooldown check)
     */
    public function waterActiveTree(User $user, Tree $tree): array
    {
        if (!$tree->is_active) {
            throw new \InvalidArgumentException('Tree is not active');
        }
        
        if ($user->watering_cans < 1) {
            return ['success' => false, 'error' => 'No watering cans available'];
        }
        
        // Check 3-second cooldown
        if ($tree->last_watered_at && $tree->last_watered_at->addSeconds(3)->isFuture()) {
            return ['success' => false, 'error' => 'Cooldown active', 'cooldown_remaining' => $tree->last_watered_at->addSeconds(3)->diffInMilliseconds(now())];
        }
        
        // Handle withered tree rescue
        if ($tree->is_withered) {
            if (!$tree->isInRescueWindow()) {
                return ['success' => false, 'error' => 'Tree cannot be rescued'];
            }
            $tree->update([
                'is_withered' => false,
                'last_watered_at' => now(),
            ]);
            $user->decrement('watering_cans');
            return ['success' => true, 'rescued' => true, 'tree' => $tree->fresh()];
        }
        
        // Normal watering
        $user->decrement('watering_cans');
        $tree->increment('water_progress');
        $tree->update(['last_watered_at' => now()]);
        
        // Check for stage advancement
        $advanced = false;
        $archived = false;
        $currentStageCost = $tree->treeType->getCostForStage($tree->stage);
        
        if ($tree->water_progress >= $currentStageCost && $tree->stage < 5) {
            $tree->update([
                'stage' => $tree->stage + 1,
                'water_progress' => 0,
            ]);
            $advanced = true;
            
            // If reached final stage, archive the tree
            if ($tree->stage === 5) {
                $tree->update(['is_active' => false]);
                $archived = true;
            }
        }
        
        return [
            'success' => true,
            'advanced' => $advanced,
            'archived' => $archived,
            'tree' => $tree->fresh(),
        ];
    }
    
    /**
     * Water an archived tree (no cooldown, counts toward permanence)
     */
    public function waterArchivedTree(User $user, Tree $tree): array
    {
        if ($tree->is_active) {
            throw new \InvalidArgumentException('Tree is active, not archived');
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
            return ['success' => true, 'rescued' => true, 'tree' => $tree->fresh()];
        }
        
        // Normal archived watering
        $user->decrement('watering_cans');
        $tree->update(['last_watered_at' => now()]);
        $tree->increment('archive_waterings');
        
        // Check for permanence
        $becamePermanent = false;
        if ($tree->archive_waterings >= 10) {
            $tree->update(['is_permanent' => true]);
            $becamePermanent = true;
        }
        
        return [
            'success' => true,
            'became_permanent' => $becamePermanent,
            'tree' => $tree->fresh(),
        ];
    }
}
```

### 2.2 TreeWitherService

```php
// app/Services/TreeWitherService.php
class TreeWitherService
{
    /**
     * Check and update wither status for a user's trees
     * Called on forest page load
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
     * Remove trees past rescue window
     * Can be called by scheduler or on page load
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
```

### 2.3 ForestController

```php
// app/Http/Controllers/Api/ForestController.php
class ForestController extends Controller
{
    public function __construct(
        private WateringCanService $wateringService,
        private TreeWitherService $witherService
    ) {}
    
    /**
     * GET /api/forest
     * Get forest state including active tree and archived trees
     */
    public function index(Request $request)
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
            'active_tree' => $activeTree,
            'archived_trees' => $archivedTrees,
            'tree_types' => $treeTypes,
            'can_plant' => $activeTree === null,
        ]);
    }
    
    /**
     * POST /api/forest/plant
     * Plant a new active tree
     */
    public function plant(Request $request)
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
            'stage' => 0,
            'water_progress' => 0,
            'is_active' => true,
            'last_watered_at' => now(),
        ]);
        
        return response()->json([
            'tree' => $tree->load('treeType'),
        ], 201);
    }
    
    /**
     * POST /api/forest/water/{tree}
     * Water a tree (active or archived)
     */
    public function water(Request $request, Tree $tree)
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
        
        $result['watering_cans'] = $user->fresh()->watering_cans;
        return response()->json($result);
    }
    
    /**
     * GET /api/forest/tree-types
     * Get available tree types
     */
    public function treeTypes()
    {
        return response()->json(TreeType::all());
    }
}
```

### 2.4 Update PomodoroController

```php
// app/Http/Controllers/Api/PomodoroController.php
// In the complete() method, add watering can award:

public function complete(Request $request)
{
    // ... existing code ...
    
    // Award watering cans
    $wateringService = app(WateringCanService::class);
    $cansAwarded = $wateringService->awardFromPomodoro($user, $duration);
    
    // ... existing response, add cans_awarded ...
    return response()->json([
        // ... existing fields ...
        'cans_awarded' => $cansAwarded,
        'watering_cans' => $user->watering_cans,
    ]);
}
```

### 2.5 API Routes

```php
// routes/api.php - Add these routes
Route::middleware('auth:sanctum')->group(function () {
    // ... existing routes ...
    
    Route::prefix('forest')->group(function () {
        Route::get('/', [ForestController::class, 'index']);
        Route::post('/plant', [ForestController::class, 'plant']);
        Route::post('/water/{tree}', [ForestController::class, 'water']);
        Route::get('/tree-types', [ForestController::class, 'treeTypes']);
    });
});
```

---

## Phase 3: Backend Tests

### 3.1 WateringCanService Tests

```php
// tests/Feature/WateringCanServiceTest.php
class WateringCanServiceTest extends TestCase
{
    use RefreshDatabase;
    
    public function test_awards_correct_cans_for_preset_durations()
    {
        $user = User::factory()->create(['watering_cans' => 0]);
        $service = new WateringCanService();
        
        $this->assertEquals(1, $service->awardFromPomodoro($user, 15));
        $this->assertEquals(2, $service->awardFromPomodoro($user->fresh(), 25));
        $this->assertEquals(3, $service->awardFromPomodoro($user->fresh(), 45));
        $this->assertEquals(4, $service->awardFromPomodoro($user->fresh(), 60));
    }
    
    public function test_watering_active_tree_advances_stage()
    {
        // ... test implementation
    }
    
    public function test_cooldown_prevents_rapid_watering()
    {
        // ... test implementation
    }
    
    public function test_archived_tree_watering_counts_toward_permanence()
    {
        // ... test implementation
    }
}
```

### 3.2 ForestController Tests

```php
// tests/Feature/ForestControllerTest.php
class ForestControllerTest extends TestCase
{
    use RefreshDatabase;
    
    public function test_can_get_forest_state()
    {
        // ... test implementation
    }
    
    public function test_can_plant_tree_when_none_active()
    {
        // ... test implementation
    }
    
    public function test_cannot_plant_when_active_tree_exists()
    {
        // ... test implementation
    }
    
    public function test_can_water_active_tree()
    {
        // ... test implementation
    }
}
```

---

## Phase 4: Frontend Implementation

### 4.1 API Service Extensions

```javascript
// frontend/src/services/api.js - Add to existing file
export const forestApi = {
  getForest: () => api.get('/forest'),
  plantTree: (treeTypeId) => api.post('/forest/plant', { tree_type_id: treeTypeId }),
  waterTree: (treeId) => api.post(`/forest/water/${treeId}`),
  getTreeTypes: () => api.get('/forest/tree-types'),
};
```

### 4.2 Forest Page Component

```jsx
// frontend/src/pages/Forest.jsx
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { forestApi } from '../services/api';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import './Forest.css';

// Import all tree assets
import pinePurpleSeed from '../assets/pine_purple/pine_purple_seed.png';
import pinePurpleStage1 from '../assets/pine_purple/pine_purple_stage_1.png';
import pinePurpleStage2 from '../assets/pine_purple/pine_purple_stage_2.png';
import pinePurpleStage3 from '../assets/pine_purple/pine_purple_stage_3.png';
import pinePurpleStage4 from '../assets/pine_purple/pine_purple_stage_4.png';
import pinePurpleFinal from '../assets/pine_purple/pine_purple_stage_final.png';

const TREE_ASSETS = {
  pine_purple: {
    seed: pinePurpleSeed,
    stage_1: pinePurpleStage1,
    stage_2: pinePurpleStage2,
    stage_3: pinePurpleStage3,
    stage_4: pinePurpleStage4,
    stage_final: pinePurpleFinal,
  },
};

function getTreeAsset(typeName, stage) {
  const stageName = stage === 0 ? 'seed' : stage === 5 ? 'stage_final' : `stage_${stage}`;
  return TREE_ASSETS[typeName]?.[stageName];
}

export default function Forest() {
  const queryClient = useQueryClient();
  const [selectedArchivedTree, setSelectedArchivedTree] = useState(null);
  const [cooldownActive, setCooldownActive] = useState(false);
  
  const { data: forest, isLoading } = useQuery({
    queryKey: ['forest'],
    queryFn: forestApi.getForest,
  });
  
  const plantMutation = useMutation({
    mutationFn: forestApi.plantTree,
    onSuccess: () => queryClient.invalidateQueries(['forest']),
  });
  
  const waterMutation = useMutation({
    mutationFn: forestApi.waterTree,
    onSuccess: (data) => {
      queryClient.invalidateQueries(['forest']);
      if (data.advanced) {
        // Trigger growth animation
        animateGrowth();
      }
      if (data.archived) {
        // Trigger archive animation
        animateArchive();
      }
      // Start cooldown for active tree
      if (forest?.active_tree && !data.archived) {
        setCooldownActive(true);
        setTimeout(() => setCooldownActive(false), 3000);
      }
    },
  });
  
  const animateGrowth = useCallback(() => {
    gsap.fromTo('.spotlight-tree', 
      { scale: 1 },
      { scale: 1.1, duration: 0.3, yoyo: true, repeat: 1, ease: 'power2.out' }
    );
  }, []);
  
  const animateArchive = useCallback(() => {
    gsap.to('.spotlight-tree', {
      y: 100,
      scale: 0.5,
      opacity: 0,
      duration: 1,
      ease: 'power2.in',
    });
  }, []);
  
  const handleWaterActive = () => {
    if (forest?.active_tree && !cooldownActive) {
      waterMutation.mutate(forest.active_tree.id);
    }
  };
  
  const handleWaterArchived = (treeId) => {
    waterMutation.mutate(treeId);
  };
  
  const handlePlant = () => {
    // For now, default to pine_purple (id: 1)
    plantMutation.mutate(1);
  };
  
  if (isLoading) {
    return <div className="forest-loading">Loading forest...</div>;
  }
  
  const activeTree = forest?.active_tree;
  const archivedTrees = forest?.archived_trees || [];
  
  return (
    <div className="forest-page">
      {/* Header with watering cans count */}
      <header className="forest-header">
        <button className="back-button" onClick={() => window.history.back()}>
          ← Back
        </button>
        <div className="watering-cans">
          <span className="can-icon">🚿</span>
          <span className="can-count">{forest?.watering_cans || 0}</span>
        </div>
      </header>
      
      {/* Background forest layer */}
      <div className="forest-background">
        {archivedTrees.map((tree, index) => (
          <div
            key={tree.id}
            className={`archived-tree ${tree.is_withered ? 'withered' : ''} ${tree.is_permanent ? 'permanent' : ''}`}
            style={{
              left: `${(index * 15) % 85 + 5}%`,
              bottom: `${10 + (index % 3) * 5}%`,
              zIndex: index,
            }}
            onClick={() => setSelectedArchivedTree(tree)}
          >
            <img 
              src={getTreeAsset(tree.tree_type.name, tree.stage)} 
              alt={tree.tree_type.display_name}
            />
            {!tree.is_permanent && (
              <div className="tree-badge">
                {tree.is_withered ? '⚠️' : `${tree.archive_waterings}/10`}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Spotlight zone */}
      <div className="spotlight-zone">
        {activeTree ? (
          <div className={`spotlight-tree ${activeTree.is_withered ? 'withered' : ''}`}>
            <img 
              src={getTreeAsset(activeTree.tree_type.name, activeTree.stage)} 
              alt={activeTree.tree_type.display_name}
            />
            <div className="tree-info">
              <div className="stage-label">
                {activeTree.stage === 0 ? 'Seed' : 
                 activeTree.stage === 5 ? 'Final' : `Stage ${activeTree.stage}`}
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{
                    width: `${(activeTree.water_progress / activeTree.tree_type.stage_costs[activeTree.stage]) * 100}%`
                  }}
                />
              </div>
              <div className="progress-label">
                {activeTree.water_progress} / {activeTree.tree_type.stage_costs[activeTree.stage]}
              </div>
            </div>
            <button 
              className="water-button"
              onClick={handleWaterActive}
              disabled={cooldownActive || forest?.watering_cans < 1 || activeTree.stage === 5}
            >
              {cooldownActive ? 'Cooling...' : activeTree.is_withered ? 'Rescue!' : 'Water'}
            </button>
          </div>
        ) : (
          <div className="plant-prompt">
            <p>No active tree. Plant one to start growing!</p>
            <button className="plant-button" onClick={handlePlant}>
              Plant a Seed
            </button>
          </div>
        )}
      </div>
      
      {/* Archived tree care modal */}
      {selectedArchivedTree && (
        <div className="archived-modal" onClick={() => setSelectedArchivedTree(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>{selectedArchivedTree.tree_type.display_name}</h3>
            <img 
              src={getTreeAsset(selectedArchivedTree.tree_type.name, selectedArchivedTree.stage)} 
              alt=""
            />
            {selectedArchivedTree.is_permanent ? (
              <p className="permanent-label">Permanently secured!</p>
            ) : (
              <>
                <p>Waterings: {selectedArchivedTree.archive_waterings}/10</p>
                <button 
                  className="water-button"
                  onClick={() => handleWaterArchived(selectedArchivedTree.id)}
                  disabled={forest?.watering_cans < 1}
                >
                  {selectedArchivedTree.is_withered ? 'Rescue!' : 'Water'}
                </button>
              </>
            )}
            <button className="close-button" onClick={() => setSelectedArchivedTree(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

### 4.3 Forest Page Styles

```css
/* frontend/src/pages/Forest.css */
.forest-page {
  position: fixed;
  inset: 0;
  background: linear-gradient(to bottom, #87CEEB 0%, #E0F7FA 50%, #8FBC8F 100%);
  overflow: hidden;
}

.forest-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 100;
}

.back-button {
  background: rgba(255, 255, 255, 0.8);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}

.watering-cans {
  background: rgba(255, 255, 255, 0.9);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
}

.forest-background {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40%;
}

.archived-tree {
  position: absolute;
  cursor: pointer;
  transition: transform 0.2s;
}

.archived-tree:hover {
  transform: scale(1.05);
}

.archived-tree img {
  height: 80px;
  width: auto;
}

.archived-tree.withered {
  filter: sepia(1) saturate(0.5);
}

.archived-tree.permanent img {
  filter: drop-shadow(0 0 8px gold);
}

.tree-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: white;
  border-radius: 50%;
  padding: 2px 6px;
  font-size: 0.7rem;
}

.spotlight-zone {
  position: absolute;
  bottom: 35%;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.spotlight-tree {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.spotlight-tree img {
  height: 200px;
  width: auto;
}

.spotlight-tree.withered {
  filter: sepia(1) saturate(0.3);
}

.tree-info {
  margin-top: 1rem;
  text-align: center;
}

.stage-label {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.progress-bar {
  width: 150px;
  height: 12px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 6px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #4CAF50;
  transition: width 0.3s;
}

.progress-label {
  font-size: 0.85rem;
  margin-top: 0.25rem;
}

.water-button, .plant-button {
  margin-top: 1rem;
  padding: 0.75rem 2rem;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.water-button:hover:not(:disabled), .plant-button:hover {
  background: #1976D2;
}

.water-button:disabled {
  background: #9E9E9E;
  cursor: not-allowed;
}

.plant-prompt {
  text-align: center;
}

.archived-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  text-align: center;
  max-width: 300px;
}

.modal-content img {
  height: 120px;
  margin: 1rem 0;
}

.close-button {
  margin-top: 1rem;
  padding: 0.5rem 1.5rem;
  background: #757575;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.permanent-label {
  color: #FFD700;
  font-weight: 600;
}

.forest-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
}
```

### 4.4 Update Pomodoro Page

```jsx
// frontend/src/pages/Pomodoro.jsx
// Add to existing component:

// 1. Show watering cans earned after completion
// In the completion state/modal:
{completionData?.cans_awarded > 0 && (
  <div className="cans-earned">
    +{completionData.cans_awarded} watering cans earned!
  </div>
)}

// 2. Add debug button (dev only)
{import.meta.env.DEV && (
  <button 
    className="debug-complete-btn"
    onClick={() => completeMutation.mutate()}
  >
    [DEV] Complete Timer
  </button>
)}
```

### 4.5 Update App Routes

```jsx
// frontend/src/App.jsx
// Update the forest route:
import Forest from './pages/Forest';

// Replace ForestWorld route with:
<Route path="/forest" element={<Forest />} />
```

### 4.6 Add Sidebar Link

```jsx
// frontend/src/components/Sidebar.jsx
// Add Forest link in the navigation:
<NavLink to="/forest" className="sidebar-link">
  <TreeIcon /> Forest
</NavLink>
```

---

## Phase 5: Integration & Polish

### 5.1 Run Migrations & Seeders

```bash
php artisan migrate
php artisan db:seed --class=TreeTypeSeeder
```

### 5.2 Run Tests

```bash
php artisan test --filter=Forest
php artisan test --filter=WateringCan
```

### 5.3 Manual Testing Checklist

- [ ] Pomodoro completion awards correct watering cans
- [ ] Can plant a new tree when no active tree
- [ ] Cannot plant when active tree exists
- [ ] Watering active tree increments progress
- [ ] 3-second cooldown works on active tree
- [ ] Stage advancement triggers at correct thresholds
- [ ] Final stage tree moves to archive
- [ ] Archived trees appear in background
- [ ] Can water archived trees (no cooldown)
- [ ] Archive waterings count toward permanence
- [ ] Permanent trees show gold glow
- [ ] Wither mechanic works after 48h (active) / 7 days (archived)
- [ ] Rescue window allows revival
- [ ] Dead trees are removed after rescue window
- [ ] Debug button completes timer instantly (dev only)

---

## File Summary

### New Files to Create

**Backend:**
- `database/migrations/xxxx_add_watering_cans_to_users_table.php`
- `database/migrations/xxxx_create_tree_types_table.php`
- `database/migrations/xxxx_create_trees_table.php`
- `app/Models/TreeType.php`
- `app/Models/Tree.php`
- `app/Services/WateringCanService.php`
- `app/Services/TreeWitherService.php`
- `app/Http/Controllers/Api/ForestController.php`
- `database/seeders/TreeTypeSeeder.php`
- `tests/Feature/WateringCanServiceTest.php`
- `tests/Feature/ForestControllerTest.php`

**Frontend:**
- `frontend/src/pages/Forest.jsx`
- `frontend/src/pages/Forest.css`

### Files to Modify

**Backend:**
- `app/Models/User.php` - Add watering_cans, trees relationship
- `app/Http/Controllers/Api/PomodoroController.php` - Award cans on completion
- `routes/api.php` - Add forest routes
- `database/seeders/DatabaseSeeder.php` - Include TreeTypeSeeder

**Frontend:**
- `frontend/src/services/api.js` - Add forestApi
- `frontend/src/pages/Pomodoro.jsx` - Show cans earned, debug button
- `frontend/src/App.jsx` - Update /forest route
- `frontend/src/components/Sidebar.jsx` - Add Forest link

---

## Estimated Implementation Order

1. **Phase 1** (30 min): Database migrations and models
2. **Phase 2** (45 min): Backend services and controllers
3. **Phase 3** (30 min): Backend tests
4. **Phase 4** (60 min): Frontend Forest page and integration
5. **Phase 5** (15 min): Integration testing and polish

**Total Estimated Time: ~3 hours**

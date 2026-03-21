import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { forestApi } from '../services/api';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { usePlantAnimation } from '../hooks/usePlantAnimation';
import ForestTreeCard from '../components/ForestTreeCard';
import './Forest.css';

import pinePurpleSeed from '../assets/pine_purple/pine_purple_seed.png';
import pinePurpleStage1 from '../assets/pine_purple/pine_purple_stage_1.png';
import pinePurpleStage2 from '../assets/pine_purple/pine_purple_stage_2.png';
import pinePurpleStage3 from '../assets/pine_purple/pine_purple_stage_3.png';
import pinePurpleStage4 from '../assets/pine_purple/pine_purple_stage_4.png';
import pinePurpleFinal from '../assets/pine_purple/pine_purple_stage_final.png';
import wateringCanAsset from '../assets/gameworld/watering_can.png';
import waterDropAsset from '../assets/gameworld/water_drop.png';

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

const STAGES = [
  { value: 1, label: 'Baby' },
  { value: 2, label: 'Sapling' },
  { value: 3, label: 'Young Tree' },
  { value: 4, label: 'Teen Tree' },
  { value: 5, label: 'Adult Tree' },
];

const STAGE_NAMES = {
  1: 'Baby',
  2: 'Sapling',
  3: 'Young Tree',
  4: 'Teen Tree',
  5: 'Adult Tree',
};

function getDisplayStageName(stage) {
  return STAGE_NAMES[stage] ?? 'Unknown';
}

// Tree sizes grow with each stage - reflects actual growth
// Stage 0 (seed) width is only used during planting animation
// Actual playable stages are 1-5
const HERO_WIDTHS = {
  0: 112,   // Seed (planting animation only)
  1: 164,   // Baby (first playable stage)
  2: 224,   // Sapling
  3: 292,   // Young Tree
  4: 366,   // Teen Tree
  5: 440,   // Adult Tree (Final)
};

const MAX_BACKGROUND_TREES = 50;

function getTreeAsset(typeName, stage) {
  const stageName = stage === 5 ? 'stage_final' : `stage_${stage}`;
  return TREE_ASSETS[typeName]?.[stageName] ?? pinePurpleFinal;
}

function getSeedAsset(typeName) {
  return TREE_ASSETS[typeName]?.['seed'] ?? TREE_ASSETS['pine_purple']?.['seed'];
}

function formatDuration(seconds) {
  if (!seconds || seconds <= 0) {
    return 'Ready now';
  }

  const totalMinutes = Math.ceil(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours && minutes) {
    return `${hours}h ${minutes}m`;
  }

  if (hours) {
    return `${hours}h`;
  }

  return `${minutes}m`;
}

function getCooldownSeconds(tree, nowMs) {
  if (!tree?.next_water_at) {
    return 0;
  }

  if (tree.can_water_now) {
    return 0;
  }

  const diffMs = new Date(tree.next_water_at).getTime() - nowMs;
  return diffMs > 0 ? Math.ceil(diffMs / 1000) : 0;
}

function isTreeReadyNow(tree, nowMs) {
  return getCooldownSeconds(tree, nowMs) === 0;
}

function getGrowthProgress(tree) {
  if (!tree) {
    return { railPercent: 0, stagePercent: 0, stageCost: 0, isAtFinal: false };
  }

  if (tree.stage >= 5) {
    // At final stage, show progress toward archiving (10 waterings)
    const archivePercent = Math.min(100, ((tree.archive_waterings ?? 0) / 10) * 100);
    return { railPercent: 100, stagePercent: archivePercent, stageCost: 10, isAtFinal: true };
  }

  // Stages start at 1, so stage_costs is indexed [0-4] for stages [1-5]
  const stageCostIndex = tree.stage - 1;
  const stageCost = tree.tree_type.stage_costs?.[stageCostIndex] ?? 1;
  const stagePercent = Math.min(100, (tree.water_progress / stageCost) * 100);
  // Progress from stage 1-5: (stage - 1 + stagePercent / 100) / 4 * 100
  const railPercent = Math.min(100, (((tree.stage - 1) + stagePercent / 100) / 4) * 100);

  return { railPercent, stagePercent, stageCost, isAtFinal: false };
}

function getBackgroundTreeLayout(index) {
  // Perspective-based layout: further trees are higher up and smaller
  // Create deterministic pseudo-random values
  const seed = index * 73856093 ^ 19349663; // Mix hash
  const pseudoRandom = (Math.sin(seed) + 1) / 2; // Normalize to 0-1
  const leftRandom = (Math.sin(seed * 2) + 1) / 2;
  
  // Depth layer: determines vertical position, size, and z-index
  // Trees arranged in rows: back (distant) to front (close)
  const depth = (index % 12) + 1; // 12 depth layers (1 = far, 12 = close)
  
  // Vertical position: further back = higher on screen
  // Maps depth 1-12 to bottom position 65% (far) to 5% (close)
  const bottomPercent = 65 - ((depth - 1) / 11) * 60;
  
  // Scale: smaller when further, larger when closer
  // Maps depth 1-12 to scale 0.25 (tiny distant) to 1.0 (large close)
  const scale = 0.25 + ((depth - 1) / 11) * 0.75;
  
  // Horizontal spread: wider at distant layers, narrower at close
  // Distant trees spread across full width, close trees toward center
  const horizontalSpread = 1 - (depth - 1) / 11 * 0.5; // 1.0 to 0.5
  const leftPercent = 50 + (pseudoRandom - 0.5) * 130 * horizontalSpread;
  
  // Opacity: distant trees more transparent, close trees opaque
  const opacity = 0.35 + ((depth - 1) / 11) * 0.65;
  
  // Randomize left position within this depth layer
  const leftVariation = (pseudoRandom - 0.5) * 20 * horizontalSpread;
  
  return {
    left: `calc(${leftPercent + leftVariation}%)`,
    bottom: `${bottomPercent}%`,
    scale: scale,
    depth: depth,
    opacity: opacity,
  };
}

export default function Forest() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const prefersReducedMotion = useReducedMotion();

  const [timeTick, setTimeTick] = useState(Date.now());
  const [interactionLocked, setInteractionLocked] = useState(false);
  const [isPlanting, setIsPlanting] = useState(false);
  const [plantingTreeType, setPlantingTreeType] = useState(null);
  const [cutsceneImageMode, setCutsceneImageMode] = useState('seed'); // 'seed' or 'baby'

  const containerRef = useRef(null);
  const previousSnapshotRef = useRef({ activeTreeId: null, stage: null, archivedCount: 0 });
  const lastActionRef = useRef(null);
  const isFirstVisitRef = useRef(true);

  // Refs for animation sequences
  const heroTreeRef = useRef(null);
  const wateringCanRef = useRef(null);
  const waterDropRef = useRef(null);
  const heroPanelRef = useRef(null);

  // Hook for plant animation sequence
  const runPlantAnimation = usePlantAnimation();

  useEffect(() => {
    // Tick every second to accurately update timer displays
    const intervalId = window.setInterval(() => setTimeTick(Date.now()), 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  const { data: forest, isLoading, error } = useQuery({
    queryKey: ['forest'],
    queryFn: () => forestApi.getForest().then((res) => res.data),
    refetchInterval: 60000,
  });

   const activeTree = forest?.active_tree ?? null;
   const archivedTrees = forest?.archived_trees ?? [];
   const treeTypes = forest?.tree_types ?? [];

  const archivedForest = useMemo(
    () => [...archivedTrees]
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .slice(0, MAX_BACKGROUND_TREES)
      .map((tree, index) => ({
        ...tree,
        layout: getBackgroundTreeLayout(index),
      })),
    [archivedTrees],
   );

    const treeWidth = activeTree ? HERO_WIDTHS[activeTree.stage] ?? HERO_WIDTHS[5] : HERO_WIDTHS[0];
    const cooldownSeconds = getCooldownSeconds(activeTree, timeTick);
    const canWaterActive = activeTree ? isTreeReadyNow(activeTree, timeTick) : false;
    const growth = getGrowthProgress(activeTree);


   const refreshForest = useCallback(() => {
    return queryClient.invalidateQueries({ queryKey: ['forest'] })
      .finally(() => setInteractionLocked(false));
  }, [queryClient]);

  const runWaterSequence = useCallback((variant, onComplete) => {
    if (prefersReducedMotion || !heroTreeRef.current) {
      onComplete?.();
      return;
    }

    const archiveShift = window.innerWidth > 768 ? 220 : 110;
    const treeNode = heroTreeRef.current;
    const canNode = wateringCanRef.current;
    const dropNode = waterDropRef.current;

    gsap.killTweensOf([treeNode, canNode, dropNode, heroPanelRef.current]);

    const timeline = gsap.timeline({ onComplete });

    if (canNode && dropNode) {
      timeline
        .set(dropNode, { autoAlpha: 0, y: -40, scale: 0.6 })
        .to(canNode, {
          rotate: -20,
          x: -22,
          y: -18,
          duration: 0.2,
          ease: 'power2.out',
        }, 0)
        .to(dropNode, {
          autoAlpha: 1,
          y: 68,
          scale: 1,
          duration: 0.32,
          ease: 'power1.in',
        }, 0.1)
        .to(dropNode, {
          autoAlpha: 0,
          scale: 1.15,
          duration: 0.12,
          ease: 'power1.out',
        }, 0.42)
        .to(canNode, {
          rotate: 0,
          x: 0,
          y: 0,
          duration: 0.28,
          ease: 'power2.out',
        }, 0.28);
    }

    timeline.to(treeNode, {
      y: -12,
      scale: variant === 'advance' ? 1.05 : 1.02,
      duration: 0.2,
      ease: 'power2.out',
    }, 0.22);

    if (heroPanelRef.current) {
      timeline.fromTo(heroPanelRef.current, {
        y: 0,
        boxShadow: '0 22px 60px rgba(15, 23, 42, 0.08)',
      }, {
        y: -4,
        boxShadow: variant === 'advance'
          ? '0 28px 80px rgba(15, 23, 42, 0.12)'
          : '0 24px 72px rgba(15, 23, 42, 0.1)',
        duration: 0.25,
        ease: 'power2.out',
      }, 0.16);

      timeline.to(heroPanelRef.current, {
        y: 0,
        boxShadow: '0 22px 60px rgba(15, 23, 42, 0.08)',
        duration: 0.4,
        ease: 'power2.out',
      }, variant === 'archive' ? 0.95 : 0.48);
    }

    if (variant === 'archive') {
      timeline.to(treeNode, {
        y: 108,
        x: archiveShift,
        scale: 0.42,
        autoAlpha: 0,
        filter: 'blur(8px)',
        duration: 0.9,
        ease: 'power2.inOut',
      }, 0.35);
    } else {
      timeline.to(treeNode, {
        y: 0,
        scale: 1,
        filter: variant === 'advance'
          ? 'drop-shadow(0 30px 55px rgba(34, 197, 94, 0.2))'
          : 'drop-shadow(0 24px 40px rgba(15, 23, 42, 0.1))',
        duration: variant === 'advance' ? 0.55 : 0.42,
        ease: variant === 'advance' ? 'back.out(1.6)' : 'elastic.out(1, 0.65)',
      }, 0.42);
    }
  }, [prefersReducedMotion]);

     const plantMutation = useMutation({
       mutationFn: (treeTypeId) => forestApi.plantTree(treeTypeId).then((res) => res.data),
        onSuccess: (data) => {
          lastActionRef.current = 'plant';
          
          // Set planting state to show seed image during animation
          setPlantingTreeType(data.tree.tree_type);
          setCutsceneImageMode('seed');
          setIsPlanting(true);

          // Optimistically update the cache so the activeTree exists immediately!
          // This ensures the <Cutscene> renders rather than the <EmptyPanel>
          queryClient.setQueryData(['forest'], (oldData) => {
            if (!oldData) return oldData;
            return { ...oldData, active_tree: data.tree };
          });

          // Need a tiny delay to allow React to render the Cutscene DOM element
          // so heroTreeRef becomes correctly attached to the animated image
          setTimeout(() => {
            runPlantAnimation(
              heroTreeRef,
              {
                onSwapImage: () => {
                  // Switch image source from seed to stage1 halfway through
                  setCutsceneImageMode('baby');
                },
                onComplete: () => {
                  // After animation completes (2.0s), swap UI back to normal tree card
                  setIsPlanting(false);
                  setPlantingTreeType(null);
                  
                  // Allow a tiny delay for React to re-render before refreshing data
                  setTimeout(() => {
                    refreshForest();
                  }, 50);
                }
              }
            );
          }, 10);
        },
        onError: () => setInteractionLocked(false),
      });

  const waterMutation = useMutation({
    mutationFn: (treeId) => forestApi.waterTree(treeId).then((res) => res.data),
    onSuccess: (data) => {
      lastActionRef.current = data.archived
        ? 'archive'
        : data.advanced
          ? 'advance'
          : data.rescued
            ? 'rescue'
            : 'water';

      runWaterSequence(lastActionRef.current === 'archive' ? 'archive' : lastActionRef.current === 'advance' ? 'advance' : 'water', refreshForest);
    },
    onError: () => setInteractionLocked(false),
  });

  const skipStageMutation = useMutation({
    mutationFn: (treeId) => forestApi.debugSkipStage(treeId).then((res) => res.data),
    onSuccess: (data) => {
      lastActionRef.current = data.archived ? 'archive' : 'advance';

      if (prefersReducedMotion || !heroTreeRef.current) {
        refreshForest();
        return;
      }

      gsap.timeline({ onComplete: refreshForest })
        .to(heroTreeRef.current, {
          y: -16,
          scale: 1.06,
          filter: 'drop-shadow(0 30px 60px rgba(249, 115, 22, 0.25))',
          duration: 0.2,
          ease: 'power2.out',
        })
        .to(heroTreeRef.current, {
          y: 0,
          scale: data.archived ? 0.4 : 1,
          x: data.archived ? (window.innerWidth > 768 ? 220 : 110) : 0,
          autoAlpha: data.archived ? 0 : 1,
          filter: 'drop-shadow(0 24px 40px rgba(15, 23, 42, 0.1))',
          duration: 0.72,
          ease: data.archived ? 'power2.inOut' : 'back.out(1.4)',
        });
    },
    onError: () => setInteractionLocked(false),
  });

   useGSAP(() => {
    if (isLoading || prefersReducedMotion || isFirstVisitRef.current) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.timeline({ defaults: { ease: 'power3.out' } })
        .fromTo('.forest-topbar', {
          y: -28,
          autoAlpha: 0,
        }, {
          y: 0,
          autoAlpha: 1,
          duration: 0.72,
        })
        .fromTo('.forest-hero-shell', {
          y: 24,
          autoAlpha: 0,
        }, {
          y: 0,
          autoAlpha: 1,
          duration: 0.78,
        }, '-=0.42')
        .fromTo('.forest-background-tree', {
          y: 26,
          autoAlpha: 0,
        }, {
          y: 0,
          autoAlpha: 1,
          duration: 0.65,
          stagger: 0.03,
        }, '-=0.5');
    }, containerRef);

    // Mark that we've done the first visit animation
    isFirstVisitRef.current = false;

    return () => ctx.revert();
  }, { scope: containerRef, dependencies: [isLoading, prefersReducedMotion] });

  useEffect(() => {
    if (prefersReducedMotion) {
      previousSnapshotRef.current = {
        activeTreeId: activeTree?.id ?? null,
        stage: activeTree?.stage ?? null,
        archivedCount: archivedTrees.length,
      };
      return;
    }

    const previous = previousSnapshotRef.current;

    if (activeTree && heroTreeRef.current) {
      if (lastActionRef.current === 'plant' || (!previous.activeTreeId && activeTree.id)) {
        gsap.fromTo(heroTreeRef.current, {
          autoAlpha: 0,
          y: 20,
          scale: 0.82,
          filter: 'drop-shadow(0 10px 20px rgba(15, 23, 42, 0.06))',
        }, {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          filter: 'drop-shadow(0 24px 40px rgba(15, 23, 42, 0.1))',
          duration: 0.72,
          ease: 'back.out(1.5)',
        });
      } else if (previous.activeTreeId === activeTree.id && previous.stage !== null && previous.stage !== activeTree.stage) {
        gsap.fromTo(heroTreeRef.current, {
          autoAlpha: 0,
          y: 26,
          scale: 0.9,
        }, {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          ease: 'back.out(1.45)',
        });
      }
    }

    if (archivedTrees.length > previous.archivedCount) {
      gsap.fromTo('.forest-background-tree', {
        autoAlpha: 0,
        y: 18,
      }, {
        autoAlpha: 1,
        y: 0,
        duration: 0.58,
        stagger: 0.02,
        ease: 'power2.out',
      });
    }

    previousSnapshotRef.current = {
      activeTreeId: activeTree?.id ?? null,
      stage: activeTree?.stage ?? null,
      archivedCount: archivedTrees.length,
    };

    lastActionRef.current = null;
  }, [activeTree, archivedTrees.length, prefersReducedMotion]);

   const handlePlant = useCallback(() => {
     if (!treeTypes || treeTypes.length === 0) {
       return;
     }

     setInteractionLocked(true);
     // Plant the first (and only) tree type
     plantMutation.mutate(treeTypes[0].id);
   }, [treeTypes, plantMutation]);

  const handleWaterActive = useCallback(() => {
    if (!activeTree || !canWaterActive || forest?.watering_cans < 1 || waterMutation.isPending || interactionLocked) {
      return;
    }

    setInteractionLocked(true);
    waterMutation.mutate(activeTree.id);
  }, [activeTree, canWaterActive, forest?.watering_cans, interactionLocked, waterMutation]);

  const handleSkipStage = useCallback(() => {
    if (!activeTree || skipStageMutation.isPending || interactionLocked) {
      return;
    }

    setInteractionLocked(true);
    skipStageMutation.mutate(activeTree.id);
  }, [activeTree, interactionLocked, skipStageMutation]);

  if (isLoading) {
    return (
      <div className="forest-page forest-state-shell">
        <div className="forest-loading-mark"></div>
        <p>Loading your forest...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="forest-page forest-state-shell forest-state-shell--error">
        <p>Forest view could not load right now.</p>
        <button className="forest-secondary-button" onClick={refreshForest}>
          Try again
        </button>
      </div>
    );
  }

   return (
     <div className="forest-page" ref={containerRef}>
       <header className="forest-topbar">
        <button className="forest-nav-button" onClick={() => navigate(-1)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back
        </button>

        <div className="forest-can-pill" aria-label={`Watering cans: ${forest?.watering_cans ?? 0}`}>
          <img src={wateringCanAsset} alt="" />
          <div>
            <span>Watering cans</span>
            <strong>{forest?.watering_cans ?? 0}</strong>
          </div>
        </div>

        <div className="forest-archive-count" aria-label={`Archived trees: ${archivedTrees.length}`}>
          <span className="forest-archive-count-label">Forest</span>
          <strong>{Math.min(archivedTrees.length, MAX_BACKGROUND_TREES)}+ / {archivedTrees.length}</strong>
        </div>
      </header>

      <div className="forest-background-layer">
        {archivedForest.map((tree) => (
          <div
            key={tree.id}
            className={`forest-background-tree ${tree.is_withered ? 'is-withered' : ''}`}
            style={{
              '--tree-left': tree.layout.left,
              '--tree-bottom': tree.layout.bottom,
              '--tree-scale': tree.layout.scale,
              '--tree-depth': tree.layout.depth,
              '--tree-opacity': tree.layout.opacity,
            }}
            aria-label={`Archived ${tree.tree_type.display_name}`}
          >
            <span className="forest-background-tree-visual">
              <img src={getTreeAsset(tree.tree_type.name, 5)} alt="" />
            </span>
          </div>
        ))}
      </div>

        <main className="forest-hero-shell">
         {activeTree ? (
             isPlanting ? (
               // Planting cutscene - just the animated tree, no UI
               <div className="forest-planting-cutscene">
                 <div className="forest-tree-card-visual">
                   <img
                     ref={heroTreeRef}
                     src={cutsceneImageMode === 'seed' 
                       ? getSeedAsset(plantingTreeType?.name) 
                       : getTreeAsset(plantingTreeType?.name, 1)
                     }
                     alt="Planting animation"
                     className="forest-tree-card-image"
                     style={{ '--tree-width': cutsceneImageMode === 'seed' ? `${HERO_WIDTHS[0]}px` : `${HERO_WIDTHS[1]}px` }}
                   />
                 </div>
               </div>
             ) : (
               <ForestTreeCard
                 tree={activeTree}
                 treeAsset={getTreeAsset(activeTree.tree_type.name, activeTree.stage)}
                 stageName={getDisplayStageName(activeTree.stage)}
                 waterProgressPercent={growth.stagePercent}
                 overallProgressPercent={growth.railPercent}
                 canWater={canWaterActive}
                 cooldownSeconds={cooldownSeconds}
                 onWater={handleWaterActive}
                 isPending={waterMutation.isPending}
                 disabled={interactionLocked}
                 wateringCanCount={forest?.watering_cans ?? 0}
                 isAtFinal={activeTree.stage >= 5}
                archiveProgress={activeTree.archive_waterings ?? 0}
                treeImageRef={heroTreeRef}
                treeWidth={treeWidth}
              />
             )
          ) : (
            <section className="forest-empty-panel">
              <div className="forest-empty-preview">
                <img src={pinePurpleSeed} alt="Seed" />
              </div>
              <div className="forest-empty-copy">
                <span className="forest-overline">No active tree</span>
                <h2>Start a new growth cycle.</h2>
                <p>Plant a seed, earn watering cans in Pomodoro, and grow your forest.</p>
              </div>
              <button className="forest-primary-button" onClick={handlePlant}>
                <img src={wateringCanAsset} alt="" />
                <span>Plant a seed</span>
              </button>
            </section>
         )}
       </main>

      {import.meta.env.DEV && activeTree && (
        <div className="forest-debug-strip">
          <span>Debug</span>
          <button type="button" onClick={handleSkipStage} disabled={skipStageMutation.isPending}>
            Skip stage
          </button>
        </div>
      )}
    </div>
  );
}

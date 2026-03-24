import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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

function getDisplayStageName(stage, t) {
  const key = `forest:stage_${stage}`;
  const translated = t(key);
  // If i18next returns the key itself, the stage is unknown
  return translated === key ? t('forest:unknown') : translated;
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

const MAX_BACKGROUND_TREES = 100;

/** Read a CSS custom property from :root (used for GSAP inline styles) */
function getCSSVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/** Build an rgba() string using the --forest-shadow-rgb triplet */
function shadowRgba(alpha) {
  return `rgba(${getCSSVar('--forest-shadow-rgb')}, ${alpha})`;
}

function getTreeAsset(typeName, stage) {
  const stageName = stage === 5 ? 'stage_final' : `stage_${stage}`;
  return TREE_ASSETS[typeName]?.[stageName] ?? pinePurpleFinal;
}

function getSeedAsset(typeName) {
  return TREE_ASSETS[typeName]?.['seed'] ?? TREE_ASSETS['pine_purple']?.['seed'];
}

function formatDuration(seconds, t) {
  if (!seconds || seconds <= 0) {
    return t('forest:ready_now');
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
    return { railPercent: 0, stagePercent: 0, stageCost: 0, waterProgress: 0, isAtFinal: false };
  }

  if (tree.stage >= 5) {
    // At final stage, show progress toward archiving (10 waterings)
    const archivePercent = Math.min(100, ((tree.archive_waterings ?? 0) / 10) * 100);
    return { railPercent: 100, stagePercent: archivePercent, stageCost: 10, waterProgress: tree.archive_waterings ?? 0, isAtFinal: true };
  }

  // Stages start at 1, so stage_costs is indexed [0-4] for stages [1-5]
  const stageCostIndex = tree.stage - 1;
  const stageCost = tree.tree_type.stage_costs?.[stageCostIndex] ?? 1;
  const waterProgress = tree.water_progress ?? 0;
  const stagePercent = Math.min(100, (waterProgress / stageCost) * 100);
  // Progress from stage 1-5: (stage - 1 + stagePercent / 100) / 4 * 100
  const railPercent = Math.min(100, (((tree.stage - 1) + stagePercent / 100) / 4) * 100);

  return { railPercent, stagePercent, stageCost, waterProgress, isAtFinal: false };
}

function getBackgroundTreeLayout(index) {
  const total = 100; // Match MAX_BACKGROUND_TREES
  
  // Power function pushes more trees towards the front/closer to screen
  // Instead of an even 0-1 distribution, this curves it so 70% of trees 
  // populate the front half of the space.
  const rawProgress = index / Math.max(1, total - 1);
  const depthProgress = Math.pow(rawProgress, 0.7); 
  
  const seed = index * 73856093 ^ 19349663;
  
  // Golden ratio for beautifully even horizontal distribution
  let nx = ((index * 0.618033988749895) % 1) * 2 - 1; // -1.0 to 1.0
  
  // Add organic jitter so it doesn't look like a mathematical grid
  nx += (Math.sin(seed) * 0.15);
  
  // Spread: Start at 40% width at horizon, expand to 110% width in foreground
  const maxSpread = 40 + (Math.pow(depthProgress, 1.2) * 60); 
  let leftPercent = 50 + (nx * maxSpread);
  
  // Planetary curve: horizon starts a bit lower (55%), drops aggressively to -10% (off screen bottom)
  // This brings the foreground trees MUCH closer to the camera.
  const baseBottom = 55 - (depthProgress * 65); 
  const domeDrop = (nx * nx) * 18; // Edges drop off
  
  let bottomPercent = baseBottom - domeDrop;
  bottomPercent += (Math.sin(seed * 2) * 2.5); // uneven ground
  
  // Scaling based perfectly on Y coordinate
  // Base scale starts larger (0.35 instead of 0.25)
  // Max scale gets huge (up to 1.8 instead of 1.35) for trees near the bottom
  let scale = 0.35 + ((55 - bottomPercent) / 65) * 1.45;
  scale *= 0.85 + (Math.abs(Math.sin(seed * 3)) * 0.35); // 0.85x to 1.2x variance
  
  const opacity = Math.min(1, 0.5 + (depthProgress * 0.5));
  
  return {
    left: `calc(${leftPercent}%)`,
    bottom: `${bottomPercent}%`,
    scale: Math.max(0.25, scale), // Minimum scale is larger
    depth: depthProgress,
    opacity: opacity,
    zIndex: Math.round(1000 - bottomPercent * 10), 
  };
}

export default function Forest() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const prefersReducedMotion = useReducedMotion();
  const { t } = useTranslation(['forest', 'common']);

  const [timeTick, setTimeTick] = useState(Date.now());
  const [interactionLocked, setInteractionLocked] = useState(false);
  const [isPlanting, setIsPlanting] = useState(false);
  const [plantingTreeType, setPlantingTreeType] = useState(null);
  const [cutsceneImageMode, setCutsceneImageMode] = useState('seed'); // 'seed' or 'baby'
  const [isUiHidden, setIsUiHidden] = useState(false);

  const containerRef = useRef(null);
  const previousSnapshotRef = useRef({ activeTreeId: null, stage: null, archivedCount: 0 });
  const lastActionRef = useRef(null);
  const isFirstVisitRef = useRef(true);

  // Refs for animation sequences
  const heroTreeRef = useRef(null);
  const wateringCanRef = useRef(null);
  const waterDropRef = useRef(null);
  const heroPanelRef = useRef(null);
  const cutsceneCardRef = useRef(null);

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

    const timeline = gsap.timeline({ 
      onComplete: () => {
        if (variant === 'archive') {
          // Clear styles so the next "empty state" seed image isn't hidden or flown away
          gsap.set(treeNode, { clearProps: 'all' });
        }
        onComplete?.();
      }
    });

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
        boxShadow: `0 22px 60px ${shadowRgba(0.08)}`,
      }, {
        y: -4,
        boxShadow: variant === 'advance'
          ? `0 28px 80px ${shadowRgba(0.12)}`
          : `0 24px 72px ${shadowRgba(0.1)}`,
        duration: 0.25,
        ease: 'power2.out',
      }, 0.16);

      timeline.to(heroPanelRef.current, {
        y: 0,
        boxShadow: `0 22px 60px ${shadowRgba(0.08)}`,
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
          : `drop-shadow(0 24px 40px ${shadowRgba(0.1)})`,
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

          // Note: We DO NOT optimistically update the cache here!
          // We want the UI to remain in "Empty" mode so it can crossfade out cleanly.
          // The optimistic update will happen exactly when the plant animation finishes.

          // Need a tiny delay to allow React to render the Cutscene DOM element
          // Using 50ms ensures React completes the DOM update before GSAP runs
          setTimeout(() => {
            runPlantAnimation(
              heroTreeRef,
              cutsceneCardRef,
              {
                onSwapImage: () => {
                  // Switch image source from seed to stage1 halfway through
                  setCutsceneImageMode('baby');
                },
                onComplete: () => {
                  // After animation completes (2.5s), optimistically apply tree to cache
                  // so that when isPlanting becomes false, the UI crossfades into the ACTIVE tree, not the EMPTY tree.
                  queryClient.setQueryData(['forest'], (oldData) => {
                    if (!oldData) return oldData;
                    return { ...oldData, active_tree: data.tree };
                  });

                  // Swap UI back to normal tree card
                  setIsPlanting(false);
                  setPlantingTreeType(null);
                  
                  // Allow a tiny delay for React to re-render before refreshing data
                  setTimeout(() => {
                    refreshForest();
                  }, 50);
                }
              }
            );
          }, 50);
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

      gsap.timeline({ 
        onComplete: () => {
          if (data.archived) gsap.set(heroTreeRef.current, { clearProps: 'all' });
          refreshForest();
        } 
      })
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
          filter: `drop-shadow(0 24px 40px ${shadowRgba(0.1)})`,
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
      if (lastActionRef.current === 'plant') {
        // Skip entrance animation: usePlantAnimation already handled bringing the baby tree into position
      } else if (!previous.activeTreeId && activeTree.id) {
        gsap.fromTo(heroTreeRef.current, {
          autoAlpha: 0,
          y: 20,
          scale: 0.82,
          filter: `drop-shadow(0 10px 20px ${shadowRgba(0.06)})`,
        }, {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          filter: `drop-shadow(0 24px 40px ${shadowRgba(0.1)})`,
          duration: 0.72,
          ease: 'back.out(1.5)',
        });
      } else if (!activeTree && previous.activeTreeId) {
        // Tree was archived, fade in the seed for the empty state
        gsap.fromTo(heroTreeRef.current, {
          autoAlpha: 0,
          scale: 0.8,
        }, {
          autoAlpha: 1,
          scale: 1,
          duration: 0.6,
          ease: 'power2.out',
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
        <p>{t('forest:loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="forest-page forest-state-shell forest-state-shell--error">
        <p>{t('forest:error_load')}</p>
        <button className="forest-secondary-button" onClick={refreshForest}>
          {t('forest:try_again')}
        </button>
      </div>
    );
  }

   return (
     <div className="forest-page" ref={containerRef}>
       <header className={`forest-topbar ${isUiHidden ? 'is-ui-hidden' : ''}`}>
        <button className="forest-nav-button" onClick={() => navigate(-1)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          {t('forest:back')}
        </button>

        <div className="forest-can-pill" aria-label={`${t('forest:watering_cans')}: ${forest?.watering_cans ?? 0}`}>
          <img src={wateringCanAsset} alt="" />
          <div>
            <span>{t('forest:watering_cans')}</span>
            <strong>{forest?.watering_cans ?? 0}</strong>
          </div>
        </div>

        <div className="forest-archive-count" aria-label={`${t('forest:forest_label')}: ${archivedTrees.length}`}>
          <span className="forest-archive-count-label">{t('forest:forest_label')}</span>
          <strong>{Math.min(archivedTrees.length, MAX_BACKGROUND_TREES)}+ / {archivedTrees.length}</strong>
        </div>
      </header>

      <button 
        className="forest-toggle-ui-btn" 
        onClick={() => setIsUiHidden(!isUiHidden)}
        aria-label={isUiHidden ? t('forest:show_ui') : t('forest:hide_ui')}
        title={isUiHidden ? t('forest:show_ui') : t('forest:hide_ui')}
      >
        {isUiHidden ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
            <line x1="1" y1="1" x2="23" y2="23"></line>
          </svg>
        )}
      </button>

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
              zIndex: tree.layout.zIndex,
            }}
            aria-label={`Archived ${tree.tree_type.display_name}`}
          >
            <span className="forest-background-tree-visual">
              <img src={getTreeAsset(tree.tree_type.name, 5)} alt="" />
            </span>
          </div>
        ))}
      </div>

      <div 
        className={`forest-planting-overlay ${isPlanting ? 'is-active' : ''}`}
      ></div>

        <main className={`forest-hero-shell ${isUiHidden ? 'is-ui-hidden' : ''}`}>
           <ForestTreeCard
             tree={activeTree}
             treeAsset={isPlanting ? (cutsceneImageMode === 'seed' ? getSeedAsset(plantingTreeType?.name) : getTreeAsset(plantingTreeType?.name, 1)) : activeTree ? getTreeAsset(activeTree.tree_type.name, activeTree.stage) : pinePurpleSeed}
             stageName={activeTree ? getDisplayStageName(activeTree.stage, t) : ''}
             waterProgressPercent={growth.stagePercent}
             stageCost={growth.stageCost}
             waterProgress={growth.waterProgress}
             canWater={canWaterActive}
             cooldownSeconds={cooldownSeconds}
             onWater={handleWaterActive}
             onPlant={handlePlant}
             isPending={waterMutation.isPending || plantMutation.isPending}
             disabled={interactionLocked}
             wateringCanCount={forest?.watering_cans ?? 0}
             isAtFinal={activeTree ? activeTree.stage >= 5 : false}
             archiveProgress={activeTree?.archive_waterings ?? 0}
             treeImageRef={heroTreeRef}
             treeWidth={isPlanting ? (cutsceneImageMode === 'seed' ? HERO_WIDTHS[0] : HERO_WIDTHS[1]) : activeTree ? treeWidth : HERO_WIDTHS[0]}
             isPlanting={isPlanting}
             plantingTitle={plantingTreeType ? t('forest:planting_name', { name: plantingTreeType.display_name }) : t('forest:planting')}
             cardRefOverride={cutsceneCardRef}
          />
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

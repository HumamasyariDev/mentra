import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { forestApi } from '../services/api';
import { useReducedMotion } from '../hooks/useReducedMotion';
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
  { value: 0, label: 'Seed' },
  { value: 1, label: 'Stage 1' },
  { value: 2, label: 'Stage 2' },
  { value: 3, label: 'Stage 3' },
  { value: 4, label: 'Stage 4' },
  { value: 5, label: 'Final' },
];

const HERO_WIDTHS = {
  0: 112,
  1: 164,
  2: 224,
  3: 292,
  4: 366,
  5: 440,
};

const BACKGROUND_SLOTS = [
  { left: '-12%', bottom: '-8%', scale: 1.28, depth: 8 },
  { left: '-1%', bottom: '-10%', scale: 1.08, depth: 7 },
  { left: '10%', bottom: '-6%', scale: 0.84, depth: 5 },
  { left: '-4%', bottom: '10%', scale: 0.62, depth: 3 },
  { left: '7%', bottom: '16%', scale: 0.48, depth: 2 },
  { left: '15%', bottom: '2%', scale: 0.66, depth: 3 },
  { left: '84%', bottom: '2%', scale: 0.66, depth: 3 },
  { left: '92%', bottom: '16%', scale: 0.48, depth: 2 },
  { left: '101%', bottom: '10%', scale: 0.62, depth: 3 },
  { left: '79%', bottom: '-6%', scale: 0.84, depth: 5 },
  { left: '90%', bottom: '-10%', scale: 1.08, depth: 7 },
  { left: '100%', bottom: '-8%', scale: 1.28, depth: 8 },
];

function getTreeAsset(typeName, stage) {
  const stageName = stage === 0 ? 'seed' : stage === 5 ? 'stage_final' : `stage_${stage}`;
  return TREE_ASSETS[typeName]?.[stageName] ?? pinePurpleFinal;
}

function getStageName(stage) {
  return STAGES.find((entry) => entry.value === stage)?.label ?? 'Unknown';
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

  const diffMs = new Date(tree.next_water_at).getTime() - nowMs;
  return diffMs > 0 ? Math.ceil(diffMs / 1000) : 0;
}

function isTreeReadyNow(tree, nowMs) {
  return getCooldownSeconds(tree, nowMs) === 0;
}

function getGrowthProgress(tree) {
  if (!tree) {
    return { railPercent: 0, stagePercent: 0, stageCost: 0 };
  }

  if (tree.stage >= 5) {
    return { railPercent: 100, stagePercent: 100, stageCost: 0 };
  }

  const stageCost = tree.tree_type.stage_costs?.[tree.stage] ?? 1;
  const stagePercent = Math.min(100, (tree.water_progress / stageCost) * 100);
  const railPercent = Math.min(100, ((tree.stage + stagePercent / 100) / 5) * 100);

  return { railPercent, stagePercent, stageCost };
}

function getActiveStatus(activeTree, canWaterNow, cooldownSeconds) {
  if (!activeTree) {
    return {
      tone: 'empty',
      label: 'Empty plot',
      detail: 'Plant a seed to begin the next tree.',
    };
  }

  if (activeTree.is_withered) {
    return {
      tone: 'warn',
      label: 'Needs rescue',
      detail: activeTree.rescue_hours_remaining
        ? `Rescue window: ${activeTree.rescue_hours_remaining}h remaining`
        : 'Water it now to save it.',
    };
  }

  if (!canWaterNow) {
    return {
      tone: 'muted',
      label: 'Resting',
      detail: `Next water in ${formatDuration(cooldownSeconds)}`,
    };
  }

  return {
    tone: 'ready',
    label: 'Ready',
    detail: activeTree.hours_until_wither
      ? `Withers in ${activeTree.hours_until_wither}h if ignored`
      : 'Ready for the next watering.',
  };
}

function getBackgroundTreeLayout(index) {
  const slot = BACKGROUND_SLOTS[index % BACKGROUND_SLOTS.length];
  const cycle = Math.floor(index / BACKGROUND_SLOTS.length);

  return {
    left: `calc(${slot.left} + ${cycle * 1.25}%)`,
    bottom: `calc(${slot.bottom} + ${cycle * 1.1}%)`,
    scale: Math.max(0.28, slot.scale - cycle * 0.04),
    depth: slot.depth - cycle,
    opacity: Math.max(0.28, 0.96 - cycle * 0.06),
  };
}

export default function Forest() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const prefersReducedMotion = useReducedMotion();

  const [selectedArchivedTree, setSelectedArchivedTree] = useState(null);
  const [showPlantModal, setShowPlantModal] = useState(false);
  const [timeTick, setTimeTick] = useState(Date.now());
  const [interactionLocked, setInteractionLocked] = useState(false);

  const containerRef = useRef(null);
  const heroTreeRef = useRef(null);
  const heroPanelRef = useRef(null);
  const headerRef = useRef(null);
  const wateringCanRef = useRef(null);
  const waterDropRef = useRef(null);
  const previousSnapshotRef = useRef({ activeTreeId: null, stage: null, archivedCount: 0 });
  const lastActionRef = useRef(null);

  useEffect(() => {
    const intervalId = window.setInterval(() => setTimeTick(Date.now()), 60000);
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
      .map((tree, index) => ({
        ...tree,
        layout: getBackgroundTreeLayout(index),
      })),
    [archivedTrees],
  );

  const heroTreeWidth = activeTree ? HERO_WIDTHS[activeTree.stage] ?? HERO_WIDTHS[5] : HERO_WIDTHS[0];
  const cooldownSeconds = getCooldownSeconds(activeTree, timeTick);
  const canWaterActive = activeTree ? isTreeReadyNow(activeTree, timeTick) : false;
  const growth = getGrowthProgress(activeTree);
  const activeStatus = getActiveStatus(activeTree, canWaterActive, cooldownSeconds);

  useEffect(() => {
    if (!selectedArchivedTree) {
      return;
    }

    const refreshedTree = archivedTrees.find((tree) => tree.id === selectedArchivedTree.id);

    if (!refreshedTree) {
      setSelectedArchivedTree(null);
      return;
    }

    if (refreshedTree !== selectedArchivedTree) {
      setSelectedArchivedTree(refreshedTree);
    }
  }, [archivedTrees, selectedArchivedTree]);

  const refreshForest = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['forest'] })
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
    onSuccess: () => {
      lastActionRef.current = 'plant';
      setShowPlantModal(false);
      refreshForest();
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
    if (isLoading || prefersReducedMotion) {
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

  const handlePlant = useCallback((treeTypeId) => {
    setInteractionLocked(true);
    plantMutation.mutate(treeTypeId);
  }, [plantMutation]);

  const handleWaterActive = useCallback(() => {
    if (!activeTree || !canWaterActive || forest?.watering_cans < 1 || waterMutation.isPending || interactionLocked) {
      return;
    }

    setInteractionLocked(true);
    waterMutation.mutate(activeTree.id);
  }, [activeTree, canWaterActive, forest?.watering_cans, interactionLocked, waterMutation]);

  const handleWaterArchived = useCallback((treeId) => {
    if (forest?.watering_cans < 1 || waterMutation.isPending || interactionLocked) {
      return;
    }

    setInteractionLocked(true);
    waterMutation.mutate(treeId);
  }, [forest?.watering_cans, interactionLocked, waterMutation]);

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
      <header className="forest-topbar" ref={headerRef}>
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
      </header>

      <div className="forest-background-layer">
        {archivedForest.map((tree) => (
          <button
            key={tree.id}
            className={`forest-background-tree ${tree.is_withered ? 'is-withered' : ''} ${tree.is_permanent ? 'is-permanent' : ''} ${selectedArchivedTree?.id === tree.id ? 'is-selected' : ''}`}
            style={{
              '--tree-left': tree.layout.left,
              '--tree-bottom': tree.layout.bottom,
              '--tree-scale': tree.layout.scale,
              '--tree-depth': tree.layout.depth,
              '--tree-opacity': tree.layout.opacity,
            }}
            onClick={() => setSelectedArchivedTree(tree)}
            aria-label={`Archived ${tree.tree_type.display_name}`}
            aria-pressed={selectedArchivedTree?.id === tree.id}
            type="button"
          >
            <span className="forest-background-tree-visual">
              <img src={getTreeAsset(tree.tree_type.name, 5)} alt="" />
            </span>
            {!tree.is_permanent && <span className="forest-background-tree-marker"></span>}
          </button>
        ))}
      </div>

      <main className="forest-hero-shell">
        {activeTree ? (
          <section className="forest-hero-panel" ref={heroPanelRef}>
            <div className="forest-hero-visual">
              <div className="forest-hero-halo"></div>
              <div className="forest-hero-tree-wrap">
                <img
                  ref={heroTreeRef}
                  className={`forest-hero-tree ${activeTree.is_withered ? 'is-withered' : ''}`}
                  src={getTreeAsset(activeTree.tree_type.name, activeTree.stage)}
                  alt={activeTree.tree_type.display_name}
                  style={{ '--hero-tree-width': `${heroTreeWidth}px` }}
                />
              </div>
              <div className="forest-water-prop" aria-hidden="true">
                <img ref={wateringCanRef} className="forest-water-can" src={wateringCanAsset} alt="" />
                <img ref={waterDropRef} className="forest-water-drop" src={waterDropAsset} alt="" />
              </div>
            </div>

            <div className="forest-hero-copy">
              <div className="forest-status-row">
                <span className="forest-overline">Active tree</span>
                <div className="forest-title-row">
                  <h2>{activeTree.tree_type.display_name}</h2>
                  <span className={`forest-status-pill tone-${activeStatus.tone}`}>{activeStatus.label}</span>
                </div>
                <p className="forest-status-detail">{activeStatus.detail}</p>
              </div>

              <div className="forest-growth-card">
                <div className="forest-growth-card-header">
                  <span>Growth</span>
                  {activeTree.stage < 5 && (
                    <strong>{getStageName(activeTree.stage)} - {activeTree.water_progress} / {growth.stageCost}</strong>
                  )}
                </div>

                <div className="forest-growth-rail" aria-label="Growth progress">
                  <div className="forest-growth-track"></div>
                  <div className="forest-growth-fill" style={{ '--growth-rail': `${growth.railPercent}%` }}></div>

                  {STAGES.map((stage, index) => {
                    const completed = activeTree.stage > stage.value || activeTree.stage === 5;
                    const current = activeTree.stage === stage.value;

                    return (
                      <div
                        key={stage.value}
                        className={`forest-growth-stop ${completed ? 'is-complete' : ''} ${current ? 'is-current' : ''}`}
                        style={{ '--growth-stop-position': `${index * 20}%` }}
                      >
                        <span className="forest-growth-stop-dot"></span>
                        <span className="forest-growth-stop-label">{stage.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="forest-action-panel">
                <button
                  className="forest-primary-button"
                  onClick={handleWaterActive}
                  disabled={!canWaterActive || forest?.watering_cans < 1 || waterMutation.isPending || interactionLocked}
                >
                  <img src={wateringCanAsset} alt="" />
                  <span>
                    {activeTree.is_withered ? 'Rescue tree' : canWaterActive ? 'Water tree' : 'Waiting to water'}
                  </span>
                </button>

                <p className="forest-action-note">
                  {activeTree.is_withered
                    ? `Rescue within ${activeTree.rescue_hours_remaining ?? 0}h.`
                    : canWaterActive
                      ? 'Ready for the next watering.'
                      : `Available again in ${formatDuration(cooldownSeconds)}.`}
                </p>
              </div>
            </div>
          </section>
        ) : (
          <section className="forest-empty-panel">
            <div className="forest-empty-preview">
              <img src={pinePurpleSeed} alt="Seed" />
            </div>
            <div className="forest-empty-copy">
              <span className="forest-overline">No active tree</span>
              <h2>Start a new growth cycle.</h2>
              <p>Plant a seed, earn watering cans in Pomodoro, and move each finished tree into the background forest.</p>
            </div>
            <button className="forest-primary-button" onClick={() => setShowPlantModal(true)}>
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

      {showPlantModal && (
        <div className="forest-modal-overlay" onClick={() => setShowPlantModal(false)}>
          <div className="forest-modal" onClick={(event) => event.stopPropagation()}>
            <div className="forest-modal-header">
              <span className="forest-overline">Plant</span>
              <h3>Choose your next tree.</h3>
            </div>

            <div className="forest-tree-type-grid">
              {treeTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  className="forest-tree-type-card"
                  onClick={() => handlePlant(type.id)}
                  disabled={plantMutation.isPending || interactionLocked}
                >
                  <img src={getTreeAsset(type.name, 5)} alt={type.display_name} />
                  <div>
                    <strong>{type.display_name}</strong>
                    <span>{type.stage_costs.join(' / ')} waters</span>
                  </div>
                </button>
              ))}
            </div>

            <button className="forest-secondary-button" type="button" onClick={() => setShowPlantModal(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {selectedArchivedTree && (
        <div className="forest-modal-overlay" onClick={() => setSelectedArchivedTree(null)}>
          <div className="forest-modal forest-modal--archived" onClick={(event) => event.stopPropagation()}>
            <div className="forest-modal-header">
              <span className="forest-overline">Archived tree</span>
              <h3>{selectedArchivedTree.tree_type.display_name}</h3>
              <p>Background trees stay final-stage only. Water them over time to secure them permanently.</p>
            </div>

            <img
              className={`forest-modal-tree ${selectedArchivedTree.is_withered ? 'is-withered' : ''}`}
              src={getTreeAsset(selectedArchivedTree.tree_type.name, 5)}
              alt={selectedArchivedTree.tree_type.display_name}
            />

            {selectedArchivedTree.is_permanent ? (
              <div className="forest-permanent-block">
                <span className="forest-status-pill tone-ready">Permanent</span>
                <p>This tree is fully secured and no longer needs upkeep.</p>
              </div>
            ) : (
              <>
                <div className="forest-archive-progress">
                  <div className="forest-archive-progress-row">
                    {Array.from({ length: 10 }).map((_, index) => (
                      <span
                        key={index}
                        className={`forest-archive-dot ${index < selectedArchivedTree.archive_waterings ? 'is-filled' : ''}`}
                      ></span>
                    ))}
                  </div>
                  <p>{selectedArchivedTree.archive_waterings}/10 maintenance waters</p>
                </div>

                <div className="forest-archive-facts">
                  <div className="forest-fact-card">
                    <span>Status</span>
                    <strong>{selectedArchivedTree.is_withered ? 'Needs rescue' : 'Stable'}</strong>
                  </div>
                  <div className="forest-fact-card">
                    <span>Withers in</span>
                    <strong>
                      {selectedArchivedTree.is_withered
                        ? `${selectedArchivedTree.rescue_hours_remaining ?? 0}h rescue`
                        : `${selectedArchivedTree.hours_until_wither ?? 0}h`}
                    </strong>
                  </div>
                </div>

                <button
                  className="forest-primary-button"
                  type="button"
                  onClick={() => handleWaterArchived(selectedArchivedTree.id)}
                  disabled={forest?.watering_cans < 1 || waterMutation.isPending || interactionLocked}
                >
                  <img src={wateringCanAsset} alt="" />
                  <span>{selectedArchivedTree.is_withered ? 'Rescue archived tree' : 'Water archived tree'}</span>
                </button>
              </>
            )}

            <button className="forest-secondary-button" type="button" onClick={() => setSelectedArchivedTree(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

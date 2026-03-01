/**
 * ForestWorld.jsx
 * ================
 * Standalone page at /forest showing the Tree + Campfire visualization.
 * Fetches task data from the API and reflects completed task count
 * in the tree's appearance and campfire intensity.
 *
 * This is a read-only visualization — no animation sequence.
 */
import { useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { taskApi } from '../../services/api';

import TreeZone from './TreeZone';
import CampfireZone from './CampfireZone';

import './GameWorld.css';

export default function ForestWorld() {
    const navigate = useNavigate();

    /* ===== Refs ===== */
    const treeRef = useRef(null);
    const logRef = useRef(null);
    const campfireRef = useRef(null);
    const statusRef = useRef(null);

    /* ===== Fetch task data ===== */
    const { data } = useQuery({
        queryKey: ['tasks', 'all'],
        queryFn: () => taskApi.list({ per_page: 100 }).then((r) => r.data),
    });

    const tasks = data?.data || [];

    /* ===== Derived state ===== */
    const completedCount = useMemo(
        () => tasks.filter((t) => t.status === 'completed').length,
        [tasks]
    );
    const totalTasks = tasks.length;
    const totalExp = useMemo(
        () => tasks.filter((t) => t.status === 'completed').reduce((sum, t) => sum + (t.exp_reward || 0), 0),
        [tasks]
    );

    // Campfire is "roaring" if there are recent completions
    const isRoaring = completedCount > 0;

    return (
        <div className="game-viewport">
            {/* Back button */}
            <button className="game-back-btn" onClick={() => navigate('/tasks')}>
                ← Back to Tasks
            </button>

            {/* Stats overlay */}
            <div className="forest-stats">
                <div className="forest-stats__item">
                    <span className="forest-stats__value">{completedCount}</span>
                    <span className="forest-stats__label">Completed</span>
                </div>
                <div className="forest-stats__item">
                    <span className="forest-stats__value">{totalTasks - completedCount}</span>
                    <span className="forest-stats__label">Remaining</span>
                </div>
                <div className="forest-stats__item">
                    <span className="forest-stats__value">{totalExp}</span>
                    <span className="forest-stats__label">Total EXP</span>
                </div>
            </div>

            {/* 200vw World Container: Tree + Campfire */}
            <div className="world-container world-container--two-zones world-container--forest">
                {/* Zone 1: Tree */}
                <TreeZone treeRef={treeRef} logRef={logRef} />

                {/* Zone 2: Campfire */}
                <CampfireZone
                    campfireRef={campfireRef}
                    isRoaring={isRoaring}
                    statusRef={statusRef}
                    expReward={totalExp}
                />
            </div>

            {/* Navigation hint */}
            <div className="forest-scroll-hint">
                Scroll to explore →
            </div>
        </div>
    );
}

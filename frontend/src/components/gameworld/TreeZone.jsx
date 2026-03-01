/**
 * TreeZone.jsx
 * Uses new_tree.png. Centered, no ground.
 * Log is no longer here — it's a fixed overlay in GameWorld.
 */
import { forwardRef, useMemo } from 'react';
import treeImg from '../../assets/gameworld/new_tree.png';

const TreeZone = forwardRef(function TreeZone({ treeRef }, ref) {
    const particles = useMemo(() => {
        return Array.from({ length: 12 }, (_, i) => ({
            id: i,
            left: `${15 + Math.random() * 70}%`,
            top: `${15 + Math.random() * 60}%`,
            delay: `${Math.random() * 8}s`,
            size: `${3 + Math.random() * 3}px`,
        }));
    }, []);

    return (
        <div ref={ref} className="zone zone--tree">
            <div className="tree-wrapper">
                {/* Subtle ambient particles */}
                <div className="tree-particles">
                    {particles.map((p) => (
                        <div
                            key={p.id}
                            className="tree-particle"
                            style={{
                                left: p.left,
                                top: p.top,
                                animationDelay: p.delay,
                                width: p.size,
                                height: p.size,
                            }}
                        />
                    ))}
                </div>

                {/* Tree — centered */}
                <img
                    ref={treeRef}
                    src={treeImg}
                    alt="Tree"
                    className="tree-image"
                    draggable={false}
                />
            </div>
        </div>
    );
});

export default TreeZone;

/**
 * GameWorld.jsx (Overlay Mode)
 * ==============================
 * Full-screen cutscene overlay triggered when completing a task.
 *
 * The log is now a FIXED-POSITION element (not inside TreeZone),
 * so it can freely fly from the tree to the campfire during the pan.
 * It uses scale-up-then-down keyframes to simulate a 3D arc throw.
 */
import { useRef, useState, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

import TreeZone from './TreeZone';
import CampfireZone from './CampfireZone';
import logImg from '../../assets/gameworld/log.png';

import './GameWorld.css';

export default function GameWorld({ task, cardElement, onFinish }) {
    /* ===== Refs ===== */
    const viewportRef = useRef(null);
    const worldRef = useRef(null);
    const floatingCardRef = useRef(null);
    const treeRef = useRef(null);
    const logRef = useRef(null);       // Now a fixed overlay element
    const campfireRef = useRef(null);
    const statusRef = useRef(null);
    const hasPlayed = useRef(false);

    /* ===== State ===== */
    const [isRoaring, setIsRoaring] = useState(false);

    /* ===== useGSAP — scoped context ===== */
    const { contextSafe } = useGSAP(
        () => {
            gsap.set(worldRef.current, { x: 0, opacity: 0 });
            gsap.set(floatingCardRef.current, { opacity: 0, scale: 1 });
            gsap.set(logRef.current, { opacity: 0 });
            if (statusRef.current) gsap.set(statusRef.current, { opacity: 0, y: 0 });
        },
        { scope: viewportRef }
    );

    /* ===== Master Animation ===== */
    const playSequence = contextSafe(() => {
        if (hasPlayed.current || !cardElement) return;
        hasPlayed.current = true;

        const cardRect = cardElement.getBoundingClientRect();
        const floatingEl = floatingCardRef.current;
        const logEl = logRef.current;
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        // Clone the card's look: copy className + innerHTML
        floatingEl.className = cardElement.className + ' floating-card';
        floatingEl.innerHTML = cardElement.innerHTML;

        // Position floating card exactly over the original
        gsap.set(floatingEl, {
            x: cardRect.left,
            y: cardRect.top,
            width: cardRect.width,
            height: cardRect.height,
            opacity: 1,
            scale: 1,
        });

        // Dim the original card
        gsap.to(cardElement, { opacity: 0.15, duration: 0.3 });

        // Log start position: at the tree (screen center), hidden
        gsap.set(logEl, {
            opacity: 0,
            x: vw / 2 - 50,
            y: vh / 2 - 120,
            scale: 1,
            rotation: 0,
        });

        /* ---------- Master Timeline ---------- */
        const tl = gsap.timeline({
            defaults: { ease: 'power3.inOut' },
            onComplete: () => {
                gsap.delayedCall(1.0, () => {
                    gsap.to(viewportRef.current, {
                        opacity: 0,
                        duration: 0.5,
                        ease: 'power2.out',
                        onComplete: () => {
                            gsap.set(cardElement, { opacity: 1 });
                            onFinish?.();
                        },
                    });
                });
            },
        });

        /* ---- Phase 1: Lift-Off ---- */
        tl.to(floatingEl, {
            scale: 1.08,
            y: vh * 0.35,
            x: vw / 2 - cardRect.width / 2,
            duration: 0.7,
            ease: 'power2.out',
        });

        tl.to({}, { duration: 0.3 });

        /* ---- Phase 2: Journey — Card flies to tree center ---- */
        tl.addLabel('journey');

        // Tree scene fades in
        tl.to(
            worldRef.current,
            { opacity: 1, duration: 0.5, ease: 'power2.out' },
            'journey'
        );

        // Card shrinks into tree center
        tl.to(
            floatingEl,
            {
                x: vw / 2 - 20,
                y: vh / 2 - 20,
                width: 40,
                height: 40,
                scale: 0,
                opacity: 0,
                borderRadius: '50%',
                duration: 0.8,
                ease: 'power3.in',
            },
            'journey+=0.15'
        );

        /* ---- Phase 3: Impact & Drop ---- */
        tl.addLabel('impact');

        // Tree shakes
        tl.to(
            treeRef.current,
            {
                keyframes: [
                    { x: -6, duration: 0.05 },
                    { x: 6, duration: 0.05 },
                    { x: -5, duration: 0.05 },
                    { x: 4, duration: 0.05 },
                    { x: -3, duration: 0.05 },
                    { x: 2, duration: 0.05 },
                    { x: 0, duration: 0.08 },
                ],
                ease: 'none',
            },
            'impact'
        );

        // Log appears above tree and drops down (fixed position, screen coords)
        gsap.set(logEl, { x: vw / 2 - 50, y: vh / 2 - 200 });
        tl.to(logEl, { opacity: 1, duration: 0.1 }, 'impact+=0.1');
        tl.to(
            logEl,
            {
                y: vh / 2 + 40,
                duration: 0.6,
                ease: 'bounce.out',
            },
            'impact+=0.15'
        );

        // Pause
        tl.to({}, { duration: 0.4 });

        /* ---- Phase 4: Throw log to fire ---- */
        tl.addLabel('fire');

        // Pan camera to campfire
        tl.to(
            worldRef.current,
            {
                x: () => -vw,
                duration: 1.2,
                ease: 'power3.inOut',
            },
            'fire'
        );

        // Log flies in a 3D arc: scales UP (coming toward viewer) then DOWN
        // Adjust scale values here to taste:
        //   First keyframe scale  = peak "close to you" size
        //   Second keyframe scale = size when landing in fire
        tl.to(
            logEl,
            {
                keyframes: [
                    // First half: lift up + scale up (coming at you)
                    {
                        x: vw / 2 - 40,
                        y: vh / 2 - 120,
                        scale: 2.2,
                        duration: 0.55,
                        ease: 'power2.out',
                    },
                    // Second half: arc down + scale down (going away into fire)
                    {
                        x: vw / 2 - 40,
                        y: vh / 2 - 20,
                        scale: 0.3,
                        duration: 0.55,
                        ease: 'power2.in',
                    },
                ],
            },
            'fire+=0.05'
        );

        // Log fades out right as it hits the fire, then ignite
        tl.to(logEl, { opacity: 0, duration: 0.15 }, 'fire+=1.05');
        tl.call(() => setIsRoaring(true), null, 'fire+=1.1');

        // Campfire pulse
        tl.fromTo(
            campfireRef.current,
            { scale: 1 },
            {
                scale: 1.08,
                duration: 0.35,
                ease: 'elastic.out(1, 0.5)',
                yoyo: true,
                repeat: 1,
            }
        );

        // EXP text
        tl.to(statusRef.current, {
            opacity: 1,
            y: -10,
            duration: 0.4,
            ease: 'back.out(1.2)',
        });
    });

    /* ===== Trigger on mount ===== */
    useEffect(() => {
        const timer = setTimeout(() => playSequence(), 80);
        return () => clearTimeout(timer);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    /* ===== Render ===== */
    return (
        <div ref={viewportRef} className="game-viewport game-viewport--overlay">
            {/* Floating card clone */}
            <div ref={floatingCardRef} className="floating-card" />

            {/* Log — FIXED overlay, not inside any zone */}
            <img
                ref={logRef}
                src={logImg}
                alt="Log"
                className="flying-log"
                draggable={false}
            />

            {/* 200vw World: Tree + Campfire */}
            <div ref={worldRef} className="world-container world-container--two-zones">
                <TreeZone treeRef={treeRef} />
                <CampfireZone
                    campfireRef={campfireRef}
                    isRoaring={isRoaring}
                    statusRef={statusRef}
                    expReward={task?.exp_reward}
                />
            </div>
        </div>
    );
}

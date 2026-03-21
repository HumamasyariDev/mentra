/**
 * GameWorld.jsx (Overlay Mode)
 * ==============================
 * Full-screen cutscene overlay triggered when completing a task.
 *
 * Simplified animation: task card flies directly into the streak fire.
 * Fire transitions: sad → happy (big burst) → normal (settled).
 * Like putting paper on a small fire — it flares up then settles.
 */
import { useRef, useState, useEffect, useMemo } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

import fireSad from '../../assets/streak_fire/streak_fire_state_sad.png';
import fireHappy from '../../assets/streak_fire/streak_fire_state_happy.png';
import fireNormal from '../../assets/streak_fire/streak_fire_state_normal.png';

import './GameWorld.css';

export default function GameWorld({ task, cardElement, onFinish }) {
    /* ===== Refs ===== */
    const viewportRef = useRef(null);
    const floatingCardRef = useRef(null);
    const fireRef = useRef(null);
    const statusRef = useRef(null);
    const hasPlayed = useRef(false);

    /* ===== State ===== */
    const [fireState, setFireState] = useState('sad'); // 'sad' | 'happy' | 'normal'

    const fireSrc = fireState === 'happy' ? fireHappy : fireState === 'normal' ? fireNormal : fireSad;

    /* ===== Embers ===== */
    const embers = useMemo(() => {
        return Array.from({ length: 14 }, (_, i) => ({
            id: i,
            left: `${38 + Math.random() * 24}%`,
            bottom: `${40 + Math.random() * 15}%`,
            delay: `${Math.random() * 2}s`,
            duration: `${1.8 + Math.random() * 1.2}s`,
        }));
    }, []);

    /* ===== useGSAP — scoped context ===== */
    const { contextSafe } = useGSAP(
        () => {
            gsap.set(floatingCardRef.current, { opacity: 0, scale: 1 });
            if (fireRef.current) gsap.set(fireRef.current, { scale: 0.7, opacity: 0 });
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
        const fireEl = fireRef.current;
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        // Clone the card's look
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

        /* ---------- Master Timeline ---------- */
        const tl = gsap.timeline({
            defaults: { ease: 'power3.inOut' },
            onComplete: () => {
                gsap.delayedCall(0.6, () => {
                    gsap.to(viewportRef.current, {
                        opacity: 0,
                        duration: 0.35,
                        ease: 'power2.out',
                        onComplete: () => {
                            gsap.set(cardElement, { opacity: 1 });
                            onFinish?.();
                        },
                    });
                });
            },
        });

        /* ---- Phase 1: Fire fades in (sad) + Card lifts simultaneously ---- */
        tl.to(fireEl, {
            opacity: 1,
            scale: 0.85,
            duration: 0.4,
            ease: 'power2.out',
        });

        tl.to(
            floatingEl,
            {
                scale: 1.06,
                y: vh * 0.32,
                x: vw / 2 - cardRect.width / 2,
                duration: 0.5,
                ease: 'power2.out',
            },
            '<0.15'
        );

        /* ---- Phase 2: Card swoops down into fire with visible shrink ---- */
        tl.to(
            floatingEl,
            {
                x: vw / 2 - cardRect.width * 0.2,
                y: vh / 2 - 30,
                scale: 0.4,
                width: cardRect.width * 0.4,
                rotation: -3,
                duration: 0.35,
                ease: 'power2.in',
            },
        );

        tl.to(
            floatingEl,
            {
                x: vw / 2 - 15,
                y: vh / 2 + 15,
                scale: 0,
                width: 30,
                height: 30,
                opacity: 0,
                borderRadius: '50%',
                rotation: 6,
                duration: 0.3,
                ease: 'power3.in',
            },
        );

        /* ---- Phase 3: Fire reacts — sad → happy (burst) ---- */
        tl.addLabel('ignite', '>-0.08');

        tl.call(() => setFireState('happy'), null, 'ignite');

        tl.to(
            fireEl,
            {
                scale: 1.3,
                duration: 0.3,
                ease: 'back.out(2)',
            },
            'ignite'
        );

        // Fire shakes
        tl.to(
            fireEl,
            {
                keyframes: [
                    { x: -3, duration: 0.03 },
                    { x: 4, duration: 0.03 },
                    { x: -2, duration: 0.03 },
                    { x: 3, duration: 0.03 },
                    { x: 0, duration: 0.04 },
                ],
                ease: 'none',
            },
            'ignite+=0.08'
        );

        // EXP text
        tl.to(
            statusRef.current,
            {
                opacity: 1,
                y: -15,
                duration: 0.35,
                ease: 'back.out(1.4)',
            },
            'ignite+=0.15'
        );

        /* ---- Phase 4: Fire settles — happy → normal ---- */
        tl.addLabel('settle', 'ignite+=0.6');

        tl.call(() => setFireState('normal'), null, 'settle');

        tl.to(
            fireEl,
            {
                scale: 1.0,
                duration: 0.4,
                ease: 'power2.inOut',
            },
            'settle'
        );
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

            {/* Fire zone — centered, single scene */}
            <div className="fire-zone">
                <div className="fire-wrapper">
                    {/* Fire sprite */}
                    <img
                        ref={fireRef}
                        src={fireSrc}
                        alt="Fire"
                        className={`fire-sprite fire-sprite--${fireState}`}
                        draggable={false}
                    />

                    {/* Status text */}
                    <p
                        ref={statusRef}
                        className={`fire-status fire-status--${fireState}`}
                    >
                        {fireState !== 'sad' && `+${task?.exp_reward || 0} EXP Earned!`}
                    </p>

                    {/* Ember particles when happy/normal */}
                    {fireState !== 'sad' && (
                        <div className="fire-embers">
                            {embers.map((e) => (
                                <div
                                    key={e.id}
                                    className="fire-ember"
                                    style={{
                                        left: e.left,
                                        bottom: e.bottom,
                                        animationDelay: e.delay,
                                        animationDuration: e.duration,
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

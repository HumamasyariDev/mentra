/**
 * CampfireZone.jsx
 * Uses dying_fire.png and roar_fire.png for the two states.
 * Centered, no ground, Duolingo-style.
 */
import { forwardRef, useMemo } from 'react';
import dyingFireImg from '../../assets/gameworld/dying_fire.png';
import roarFireImg from '../../assets/gameworld/roar_fire.png';

const CampfireZone = forwardRef(function CampfireZone(
    { campfireRef, isRoaring, statusRef, expReward },
    ref
) {
    const embers = useMemo(() => {
        return Array.from({ length: 12 }, (_, i) => ({
            id: i,
            left: `${42 + Math.random() * 16}%`,
            bottom: `${45 + Math.random() * 10}%`,
            delay: `${Math.random() * 2}s`,
            duration: `${2 + Math.random() * 1}s`,
        }));
    }, []);

    return (
        <div ref={ref} className="zone zone--campfire">
            <div className="campfire-wrapper">
                {/* Campfire image — swap between dying and roaring */}
                <img
                    ref={campfireRef}
                    src={isRoaring ? roarFireImg : dyingFireImg}
                    alt="Campfire"
                    className={`campfire-image campfire-image--${isRoaring ? 'roaring' : 'dying'}`}
                    draggable={false}
                />

                {/* Status text */}
                <p
                    ref={statusRef}
                    className={`campfire-status campfire-status--${isRoaring ? 'roaring' : 'dying'}`}
                >
                    {isRoaring
                        ? `🔥 +${expReward || 0} EXP Earned!`
                        : ''}
                </p>

                {/* Ember particles when roaring */}
                {isRoaring && (
                    <div className="campfire-embers">
                        {embers.map((e) => (
                            <div
                                key={e.id}
                                className="ember"
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
    );
});

export default CampfireZone;

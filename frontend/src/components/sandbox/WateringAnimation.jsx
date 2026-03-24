import { useEffect, useState } from 'react';
import '../../styles/components/WateringAnimation.css';

export default function WateringAnimation({ isGenerating = true, onComplete }) {
    const [phase, setPhase] = useState('watering'); // 'watering' or 'filling'

    useEffect(() => {
        if (!isGenerating && phase === 'watering') {
            // Transition to filling phase when generation completes
            const timer = setTimeout(() => {
                setPhase('filling');
                if (onComplete) {
                    setTimeout(onComplete, 2000); // Call after filling animation
                }
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isGenerating, phase, onComplete]);

    return (
        <div className="watering-animation-container">
            <div className={`watering-scene ${phase}`}>
                {/* Watering Can */}
                <div className="watering-can">
                    <div className="can-body"></div>
                    <div className="can-spout"></div>
                    <div className="can-handle"></div>
                    
                    {/* Water Drops - only show during watering phase */}
                    {phase === 'watering' && (
                        <div className="water-drops">
                            <span className="drop"></span>
                            <span className="drop"></span>
                            <span className="drop"></span>
                            <span className="drop"></span>
                        </div>
                    )}
                </div>

                {/* Plant Pot with Watering Can */}
                <div className="plant-container">
                    <div className="plant-pot">
                        <div className="pot-body"></div>
                        
                        {/* Water Level - fills during filling phase */}
                        <div className={`water-level ${phase === 'filling' ? 'filling' : ''}`}></div>
                        
                        {/* Plant Sprout - appears during filling */}
                        {phase === 'filling' && (
                            <div className="plant-sprout">
                                <div className="leaf left"></div>
                                <div className="stem"></div>
                                <div className="leaf right"></div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Status Text */}
            <div className="watering-status">
                {phase === 'watering' ? (
                    <>
                        <p className="status-text">Sedang menyiram ide...</p>
                        <div className="status-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </>
                ) : (
                    <>
                        <p className="status-text success">Ide berhasil tumbuh! 🌱</p>
                    </>
                )}
            </div>
        </div>
    );
}

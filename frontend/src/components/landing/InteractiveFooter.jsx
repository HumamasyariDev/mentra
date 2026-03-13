import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

export default function InteractiveFooter() {
  const containerRef = useRef(null);
  const [lastSpawnPos, setLastSpawnPos] = useState({ x: 0, y: 0 });

  const emojis = ['⭐', '✨', '🎨', '🚀', '💫', '🎯', '💎', '🔥'];

  const spawnSticker = (x, y) => {
    // Only spawn if mouse moved at least 20px from last spawn
    const distance = Math.sqrt(
      Math.pow(x - lastSpawnPos.x, 2) + Math.pow(y - lastSpawnPos.y, 2)
    );
    
    if (distance < 20) return;

    setLastSpawnPos({ x, y });

    // Create new element
    const sticker = document.createElement('div');
    sticker.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    sticker.style.position = 'fixed';
    sticker.style.left = `${x}px`;
    sticker.style.top = `${y}px`;
    sticker.style.fontSize = '2rem';
    sticker.style.pointerEvents = 'none';
    sticker.style.zIndex = '100';
    sticker.style.userSelect = 'none';

    containerRef.current.appendChild(sticker);

    // Animate with GSAP
    gsap.fromTo(
      sticker,
      {
        scale: 0,
        opacity: 1,
      },
      {
        scale: 1,
        y: '-=50',
        rotation: gsap.utils.random(-45, 45),
        opacity: 0,
        duration: gsap.utils.random(1, 2),
        ease: 'power2.out',
        onComplete: () => {
          sticker.remove();
        },
      }
    );
  };

  const handleMouseMove = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    spawnSticker(e.clientX, e.clientY);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="min-h-[70vh] flex flex-col items-center justify-center relative overflow-hidden bg-[#FAF8F5] pb-10"
    >
      {/* Main Content */}
      <div className="text-center z-10 px-6 max-w-5xl mx-auto">
        <h1 className="text-7xl md:text-9xl font-black text-[#0A142F] leading-none mb-6">
          Transform Yourself
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Join thousands of developers who've mastered GSAP and transformed their careers. 
          Start creating animations that get you noticed, hired, and remembered.
        </p>

        <button className="bg-[#3ED79A] text-black font-bold py-4 px-8 rounded-full text-lg hover:bg-[#2fc589] transition-colors shadow-2xl z-10 relative">
          Start Animating with GSAP
        </button>

        <p className="text-sm text-gray-500 mt-8">
          Move your mouse around to see the magic ✨
        </p>
      </div>

      {/* Bottom Bar */}
      <div className="absolute bottom-0 left-0 right-0 py-6 text-center text-sm text-gray-500 border-t border-gray-200 bg-[#FAF8F5] z-10">
        Copyright © 2026 JS Mastery Pro | Terms & Conditions | Privacy Policy
      </div>
    </div>
  );
}

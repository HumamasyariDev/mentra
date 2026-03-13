import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

export default function TopicMarquees() {
  const containerRef = useRef(null);

  useGSAP(() => {
    // Top band - Right to Left
    const topBandWidth = document.querySelector('.marquee-band-1').scrollWidth / 2;
    gsap.to('.marquee-band-1', {
      x: -topBandWidth,
      duration: 20,
      ease: 'none',
      repeat: -1,
    });

    // Middle band - Left to Right
    const middleBandWidth = document.querySelector('.marquee-band-2').scrollWidth / 2;
    gsap.fromTo('.marquee-band-2', 
      { x: -middleBandWidth },
      {
        x: 0,
        duration: 25,
        ease: 'none',
        repeat: -1,
      }
    );

    // Bottom band - Right to Left
    const bottomBandWidth = document.querySelector('.marquee-band-3').scrollWidth / 2;
    gsap.to('.marquee-band-3', {
      x: -bottomBandWidth,
      duration: 22,
      ease: 'none',
      repeat: -1,
    });
  }, { scope: containerRef });

  const createRepeatedText = (text, count = 10) => {
    return Array(count).fill(text).join(' • ');
  };

  return (
    <div ref={containerRef} className="w-full overflow-hidden py-10 bg-[#FAF8F5]">
      <div className="-rotate-3 scale-110">
        {/* Top Band - Purple */}
        <div className="overflow-hidden border-y-4 border-black">
          <div className="marquee-band-1 flex whitespace-nowrap will-change-transform">
            <div className="bg-[#DDB2FF] text-6xl md:text-8xl font-black uppercase py-4 text-[#0A142F] px-4">
              {createRepeatedText('SCROLL ANIMATION')}
            </div>
            <div className="bg-[#DDB2FF] text-6xl md:text-8xl font-black uppercase py-4 text-[#0A142F] px-4">
              {createRepeatedText('SCROLL ANIMATION')}
            </div>
          </div>
        </div>

        {/* Middle Band - Cyan */}
        <div className="overflow-hidden border-y-4 border-black mt-2">
          <div className="marquee-band-2 flex whitespace-nowrap will-change-transform">
            <div className="bg-[#98E5E0] text-6xl md:text-8xl font-black uppercase py-4 text-[#0A142F] px-4">
              {createRepeatedText('TEXT ANIMATION')}
            </div>
            <div className="bg-[#98E5E0] text-6xl md:text-8xl font-black uppercase py-4 text-[#0A142F] px-4">
              {createRepeatedText('TEXT ANIMATION')}
            </div>
          </div>
        </div>

        {/* Bottom Band - Coral */}
        <div className="overflow-hidden border-y-4 border-black mt-2">
          <div className="marquee-band-3 flex whitespace-nowrap will-change-transform">
            <div className="bg-[#FF674A] text-6xl md:text-8xl font-black uppercase py-4 text-[#0A142F] px-4">
              {createRepeatedText('SVG ANIMATION')}
            </div>
            <div className="bg-[#FF674A] text-6xl md:text-8xl font-black uppercase py-4 text-[#0A142F] px-4">
              {createRepeatedText('SVG ANIMATION')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

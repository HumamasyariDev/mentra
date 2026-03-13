import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function ValueBento() {
  const containerRef = useRef(null);

  useGSAP(() => {
    gsap.from('.bento-card', {
      y: 50,
      opacity: 0,
      duration: 0.8,
      stagger: 0.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 80%',
      }
    });

    gsap.from('.bento-center-text', {
      y: 50,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 80%',
      }
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="bg-[#FAF8F5] py-32">
      <div className="max-w-6xl mx-auto px-6">
        {/* Bento Grid */}
        <div className="flex flex-col md:flex-row gap-6 items-stretch">
          {/* Left Card - Green */}
          <div className="bento-card bg-[#488B72] text-white p-8 rounded-3xl w-full md:w-[30%] flex items-center justify-center text-center">
            <p className="text-xl font-bold leading-snug">
              Build animation portfolios that impress even the world-class brands
            </p>
          </div>

          {/* Center Section */}
          <div className="w-full md:w-[40%] flex flex-col items-center justify-center text-center relative">
            {/* Yellow Badge */}
            <div className="bento-center-text bg-[#FFD037] text-black text-sm font-bold px-4 py-1 rounded-full mb-4">
              Your Advantage
            </div>

            {/* Center Text */}
            <h3 className="bento-center-text text-3xl font-extrabold text-[#0A142F] mb-6">
              What This Means For YOU:
            </h3>

            {/* Bottom Center Card - Red/Orange */}
            <div className="bento-card bg-[#F14A51] text-white p-6 rounded-3xl text-center w-full max-w-xs">
              <p className="text-lg font-bold">
                Turn creative motion into job offers and freelance gigs
              </p>
            </div>
          </div>

          {/* Right Card - Purple */}
          <div className="bento-card bg-[#8E3468] text-white p-8 rounded-3xl w-full md:w-[30%] flex items-center justify-center text-center">
            <p className="text-xl font-bold leading-snug">
              Get noticed by creative agencies, design startups, and innovative teams
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

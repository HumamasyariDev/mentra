import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

export default function SkillImpact() {
  const containerRef = useRef(null);

  useGSAP(() => {
    // Animate each badge with different durations for variety
    gsap.to('.floating-badge-1', {
      y: -15,
      duration: 2,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
    });

    gsap.to('.floating-badge-2', {
      y: -15,
      duration: 2.5,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
    });

    gsap.to('.floating-badge-3', {
      y: -15,
      duration: 1.8,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
    });

    gsap.to('.floating-badge-4', {
      y: -15,
      duration: 2.3,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="max-w-6xl mx-auto px-6 py-24 text-center relative bg-[#FAF8F5]">
      {/* Floating Badges */}
      <div className="floating-badge-1 absolute top-12 left-8 md:left-24 bg-[#24D38F] text-white px-4 py-2 rounded-full font-bold text-sm rotate-[-10deg] shadow-lg">
        EMPLOYABLE
      </div>
      
      <div className="floating-badge-2 absolute top-16 right-8 md:right-24 bg-[#1E8DF0] text-white px-4 py-2 rounded-full font-bold text-sm rotate-[12deg] shadow-lg">
        RECOGNIZABLE
      </div>
      
      <div className="floating-badge-3 absolute bottom-20 left-12 md:left-32 bg-[#8E3468] text-white px-4 py-2 rounded-full font-bold text-sm rotate-[8deg] shadow-lg">
        VALUE
      </div>
      
      <div className="floating-badge-4 absolute bottom-24 right-12 md:right-32 bg-[#3ED79A] text-white px-4 py-2 rounded-full font-bold text-sm rotate-[-15deg] shadow-lg">
        MEMORABLE
      </div>

      {/* Main Heading */}
      <h2 className="text-5xl md:text-[5.5rem] font-extrabold leading-[1.1] tracking-tight text-[#0A142F] max-w-5xl mx-auto">
        The Animation skill that gets you Paid{' '}
        <span className="inline-block">⚡</span>, Hired{' '}
        <span className="inline-block">😊</span>, and Remembered{' '}
        <span className="inline-block">❤️</span>
      </h2>

      {/* Subtext */}
      <p className="mt-8 text-lg text-gray-600 max-w-2xl mx-auto">
        The best devs don't just build features, they create emotion. They build experiences 
        people feel in their chest. That's what separates portfolio projects from career-launching work.
      </p>
    </div>
  );
}

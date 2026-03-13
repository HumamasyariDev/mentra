import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

export default function Hero() {
  const containerRef = useRef(null);

  useGSAP(() => {
    const tl = gsap.timeline();
    
    tl.from('.hero-logo', {
      y: -50,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out'
    })
    .from('.hero-heading', {
      y: 50,
      opacity: 0,
      duration: 1,
      ease: 'power3.out'
    }, '-=0.4')
    .from('.hero-subheading', {
      y: 50,
      opacity: 0,
      duration: 1,
      ease: 'power3.out'
    }, '-=0.6')
    .from('.hero-button', {
      y: 50,
      opacity: 0,
      duration: 1,
      stagger: 0.2,
      ease: 'power3.out'
    }, '-=0.6');
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center px-6 py-20">
      {/* Logo */}
      <div className="hero-logo mb-16">
        <h2 className="text-2xl md:text-3xl font-bold text-[#0A142F]">
          <span className="text-[#108B50]">{'{'}</span>
          JS
          <span className="text-[#108B50]">{'}'}</span>
          {' '}MASTERY
        </h2>
      </div>

      {/* Main Heading */}
      <h1 className="hero-heading text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] text-center max-w-5xl">
        <span className="text-[#0A142F]">The Ultimate Animations Course: </span>
        <span className="text-[#108B50]">From Basic Motion To Awwwards Featured</span>
      </h1>

      {/* Subheading */}
      <p className="hero-subheading max-w-3xl mx-auto mt-6 text-[#4A5568] text-lg text-center">
        Master the art of web animations with GSAP. Learn to create stunning, award-winning animations 
        that will make your portfolio stand out and land you your dream job.
      </p>

      {/* Buttons */}
      <div className="flex flex-wrap gap-4 mt-10">
        <button className="hero-button px-8 py-4 bg-[#24D38F] text-white font-semibold rounded-full text-lg hover:bg-[#1fb87a] transition-colors">
          Enroll Now
        </button>
        <button className="hero-button px-8 py-4 bg-white text-[#0A142F] font-semibold rounded-full text-lg border-2 border-[#E2E8F0] hover:border-[#108B50] transition-colors">
          View Curriculum
        </button>
      </div>
    </div>
  );
}

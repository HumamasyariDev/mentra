import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Play } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function CourseShowcase() {
  const containerRef = useRef(null);

  useGSAP(() => {
    // Main mockup scale animation
    gsap.fromTo(
      '.main-mockup',
      { scale: 0.9 },
      {
        scale: 1,
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        }
      }
    );

    // Parallax elements - different Y movements for depth
    gsap.to('.parallax-1', {
      y: -100,
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
      }
    });

    gsap.to('.parallax-2', {
      y: 50,
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
      }
    });

    gsap.to('.parallax-3', {
      y: -200,
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
      }
    });

    gsap.to('.parallax-4', {
      y: 80,
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
      }
    });

    gsap.to('.parallax-5', {
      y: -150,
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
      }
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="max-w-[1400px] mx-auto px-6 py-32 relative flex justify-center items-center h-[800px] overflow-hidden bg-[#FAF8F5]">
      {/* Floating Elements - Behind */}
      <div className="parallax-1 absolute top-24 left-12 md:left-32 bg-[#24D38F] px-8 py-4 rounded-full font-black text-4xl md:text-6xl text-white shadow-2xl z-10 transform-gpu">
        FULL
      </div>

      <div className="parallax-3 absolute top-32 left-1/3 bg-[#FC3DFF] w-24 h-24 rounded-full z-10 transform-gpu"></div>

      <div className="parallax-5 absolute bottom-32 left-1/4 bg-[#3ED79A] w-32 h-32 rounded-2xl rotate-45 z-10 transform-gpu"></div>

      {/* Main Center Mockup */}
      <div className="main-mockup bg-[#1A1A1A] w-[90%] md:w-[70%] h-[500px] rounded-[2.5rem] border border-gray-700 shadow-2xl z-20 flex justify-center items-center transform-gpu">
        <button className="bg-white w-20 h-20 rounded-full flex items-center justify-center hover:scale-110 transition-transform">
          <Play className="w-10 h-10 text-black ml-1" fill="currentColor" />
        </button>
      </div>

      {/* Floating Elements - Front */}
      <div className="parallax-2 absolute top-16 left-1/2 -translate-x-1/2 bg-white px-12 py-6 rounded-full font-black text-5xl md:text-7xl text-[#0A142F] shadow-2xl z-30 transform-gpu">
        GSAP
      </div>

      <div className="parallax-4 absolute top-1/2 right-12 md:right-32 bg-[#FF674A] px-8 py-4 rounded-full font-black text-3xl md:text-5xl text-white shadow-2xl z-30 transform-gpu">
        ANIMATION
      </div>

      <div className="parallax-1 absolute bottom-20 left-1/2 -translate-x-1/2 bg-white px-10 py-5 rounded-full font-black text-4xl md:text-6xl text-[#0A142F] shadow-2xl z-30 transform-gpu">
        COURSE
      </div>

      {/* Abstract shapes */}
      <div className="parallax-3 absolute top-1/3 right-1/4 transform-gpu z-10">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 bg-[#FC3DFF] w-4 h-16 left-6"></div>
          <div className="absolute inset-0 bg-[#FC3DFF] w-16 h-4 top-6"></div>
        </div>
      </div>

      <div className="parallax-5 absolute bottom-1/4 right-12 bg-[#1E8DF0] w-20 h-20 rounded-full z-10 transform-gpu"></div>
    </div>
  );
}

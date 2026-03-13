import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

export default function CapabilitiesList() {
  const containerRef = useRef(null);
  const floatingImageRef = useRef(null);
  const [activeColor, setActiveColor] = useState('#1E8DF0');

  let quickToX, quickToY;

  useGSAP(() => {
    // Setup quickTo for smooth mouse following
    quickToX = gsap.quickTo(floatingImageRef.current, 'x', {
      duration: 0.6,
      ease: 'power3.out',
    });
    quickToY = gsap.quickTo(floatingImageRef.current, 'y', {
      duration: 0.6,
      ease: 'power3.out',
    });
  }, { scope: containerRef });

  const handleMouseEnter = (color) => {
    setActiveColor(color);
    gsap.to(floatingImageRef.current, {
      opacity: 1,
      scale: 1,
      duration: 0.3,
    });
  };

  const handleMouseMove = (e) => {
    if (quickToX && quickToY) {
      quickToX(e.clientX);
      quickToY(e.clientY);
    }
  };

  const handleMouseLeave = () => {
    gsap.to(floatingImageRef.current, {
      opacity: 0,
      scale: 0.8,
      duration: 0.3,
    });
  };

  const capabilities = [
    {
      title: 'BUILD SCROLL ANIMATIONS THAT MAKE PAGES FEEL ALIVE',
      badges: ['ScrollTrigger', 'GSAP Core', 'Pinning'],
      color: '#1E8DF0',
    },
    {
      title: 'CREATE TEXT REVEALS THAT CAPTURE ATTENTION',
      badges: ['SplitText', 'Stagger', 'Timeline'],
      color: '#FC3DFF',
    },
    {
      title: 'MASTER SVG MORPHING AND PATH ANIMATIONS',
      badges: ['MorphSVG', 'DrawSVG', 'MotionPath'],
      color: '#3ED79A',
    },
    {
      title: 'DESIGN SMOOTH PAGE TRANSITIONS',
      badges: ['Flip', 'Timeline', 'CustomEase'],
      color: '#FF674A',
    },
  ];

  return (
    <div ref={containerRef} className="max-w-5xl mx-auto px-6 py-32 bg-[#FAF8F5] relative">
      {/* Heading */}
      <h2 className="text-4xl md:text-5xl font-extrabold text-[#0A142F] text-center mb-16">
        What You'll Actually Be Able To Do
      </h2>

      {/* List Items */}
      <div className="space-y-8">
        {capabilities.map((item, index) => (
          <div
            key={index}
            className="border-b-2 border-gray-200 pb-8 cursor-pointer"
            onMouseEnter={() => handleMouseEnter(item.color)}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <h3 className="text-2xl md:text-4xl font-bold text-[#0A142F] mb-4 leading-tight">
              {item.title}
            </h3>
            <div className="flex flex-wrap gap-2">
              {item.badges.map((badge, badgeIndex) => (
                <span
                  key={badgeIndex}
                  className="bg-white border-2 border-gray-800 px-4 py-1.5 rounded-full text-sm font-bold text-[#0A142F]"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Floating Image Container */}
      <div
        ref={floatingImageRef}
        className="fixed pointer-events-none z-50 opacity-0 -translate-x-1/2 -translate-y-1/2"
        style={{ top: 0, left: 0 }}
      >
        <div
          className="w-32 h-32 rounded-2xl shadow-2xl transition-colors duration-300"
          style={{ backgroundColor: activeColor }}
        ></div>
      </div>
    </div>
  );
}

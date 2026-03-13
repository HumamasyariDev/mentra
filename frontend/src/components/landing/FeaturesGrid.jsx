import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function FeaturesGrid() {
  const containerRef = useRef(null);
  const gridRef = useRef(null);

  useGSAP(() => {
    gsap.from('.feature-card', {
      y: 150,
      opacity: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: 'back.out(1.7)',
      scrollTrigger: {
        trigger: gridRef.current,
        start: 'top 80%',
      }
    });
  }, { scope: containerRef });

  const features = [
    {
      color: 'bg-[#1E8DF0]',
      tag: 'Foundation',
      title: 'Scroll Animations',
      description: 'Master ScrollTrigger to create stunning scroll-based animations that engage users and enhance storytelling.'
    },
    {
      color: 'bg-[#FC3DFF]',
      tag: 'Advanced',
      title: 'Complex Timelines',
      description: 'Learn to orchestrate multiple animations with precise timing using GSAP timelines for cinematic effects.'
    },
    {
      color: 'bg-[#3ED79A]',
      tag: 'Pro Level',
      title: 'SVG Morphing',
      description: 'Animate SVG paths and shapes to create smooth morphing effects that bring your designs to life.'
    },
    {
      color: 'bg-[#FF674A]',
      tag: 'Portfolio',
      title: 'Award-Winning Projects',
      description: 'Build real-world projects featured on Awwwards and land your dream job with an impressive portfolio.',
      badge: true
    }
  ];

  return (
    <div ref={containerRef} className="bg-[#FAF8F5] py-32">
      <div className="max-w-[1400px] mx-auto px-6">
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`feature-card ${feature.color} rounded-t-[2.5rem] rounded-b-xl p-8 flex flex-col items-center text-center text-white min-h-[400px] relative`}
            >
              {/* Badge for last card */}
              {feature.badge && (
                <div className="absolute -right-6 -top-6 z-10 bg-[#24D38F] text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg rotate-12">
                  ⭐ What You'll Build
                </div>
              )}

              {/* Tag */}
              <span className="bg-white bg-opacity-20 px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
                {feature.tag}
              </span>

              {/* Title */}
              <h3 className="text-2xl md:text-3xl font-bold mb-4 leading-tight">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-white text-opacity-90 leading-relaxed flex-grow">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';

export default function RoadmapAccordion() {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const roadmapItems = [
    {
      title: '01. WELCOME TO THE ULTIMATE GSAP COURSE',
      content: 'Get oriented with the course structure, meet your instructor, and set up your development environment. Learn what makes GSAP the industry standard for web animation.',
    },
    {
      title: '02. GSAP FUNDAMENTALS & CORE CONCEPTS',
      content: 'Master the building blocks: tweens, timelines, easing functions, and the GSAP syntax. Build your first animations and understand the GSAP animation lifecycle.',
    },
    {
      title: '03. SCROLLTRIGGER MASTERY',
      content: 'Learn to create scroll-driven animations that respond to user behavior. Master pinning, scrubbing, and advanced scroll techniques used on award-winning sites.',
    },
    {
      title: '04. TEXT & SVG ANIMATIONS',
      content: 'Animate text reveals, morphing shapes, and complex SVG paths. Learn the techniques behind those "wow" animations you see on premium websites.',
    },
    {
      title: '05. ADVANCED TECHNIQUES & PERFORMANCE',
      content: 'Optimize animations for 60fps, work with 3D transforms, create physics-based motion, and build custom plugins. Graduate as a true animation expert.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-32 bg-[#FAF8F5]">
      {/* Heading */}
      <h2 className="text-5xl font-extrabold text-center text-[#0A142F]">
        Your Learning Roadmap
      </h2>

      {/* Subtext */}
      <p className="text-center mt-4 mb-16 text-gray-600 text-lg max-w-2xl mx-auto">
        This isn't a list of tutorials. It's a progressive animation system designed to take you 
        from GSAP beginner to animation expert, step by step.
      </p>

      {/* Accordion Items */}
      <div className="space-y-0">
        {roadmapItems.map((item, index) => (
          <div key={index} className="border-b border-gray-300">
            {/* Header */}
            <button
              onClick={() => toggleAccordion(index)}
              className="w-full py-6 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors px-4"
            >
              <span className="text-xl font-bold uppercase text-[#0A142F] text-left">
                {item.title}
              </span>
              <span
                className={`text-4xl font-light transition-transform duration-300 ${
                  activeIndex === index ? 'rotate-45' : ''
                }`}
              >
                +
              </span>
            </button>

            {/* Content */}
            <div
              className={`overflow-hidden transition-all duration-300 ${
                activeIndex === index ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="px-4 pb-6 text-gray-600 text-lg">
                {item.content}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

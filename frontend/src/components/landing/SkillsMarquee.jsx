import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

export default function SkillsMarquee() {
  const containerRef = useRef(null);

  useGSAP(() => {
    const trackWidth = document.querySelector('.skills-track').scrollWidth / 2;
    gsap.to('.skills-track', {
      x: -trackWidth,
      duration: 30,
      ease: 'none',
      repeat: -1,
    });
  }, { scope: containerRef });

  const skills = [
    { name: 'Parallax', color: 'bg-[#FFE5B4]' },
    { name: 'Performance', color: 'bg-[#D4F4DD]' },
    { name: 'Physics-based Motion', color: 'bg-[#E5D4FF]' },
    { name: 'UX Polish', color: 'bg-[#FFD4D4]' },
    { name: 'Advanced ScrollTrigger', color: 'bg-[#D4E5FF]' },
    { name: 'Custom Easing', color: 'bg-[#FFE4F5]' },
    { name: 'Timeline Mastery', color: 'bg-[#FFFAD4]' },
    { name: 'SVG Wizardry', color: 'bg-[#D4FFE5]' },
  ];

  return (
    <div ref={containerRef} className="overflow-hidden py-8 bg-[#FAF8F5]">
      <div className="skills-track flex whitespace-nowrap will-change-transform">
        {/* First set */}
        {skills.map((skill, index) => (
          <span
            key={`first-${index}`}
            className={`${skill.color} rounded-full px-4 py-1 text-sm font-bold mx-2 text-[#0A142F]`}
          >
            {skill.name}
          </span>
        ))}
        {/* Duplicate set for seamless loop */}
        {skills.map((skill, index) => (
          <span
            key={`second-${index}`}
            className={`${skill.color} rounded-full px-4 py-1 text-sm font-bold mx-2 text-[#0A142F]`}
          >
            {skill.name}
          </span>
        ))}
      </div>
    </div>
  );
}

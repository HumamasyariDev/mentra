import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function ScrollTextReveal() {
  const containerRef = useRef(null);

  const text = "Here's the thing: great animations don't just look cool. They're what make people stop scrolling, feel something, and actually remember your website. The problem? Most animation tutorials skip the 'why' and jump straight to code that doesn't work. You're left copying and pasting, hoping something sticks. This course is different. We teach you the story behind every animation, the 'why it works' so you can build Awwwards-level effects with confidence, using GSAP.";

  const words = text.split(' ');

  useGSAP(() => {
    gsap.fromTo(
      '.reveal-word',
      { opacity: 0.2 },
      {
        opacity: 1,
        stagger: 0.05,
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 60%',
          end: 'bottom 40%',
          scrub: 1,
        }
      }
    );
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="max-w-4xl mx-auto px-6 py-32 bg-[#FAF8F5]">
      <p className="text-3xl md:text-5xl font-medium leading-snug text-[#0A142F]">
        {words.map((word, index) => {
          let displayWord = word;
          let highlightClass = '';

          // Check for highlight words
          if (word.includes('problem?')) {
            highlightClass = 'bg-[#F14A51] text-white px-2 rounded-md';
          } else if (word.includes('different.')) {
            highlightClass = 'bg-[#108B50] text-white px-2 rounded-md';
          }

          return (
            <span
              key={index}
              className={`reveal-word inline-block transform-gpu ${highlightClass}`}
              style={{ display: 'inline-block', marginRight: '0.3em' }}
            >
              {displayWord}
            </span>
          );
        })}
      </p>
    </div>
  );
}

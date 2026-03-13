import { useRef, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

export default function CompanyMarquee() {
  const marqueeRef = useRef(null);
  const trackRef = useRef(null);

  useGSAP(() => {
    const track = trackRef.current;
    if (!track) return;

    const trackWidth = track.scrollWidth / 2;

    gsap.to(track, {
      x: -trackWidth,
      duration: 30,
      ease: 'none',
      repeat: -1,
    });
  }, { scope: marqueeRef });

  const companies = [
    'Google',
    'Apple', 
    'Sony',
    'Stripe',
    'Airbnb',
    'Netflix',
    'Microsoft',
    'Adobe'
  ];

  return (
    <div ref={marqueeRef} className="py-24 px-6 relative overflow-hidden bg-[#FAF8F5]">
      {/* Heading */}
      <div className="relative max-w-4xl mx-auto mb-16">
        <h2 className="text-4xl md:text-6xl font-extrabold text-[#0A142F] text-center leading-tight">
          Over 70% of top design driven companies use GSAP in <span className="relative inline-block">production
            <span className="bg-[#1E8DF0] text-white text-xs font-bold px-3 py-1 rounded-full absolute -top-4 -right-8 rotate-12 whitespace-nowrap">
              Why GSAP
            </span>
          </span>
        </h2>
        <p className="text-[#4A5568] text-lg text-center mt-6">
          Now, you'll have the certified skills to work with them or build your own studio-quality experiences.
        </p>
      </div>

      {/* Marquee */}
      <div className="relative">
        <div 
          ref={trackRef}
          className="flex items-center will-change-transform"
        >
          {/* First set of logos */}
          {companies.map((company, index) => (
            <div
              key={`first-${index}`}
              className="bg-white shadow-md rounded-2xl w-24 h-24 flex items-center justify-center flex-shrink-0 mx-4"
            >
              <span className="text-[#0A142F] font-bold text-sm">{company}</span>
            </div>
          ))}
          {/* Duplicate set for seamless loop */}
          {companies.map((company, index) => (
            <div
              key={`second-${index}`}
              className="bg-white shadow-md rounded-2xl w-24 h-24 flex items-center justify-center flex-shrink-0 mx-4"
            >
              <span className="text-[#0A142F] font-bold text-sm">{company}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

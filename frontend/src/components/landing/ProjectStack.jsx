import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function ProjectStack() {
  const containerRef = useRef(null);

  useGSAP(() => {
    const cards = gsap.utils.toArray('.stack-card');

    cards.forEach((card, index) => {
      if (index < cards.length - 1) {
        // Scale down and dim the previous card when next card covers it
        gsap.to(card, {
          scale: 0.95,
          opacity: 0.5,
          scrollTrigger: {
            trigger: card,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          }
        });
      }

      // Animate content inside each card
      gsap.from(card.querySelectorAll('.card-content'), {
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        scrollTrigger: {
          trigger: card,
          start: 'top center',
          end: 'center center',
          toggleActions: 'play none none reverse',
        }
      });
    });
  }, { scope: containerRef });

  const projects = [
    {
      number: '01',
      pill: 'Emotional Design',
      title: 'Build Animations Businesses Pay For',
      benefits: [
        'Master scroll-driven storytelling',
        'Create magnetic user experiences',
        'Animations that convert browsers to buyers'
      ],
      bgColor: 'bg-white',
      textColor: 'text-[#0A142F]',
      top: 'top-20',
    },
    {
      number: '02',
      pill: 'Capstone Project',
      title: 'Build the GTA VI Landing Page',
      benefits: [
        'Award-winning interactive experience',
        'Complex timeline orchestration',
        'Portfolio piece that gets interviews'
      ],
      bgColor: 'bg-[#FA72FF]',
      textColor: 'text-[#0A142F]',
      top: 'top-24',
    },
    {
      number: '03',
      pill: 'Animation Projects',
      title: 'Real Projects, Real Animations',
      benefits: [
        '5+ production-ready animations',
        'Learn by building actual products',
        'Code you can use in client work'
      ],
      bgColor: 'bg-[#3ED79A]',
      textColor: 'text-[#0A142F]',
      top: 'top-28',
    },
    {
      number: '04',
      pill: 'Custom Components',
      title: 'Learn by Doing. Experiment in Real Time.',
      benefits: [
        'Interactive code playground',
        'Instant visual feedback',
        'Build muscle memory through practice'
      ],
      bgColor: 'bg-[#1E8DF0]',
      textColor: 'text-white',
      top: 'top-32',
    },
  ];

  return (
    <div ref={containerRef} className="relative w-full max-w-7xl mx-auto px-6 pb-32 bg-[#FAF8F5]">
      {projects.map((project, index) => (
        <div
          key={index}
          className={`stack-card sticky ${project.top} ${project.bgColor} ${project.textColor} min-h-[80vh] rounded-[3rem] p-10 md:p-16 flex flex-col md:flex-row gap-10 shadow-2xl mb-10 border-2 border-black transform-gpu`}
        >
          {/* Left Content */}
          <div className="flex-1 flex flex-col justify-center">
            <span className="card-content bg-black bg-opacity-10 px-4 py-1.5 rounded-full text-sm font-bold inline-block w-fit mb-6">
              {project.pill}
            </span>
            
            <h2 className="card-content text-4xl md:text-6xl font-extrabold leading-tight mb-8">
              {project.title}
            </h2>

            <ul className="space-y-4">
              {project.benefits.map((benefit, benefitIndex) => (
                <li key={benefitIndex} className="card-content text-lg md:text-xl font-medium flex items-start">
                  <span className="mr-3 text-2xl">→</span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          {/* Right Content - Image Placeholder */}
          <div className="card-content flex-1 bg-black bg-opacity-10 rounded-2xl flex items-center justify-center min-h-[300px]">
            <span className="text-6xl opacity-50">🎨</span>
          </div>

          {/* Huge Number */}
          <div className="absolute top-8 right-8 md:top-12 md:right-12 text-[8rem] md:text-[12rem] font-black opacity-10 leading-none">
            {project.number}
          </div>
        </div>
      ))}
    </div>
  );
}

import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { User, Plus, Minus } from 'lucide-react';

export default function WhyChooseUs() {
  const containerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(null);

  const accordionItems = [
    {
      avatar: '👨‍💻',
      title: 'Learn animation from the ground up',
      content: 'No prior GSAP knowledge? No problem. We start with the fundamentals and build up to advanced techniques, ensuring you understand every concept deeply.',
      bubbleColor: 'bg-[#E5D4FF]',
    },
    {
      avatar: '🎯',
      title: 'Build a portfolio that gets you hired',
      content: 'Create 5+ production-ready projects that demonstrate your mastery. These aren\'t toy examples - they\'re real animations you can show to employers.',
      bubbleColor: 'bg-[#FFE5B4]',
    },
    {
      avatar: '⚡',
      title: 'Master the tools pros actually use',
      content: 'GSAP powers animations on Apple, Nike, and thousands of award-winning sites. Learn the same techniques used by the industry\'s best.',
      bubbleColor: 'bg-[#D4F4DD]',
    },
    {
      avatar: '🚀',
      title: 'Get lifetime access and updates',
      content: 'One payment, lifetime access. As GSAP evolves and we add new content, you get it all. Plus join our community of developers.',
      bubbleColor: 'bg-[#FFE0E0]',
    },
  ];

  const toggleAccordion = (index) => {
    const contentRef = containerRef.current.querySelector(`#content-${index}`);
    
    if (activeIndex === index) {
      // Close
      gsap.to(contentRef, {
        height: 0,
        opacity: 0,
        duration: 0.4,
        ease: 'power2.inOut',
      });
      setActiveIndex(null);
    } else {
      // Close previous
      if (activeIndex !== null) {
        const prevContentRef = containerRef.current.querySelector(`#content-${activeIndex}`);
        gsap.to(prevContentRef, {
          height: 0,
          opacity: 0,
          duration: 0.4,
          ease: 'power2.inOut',
        });
      }
      
      // Open new
      gsap.set(contentRef, { height: 'auto' });
      gsap.from(contentRef, {
        height: 0,
        opacity: 0,
        duration: 0.4,
        ease: 'power2.inOut',
      });
      setActiveIndex(index);
    }
  };

  return (
    <div ref={containerRef} className="max-w-4xl mx-auto px-6 py-24 bg-[#FAF8F5]">
      {/* Heading */}
      <h2 className="text-4xl md:text-5xl font-extrabold mb-12 text-center text-[#0A142F]">
        Why Developers Are Choosing This Course
      </h2>

      {/* Accordion Items */}
      <div className="space-y-4">
        {accordionItems.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200"
          >
            {/* Header */}
            <button
              onClick={() => toggleAccordion(index)}
              className="w-full flex items-center gap-4 p-6 hover:bg-gray-50 transition-colors"
            >
              {/* Avatar */}
              <div className="w-12 h-12 bg-gradient-to-br from-[#1E8DF0] to-[#108B50] rounded-full flex items-center justify-center text-2xl flex-shrink-0">
                {item.avatar}
              </div>

              {/* Title */}
              <div className="flex-1 text-left">
                <h3 className="text-xl md:text-2xl font-bold text-[#0A142F]">
                  {item.title}
                </h3>
              </div>

              {/* Toggle Button */}
              <div className="w-10 h-10 rounded-full border-2 border-[#0A142F] flex items-center justify-center flex-shrink-0">
                {activeIndex === index ? (
                  <Minus className="w-5 h-5 text-[#0A142F]" />
                ) : (
                  <Plus className="w-5 h-5 text-[#0A142F]" />
                )}
              </div>
            </button>

            {/* Content - Chat Bubble Style */}
            <div
              id={`content-${index}`}
              className="h-0 opacity-0 overflow-hidden"
            >
              <div className="px-6 pb-6">
                <div className={`${item.bubbleColor} p-6 rounded-3xl rounded-bl-none text-lg text-[#0A142F] font-medium shadow-md`}>
                  {item.content}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

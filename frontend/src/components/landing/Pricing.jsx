import { Check } from 'lucide-react';

export default function Pricing() {
  const basicFeatures = [
    'Complete GSAP Course (20+ hours)',
    'ScrollTrigger Mastery Module',
    'Text & SVG Animation Techniques',
    '5+ Production-Ready Projects',
    'Lifetime Access & Updates',
    'Private Discord Community',
    'Certificate of Completion',
  ];

  const bundleFeatures = [
    'Everything in GSAP Course',
    'Advanced 3D Animations Module',
    'React + GSAP Integration Course',
    'Performance Optimization Masterclass',
    'Animation Design System Templates',
    '10+ Bonus Projects & Templates',
    'Priority Support & Code Reviews',
    '1-on-1 Portfolio Review Session',
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-24 text-center bg-[#FAF8F5]">
      {/* Heading */}
      <h2 className="text-4xl md:text-5xl font-extrabold text-[#0A142F] mb-4">
        Two ways to stay ahead of the curve.
      </h2>
      <p className="text-lg text-gray-600 mb-12">
        Choose the path that fits your ambition
      </p>

      {/* Cards Container */}
      <div className="flex flex-col lg:flex-row gap-8 mt-12 justify-center items-start">
        {/* Card 1 - Basic */}
        <div className="bg-[#3ED79A] text-[#0A142F] rounded-3xl p-8 md:p-10 border-2 border-black flex-1 max-w-md shadow-2xl">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            Buy the GSAP Course to Animate Like the Top 1%
          </h3>
          
          <div className="mb-6">
            <span className="text-5xl md:text-6xl font-black">$99</span>
            <span className="text-xl line-through opacity-50 ml-3">$664</span>
          </div>

          <button className="w-full bg-black text-white font-bold py-4 px-6 rounded-full mb-8 hover:bg-gray-800 transition-colors text-lg">
            Enroll Now & Get Lifetime Access
          </button>

          <div className="text-left space-y-3">
            {basicFeatures.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <Check className="w-6 h-6 flex-shrink-0 mt-0.5" />
                <span className="font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2 - Bundle */}
        <div className="bg-[#FFD037] text-[#0A142F] rounded-3xl p-8 md:p-10 border-2 border-black flex-1 max-w-md shadow-2xl lg:scale-105 relative">
          {/* Popular Badge */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#F14A51] text-white px-6 py-2 rounded-full font-bold text-sm">
            MOST POPULAR
          </div>

          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            The Motion Authority Bundle
          </h3>
          
          <div className="mb-6">
            <span className="text-5xl md:text-6xl font-black">$149</span>
            <span className="text-xl line-through opacity-50 ml-3">$997</span>
          </div>

          <button className="w-full bg-[#0A142F] text-white font-bold py-4 px-6 rounded-full mb-8 hover:bg-gray-800 transition-colors text-lg">
            Become a Motion Authority
          </button>

          <div className="text-left space-y-3">
            {bundleFeatures.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <Check className="w-6 h-6 flex-shrink-0 mt-0.5" />
                <span className="font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

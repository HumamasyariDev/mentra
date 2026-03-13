import { useState } from 'react';

export default function FAQs() {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const faqs = [
    {
      question: '01 WHY SHOULD I PAY FOR THIS COURSE WHEN THERE ARE FREE TUTORIALS?',
      answer: 'Free tutorials teach you syntax. This course teaches you mastery. You get a structured learning path, real projects for your portfolio, certificate, community access, and lifetime updates. Most importantly, you learn the "why" behind animations, not just the "how".',
    },
    {
      question: '02 IS THIS BEGINNER-FRIENDLY?',
      answer: 'Absolutely. We start from zero and build up progressively. If you know basic JavaScript and CSS, you\'re ready. We don\'t assume any prior GSAP knowledge.',
    },
    {
      question: '03 HOW LONG DOES IT TAKE TO COMPLETE?',
      answer: 'At your own pace! The course is 20+ hours of content, but you have lifetime access. Most students complete it in 4-6 weeks studying part-time.',
    },
    {
      question: '04 WILL THIS WORK WITH REACT/VUE/OTHER FRAMEWORKS?',
      answer: 'Yes! GSAP is framework-agnostic. We cover vanilla JavaScript animations and show you how to integrate GSAP with React, Vue, and other modern frameworks.',
    },
    {
      question: '05 WHAT IF I GET STUCK OR NEED HELP?',
      answer: 'You get access to our private Discord community where you can ask questions, share progress, and get help from instructors and fellow students. Plus, each lesson has a comments section.',
    },
    {
      question: '06 IS THERE A REFUND POLICY?',
      answer: '100% yes. If you\'re not satisfied within 30 days, we\'ll refund you, no questions asked. We\'re that confident you\'ll love it.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-24 bg-[#FAF8F5]">
      {/* Heading */}
      <h2 className="text-4xl md:text-5xl font-extrabold text-center mb-16 text-[#0A142F]">
        Frequently Asked Questions
      </h2>

      {/* FAQ List */}
      <div className="space-y-0">
        {faqs.map((faq, index) => (
          <div key={index} className="border-b border-gray-300">
            {/* Question */}
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full py-6 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors px-4"
            >
              <span className="text-lg md:text-xl font-bold uppercase text-[#0A142F] text-left">
                {faq.question}
              </span>
              <span
                className={`text-4xl font-light transition-transform duration-300 flex-shrink-0 ml-4 ${
                  activeIndex === index ? 'rotate-45' : ''
                }`}
              >
                +
              </span>
            </button>

            {/* Answer */}
            <div
              className={`overflow-hidden transition-all duration-300 ${
                activeIndex === index ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="px-4 pb-6 text-gray-700 text-lg leading-relaxed">
                {faq.answer}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

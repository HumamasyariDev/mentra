import { Star } from 'lucide-react';

export default function Testimonials() {
  const testimonials = [
    {
      stars: 5,
      text: "This course literally changed my career. I went from making basic hover effects to building award-worthy animations. Got hired at a top agency within 2 months.",
      name: "Sarah Chen",
      role: "Frontend Dev at Meta",
      avatar: "👩‍💻",
      bgColor: "bg-[#E5F3FF]",
    },
    {
      stars: 5,
      text: "Best investment I've made in my development career. The GTA VI clone project alone is worth 10x the price. My portfolio has never looked better.",
      name: "Marcus Johnson",
      role: "Freelancer, USA",
      avatar: "👨‍🎨",
      bgColor: "bg-[#FFF9E5]",
    },
    {
      stars: 5,
      text: "I've taken 3 other GSAP courses. This is the only one that actually teaches you HOW to think about animation, not just copy-paste code.",
      name: "Priya Sharma",
      role: "Senior Dev, India",
      avatar: "👩‍🔬",
      bgColor: "bg-white",
    },
    {
      stars: 5,
      text: "The scroll animations section is pure gold. I've implemented these techniques in production for clients and they're blown away every time.",
      name: "Alex Rivera",
      role: "Creative Dev, Spain",
      avatar: "👨‍💼",
      bgColor: "bg-[#F0E5FF]",
    },
    {
      stars: 5,
      text: "Finally, a course that respects your time. No fluff, no BS. Just real, production-ready animation knowledge.",
      name: "Emma Wilson",
      role: "Lead Dev, UK",
      avatar: "👩‍🚀",
      bgColor: "bg-[#E5FFF3]",
    },
    {
      stars: 5,
      text: "I landed 3 freelance clients specifically because of the animations I learned here. ROI in the first month!",
      name: "David Kim",
      role: "Freelancer, Korea",
      avatar: "👨‍🎓",
      bgColor: "bg-[#FFE5F0]",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-24 bg-[#FAF8F5]">
      {/* Heading */}
      <h2 className="text-5xl font-extrabold text-center mb-16 text-[#0A142F]">
        What Devs Say About This Course
      </h2>

      {/* Masonry Grid */}
      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
        {testimonials.map((testimonial, index) => (
          <div
            key={index}
            className={`${testimonial.bgColor} break-inside-avoid p-6 rounded-3xl border-2 border-black/5 shadow-lg`}
          >
            {/* Stars */}
            <div className="flex gap-1 mb-4">
              {[...Array(testimonial.stars)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>

            {/* Review Text */}
            <p className="text-[#0A142F] text-lg font-medium mb-6 leading-relaxed">
              "{testimonial.text}"
            </p>

            {/* User Profile */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#1E8DF0] to-[#108B50] rounded-full flex items-center justify-center text-2xl">
                {testimonial.avatar}
              </div>
              <div>
                <div className="font-bold text-[#0A142F]">{testimonial.name}</div>
                <div className="text-sm text-gray-600">{testimonial.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

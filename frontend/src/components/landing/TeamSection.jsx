export default function TeamSection() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-24 text-center bg-[#FAF8F5]">
      {/* Heading */}
      <h2 className="text-4xl md:text-6xl font-extrabold text-[#0A142F] leading-tight">
        Built by the team that taught millions of developers
      </h2>

      {/* Paragraph */}
      <p className="text-lg text-gray-600 mt-6 max-w-2xl mx-auto">
        This isn't a random course thrown together by someone who just learned GSAP last month. 
        We've been teaching animation for years. Our students' work has been featured on Awwwards, 
        landed them jobs at top agencies, and generated real revenue.
      </p>

      {/* CTA Button */}
      <button className="bg-[#3ED79A] text-black font-bold py-3 px-6 rounded-full mt-8 hover:bg-[#2fc589] transition-colors text-lg">
        Now it's your turn.
      </button>
    </div>
  );
}

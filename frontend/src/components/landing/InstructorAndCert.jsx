export default function InstructorAndCert() {
  return (
    <div className="bg-[#FAF8F5] py-24">
      {/* Instructor Section */}
      <div className="max-w-5xl mx-auto px-6 text-center mb-32">
        <h2 className="text-4xl md:text-5xl font-extrabold text-[#0A142F] mb-8">
          Meet Adrian, Your Instructor
        </h2>

        {/* Avatar */}
        <div className="w-32 h-32 bg-gradient-to-br from-[#1E8DF0] to-[#108B50] rounded-full mx-auto mb-12 flex items-center justify-center text-6xl shadow-2xl">
          👨‍💻
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-[#E5F3FF] p-6 rounded-2xl border-2 border-black/10">
            <div className="text-4xl font-black text-[#1E8DF0] mb-2">1M+</div>
            <div className="text-lg font-bold text-[#0A142F]">Devs Helped</div>
          </div>

          <div className="bg-[#FFF9E5] p-6 rounded-2xl border-2 border-black/10">
            <div className="text-4xl font-black text-[#FFD037] mb-2">3×</div>
            <div className="text-lg font-bold text-[#0A142F]">GitHub Star</div>
          </div>

          <div className="bg-[#FFE5E5] p-6 rounded-2xl border-2 border-black/10">
            <div className="text-4xl font-black text-[#F14A51] mb-2">⭐</div>
            <div className="text-lg font-bold text-[#0A142F]">GitNation Speaker</div>
          </div>
        </div>
      </div>

      {/* Certificate Section */}
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold text-[#0A142F] mb-8">
          Not Just Certified. Backed by Mastery.
        </h2>

        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Complete the course and earn a certificate that proves you're a GSAP expert. 
          Add it to LinkedIn, your portfolio, and your resume.
        </p>

        {/* Certificate Mockup */}
        <div className="bg-gradient-to-br from-[#1E8DF0] to-[#108B50] rounded-3xl p-12 border-4 border-black shadow-2xl mb-8 max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl p-8 text-center">
            <div className="text-6xl mb-4">🎓</div>
            <h3 className="text-2xl font-bold text-[#0A142F] mb-2">
              Certificate of Completion
            </h3>
            <p className="text-gray-600">
              GSAP Animation Mastery Course
            </p>
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-500">Awarded to</div>
              <div className="text-xl font-bold text-[#0A142F] mt-1">Your Name Here</div>
            </div>
          </div>
        </div>

        <button className="bg-[#3ED79A] text-black font-bold py-4 px-8 rounded-full text-lg hover:bg-[#2fc589] transition-colors">
          Start Animating with GSAP
        </button>
      </div>
    </div>
  );
}

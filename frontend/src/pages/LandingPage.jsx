import Hero from '../components/landing/Hero';
import FeaturesGrid from '../components/landing/FeaturesGrid';
import CompanyMarquee from '../components/landing/CompanyMarquee';
import ValueBento from '../components/landing/ValueBento';
import ScrollTextReveal from '../components/landing/ScrollTextReveal';
import SkillImpact from '../components/landing/SkillImpact';
import CourseShowcase from '../components/landing/CourseShowcase';
import TopicMarquees from '../components/landing/TopicMarquees';
import CapabilitiesList from '../components/landing/CapabilitiesList';
import WhyChooseUs from '../components/landing/WhyChooseUs';
import SkillsMarquee from '../components/landing/SkillsMarquee';
import TeamSection from '../components/landing/TeamSection';
import ProjectStack from '../components/landing/ProjectStack';
import RoadmapAccordion from '../components/landing/RoadmapAccordion';
import Testimonials from '../components/landing/Testimonials';
import Pricing from '../components/landing/Pricing';
import InstructorAndCert from '../components/landing/InstructorAndCert';
import FAQs from '../components/landing/FAQs';
import InteractiveFooter from '../components/landing/InteractiveFooter';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <Hero />
      <FeaturesGrid />
      <CompanyMarquee />
      <ValueBento />
      <ScrollTextReveal />
      <SkillImpact />
      <CourseShowcase />
      <TopicMarquees />
      <CapabilitiesList />
      <WhyChooseUs />
      <SkillsMarquee />
      <TeamSection />
      <ProjectStack />
      <RoadmapAccordion />
      <Testimonials />
      <Pricing />
      <InstructorAndCert />
      <FAQs />
      <InteractiveFooter />
    </div>
  );
}

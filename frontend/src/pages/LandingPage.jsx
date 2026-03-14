import '../styles/pages/LandingPage.css';

import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import GamificationLoop from '../components/landing/GamificationLoop';
import FeatureShowcase from '../components/landing/FeatureShowcase';
import ForestShowcase from '../components/landing/ForestShowcase';
import TechStack from '../components/landing/TechStack';
import CTAFooter from '../components/landing/CTAFooter';
import Footer from '../components/landing/Footer';

export default function LandingPage() {
  return (
    <div className="landing-page">
      <Navbar />
      <Hero />
      <GamificationLoop />
      <FeatureShowcase />
      <ForestShowcase />
      <TechStack />
      <CTAFooter />
      <Footer />
    </div>
  );
}

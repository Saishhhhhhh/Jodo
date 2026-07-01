import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import FeaturesBar from "@/components/FeaturesBar";
import CollectionsSection from "@/components/CollectionsSection";

export default function HomePage() {
  return (
    <div className="pb-20">
      {/* Hero */}
      <HeroSection />

      {/* About / Mission */}
      <AboutSection />

      {/* Features Bar — Free Shipping, Custom Design, Refund */}
      <FeaturesBar />

      {/* New Collection + Room Categories */}
      <CollectionsSection />
    </div>
  );
}

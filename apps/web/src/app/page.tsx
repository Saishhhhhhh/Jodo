import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import FeaturesBar from "@/components/FeaturesBar";
import CollectionsSection from "@/components/CollectionsSection";
import FeaturedProducts from "@/components/FeaturedProducts";
import PuzzleSection from "@/components/PuzzleSection";
import VideoSection from "@/components/VideoSection";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-[70px] pb-[70px]">
      {/* Hero */}
      <HeroSection />

      {/* About / Mission */}
      <AboutSection />

      {/* Features Bar — Free Shipping, Custom Design, Refund */}
      <FeaturesBar />

      {/* Featured Products */}
      <FeaturedProducts />

      {/* Scroll Puzzle Animation */}
      <PuzzleSection />

      {/* New Collection + Room Categories */}
      <CollectionsSection />

      {/* Full-width Video Section */}
      <VideoSection />
    </div>
  );
}

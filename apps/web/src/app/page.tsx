import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import FeaturesBar from "@/components/FeaturesBar";
import CollectionsSection from "@/components/CollectionsSection";
import FeaturedProducts from "@/components/FeaturedProducts";
import PuzzleSection from "@/components/PuzzleSection";
import VideoSection from "@/components/VideoSection";

export const metadata = {
  title: "Jodo Home | Crafting Comfort, Shaping Style",
  description: "Discover premium furniture and home decor. From modern minimalist to timeless classics — transform any space into a place you'll love.",
  verification: {
    google: "B2BvJ82mzIspAqj6NdRprEyOVcVu41bDFnN8gPsQEQI",
  },
};

export default function HomePage() {
  return (
    <div className="flex flex-col gap-12 md:gap-[70px] pb-12 md:pb-[70px]">
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

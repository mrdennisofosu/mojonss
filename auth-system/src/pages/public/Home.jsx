import HeroSection from "../../components/home/HeroSection";
import FeaturesSection from "../../components/home/FeaturesSection";
import LatestAnnouncements from "../../components/home/LatestAnnouncements";

// The homepage is just its sections, in order.
function Home() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <LatestAnnouncements />
    </>
  );
}

export default Home;

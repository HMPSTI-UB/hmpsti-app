import { NOISE_TEXTURE } from "@/constant/data";
import { AboutSection } from "../components/about-section";
import { HeroSection } from "../components/hero-section";
import { LandingCtaSection } from "../components/landing-cta-section";
import { MissionSection } from "../components/mission-section";
import { QuickMenu } from "../components/quick-menu";
import { StatsSection } from "../components/stats-section";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-white selection:text-black overflow-x-hidden relative">
      <div
        className="fixed inset-0 z-0 pointer-events-none opacity-[0.025] brightness-125 mix-blend-overlay"
        style={{ backgroundImage: NOISE_TEXTURE }}
      />
      <HeroSection />
      <QuickMenu />
      <StatsSection />
      <AboutSection />
      <MissionSection />
      <LandingCtaSection />
    </div>
  );
}

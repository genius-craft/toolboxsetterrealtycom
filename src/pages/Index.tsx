import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ToolsSection from "@/components/ToolsSection";
import AudienceSection from "@/components/AudienceSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";
import { WhatsAppButton } from "@/components/WhatsAppButton";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <ToolsSection />
        <AudienceSection />
        <CTASection />
      </main>
      <Footer />
      
      <CookieConsent />
      <WhatsAppButton />
    </div>
  );
};

export default Index;

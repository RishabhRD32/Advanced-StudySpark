import { LandingHeader } from "@/components/landing/header";
import { LandingFooter } from "@/components/landing/footer";
import { FAQ } from "@/components/landing/faq";

export default function FAQPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <LandingHeader />
      <main className="flex-1">
        <FAQ />
      </main>
      <LandingFooter />
    </div>
  );
}

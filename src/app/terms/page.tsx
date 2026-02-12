
import { LandingHeader } from "@/components/landing/header";
import { LandingFooter } from "@/components/landing/footer";

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <LandingHeader />
      <main className="flex-1 container py-20 max-w-4xl">
        <h1 className="text-4xl font-black mb-8 tracking-tight">Terms of Service</h1>
        <div className="prose dark:prose-invert max-w-none space-y-6 font-medium text-muted-foreground">
          <p>Last Updated: October 2026</p>
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">1. Acceptance of Terms</h2>
            <p>By accessing or using StudySpark, you agree to be bound by these terms. If you do not agree to all of these terms, do not use the service.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">2. Use of AI Tools</h2>
            <p>Our AI tools (Tutor, Summarizer, Planner) are designed to assist learning. While we strive for accuracy, the output should be verified against official academic sources.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">3. User Content</h2>
            <p>You retain ownership of the study materials you upload. By making materials public, you grant other StudySpark users a license to use them for educational purposes.</p>
          </section>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}

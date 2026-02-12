
import { LandingHeader } from "@/components/landing/header";
import { LandingFooter } from "@/components/landing/footer";

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <LandingHeader />
      <main className="flex-1 container py-20 max-w-4xl">
        <h1 className="text-4xl font-black mb-8 tracking-tight">Privacy Policy</h1>
        <div className="prose dark:prose-invert max-w-none space-y-6 font-medium text-muted-foreground">
          <p>Last Updated: October 2026</p>
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">1. Information We Collect</h2>
            <p>At StudySpark, we collect information to provide better services to our users. This includes account information (name, email), study materials you upload, and academic data like subject lists and assignments.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">2. How We Use Information</h2>
            <p>We use the information we collect to maintain and improve our services, develop new AI features, and protect StudySpark and our users. We use your data to power the AI Tutor, Summarizer, and Personalized Planner.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">3. Data Security</h2>
            <p>We work hard to protect StudySpark and our users from unauthorized access to or unauthorized alteration, disclosure, or destruction of information we hold. All data is encrypted and stored using Firebase security protocols.</p>
          </section>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}

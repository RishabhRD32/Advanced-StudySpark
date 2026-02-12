
import { LandingHeader } from "@/components/landing/header";
import { LandingFooter } from "@/components/landing/footer";

export default function CookiesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <LandingHeader />
      <main className="flex-1 container py-20 max-w-4xl">
        <h1 className="text-4xl font-black mb-8 tracking-tight">Cookie Policy</h1>
        <div className="prose dark:prose-invert max-w-none space-y-6 font-medium text-muted-foreground">
          <p>Last Updated: October 2026</p>
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">What are cookies?</h2>
            <p>Cookies are small text files stored on your device to help websites function better and provide a more personalized experience.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">How we use them</h2>
            <p>StudySpark uses essential cookies for authentication and session management. We also use analytics cookies to understand how users interact with our platform to improve performance.</p>
          </section>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}

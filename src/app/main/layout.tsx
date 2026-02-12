
import { AppSidebar } from "./components/sidebar";
import { AppHeader } from "./components/header";
import { AuthGuard } from "./components/auth-guard";
import { SidebarProvider } from "./components/sidebar-provider";

export default function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background overflow-hidden">
          <AppSidebar />
          <div className="flex flex-col flex-1 min-w-0 transition-all duration-300">
            <AppHeader />
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 scroll-smooth bg-muted/10">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </AuthGuard>
  );
}

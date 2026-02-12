import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import AuthProvider from '@/lib/auth/auth-provider';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseErrorListener } from '@/components/firebase-error-listener';

export const metadata: Metadata = {
  title: 'StudySpark - Modern Academic Hub',
  description: 'A refined academic workspace featuring AI tutoring, automated planning, and intelligent productivity tools.',
  keywords: [
    'STUDYSPARK',
    'STUDYSPARK AI',
    'Rishabh',
    'Rishabdev',
    'Rishabdev Tripathi',
    'Students helper',
    'HyperAI',
    'Teacher Friend',
    'Academic Workspace',
    'AI Tutoring',
    'Study Planning',
    'Productivity Tools',
    'Next.js AI App',
    'Modern Learning Hub'
  ],
  authors: [{ name: 'Rishabdev Tripathi' }],
  creator: 'Rishabdev Tripathi',
  publisher: 'StudySpark',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎓</text></svg>" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500;1,600;1,700;1,800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased selection:bg-primary/10">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <FirebaseErrorListener />
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

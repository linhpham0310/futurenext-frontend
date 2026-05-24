// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter as FontSans } from 'next/font/google';
import '@/styles/globals.css'; // Import global styles (includes Shadcn theme variables)
import { ThemeProvider } from '@/components/providers/theme-provider'; // Import ThemeProvider
import { cn } from '@/lib/utils';

// Setup font according to Shadcn docs
const fontSans = FontSans({
  subsets: ['latin', 'vietnamese'], // Include subsets as needed
  variable: '--font-sans', // Define CSS variable for the font family
});

export const metadata: Metadata = {
  title: 'FutureNext.ai | Nền tảng học lập trình AI', // Descriptive title
  description: 'FutureNext.ai - Nền tảng học lập trình trực tuyến AI-First thế hệ mới.',
  // Add other metadata: icons, openGraph, etc.
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning is crucial for next-themes compatibility
    <html lang="vi" suppressHydrationWarning>
      <head /> {/* Next.js manages head content */}
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased', // Base styles from Shadcn theme
          fontSans.variable // Apply font variable class to body
        )}
      >
        {/* Wrap the entire application content with ThemeProvider */}
        <ThemeProvider>
          <main className="flex-grow">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}

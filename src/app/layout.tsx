// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter as FontSans } from 'next/font/google';
import '@/styles/globals.css'; // Import global styles (includes Shadcn theme variables)
import { ThemeProvider } from '@/components/providers/theme-provider'; // Import ThemeProvider
import { cn } from '@/lib/utils';
import Footer from '@/components/layout/footer';

// Cấu hình font Roboto
const fontSans = FontSans({
  subsets: ['latin', 'vietnamese'], // Thêm subset tiếng Việt
  weight: ['300', '400', '500', '700'], // Chọn các weight cần dùng
  variable: '--font-sans', // Giữ nguyên tên variable nếu chỉ thay font sans
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
      <head />
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased', // Base styles from Shadcn theme
          fontSans.variable // Apply font variable class to body
        )}
      >
        {/* Wrap the entire application content with ThemeProvider */}
        <ThemeProvider>
          <main className="flex-grow">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}

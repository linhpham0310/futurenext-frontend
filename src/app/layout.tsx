// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../styles/globals.css'; //  Đảm bảo import file CSS global ở đây

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FutureNext.ai',
  description: 'AI-Powered Learning Platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}

// src/app/(main)/layout.tsx
/**
 * @file Layout cho các trang yêu cầu đăng nhập (vd: /dashboard, /profile).
 * Sẽ chứa Header, Sidebar và bảo vệ route.
 */
'use client';

import { useAuth } from '@/hooks/auth/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { StudentSidebar } from '@/components/layout/student-sidebar';
import Footer from '@/components/layout/footer';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsHydrating(false), 0);
    return () => clearTimeout(timer);
  }, []);

  // Bảo vệ Route
  useEffect(() => {
    if (!isHydrating && !isAuthenticated) {
      console.log('[MainLayout] User not authenticated, redirecting to sign-in.');
      router.replace('/sign-in');
    }
  }, [isAuthenticated, isHydrating, router]);

  // Hiển thị loading khi chưa hydrate hoặc chưa xác thực
  if (isHydrating || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner className="h-10 w-10 text-primary" />
      </div>
    );
  }

  // Hiển thị layout chính với SiteHeader
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <StudentSidebar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">{children}</main>
      <Footer />
    </div>
  );
}

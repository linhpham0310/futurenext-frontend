// src/app/(main)/layout.tsx
/**
 * @file Layout cho các trang yêu cầu đăng nhập (vd: /dashboard, /profile).
 * Sẽ chứa Header, Sidebar và bảo vệ route.
 */
'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { SiteHeader } from '@/components/layout/SiteHeader';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      // Giả lập thời gian hydrate
      setIsHydrating(false);
    });
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
    <div className="relative flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-grow container mx-auto max-w-5xl px-4 py-8 md:py-12">{children}</main>
    </div>
  );
}

// src/app/(teacher)/layout.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/hooks/auth/useAuth';
import { TeacherHeader } from '@/components/layout/teacher-sidebar';
import Footer from '@/components/layout/footer';

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const { isTeacher, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsHydrating(false), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isHydrating && !isAuthenticated) {
      router.replace('/sign-in');
    } else if (!isHydrating && !isLoading && isAuthenticated && !isTeacher) {
      router.replace('/forbidden');
    }
  }, [isAuthenticated, isTeacher, isLoading, isHydrating, router]);

  if (isHydrating || isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner className="h-10 w-10 text-primary" />
      </div>
    );
  }

  if (!isTeacher) return null;

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <TeacherHeader />
      <main className="flex-1 overflow-y-auto">{children}</main>
      <Footer />
    </div>
  );
}

'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';
import { TeacherHeader } from '@/components/layout/teacher-header';
import { ThemeProvider } from '@/components/providers/theme-provider';
import Footer from '@/components/layout/footer';

export default function TeacherLayout({ children }: { children: ReactNode }) {
  const { isTeacher, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!isTeacher) {
    router.push('/forbidden');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ThemeProvider>
        <TeacherHeader />
        <main className="container mx-auto px-4 py-6 max-w-7xl">{children}</main>
        <Footer />
      </ThemeProvider>
    </div>
  );
}

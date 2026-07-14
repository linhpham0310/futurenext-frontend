'use client';

import { ReactNode, useEffect } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';
import { TeacherHeader } from '@/components/layout/teacher-header';
import { TeacherSidebar } from '@/components/layout/teacher-sidebar';

export default function TeacherLayout({ children }: { children: ReactNode }) {
  const { isTeacher, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isTeacher) {
      router.push('/forbidden');
    }
  }, [isLoading, isTeacher, router]);

  if (isLoading || !isTeacher) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TeacherHeader />
      <div className="flex flex-1">
        <TeacherSidebar />
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

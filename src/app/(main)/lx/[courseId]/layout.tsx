'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { LessonNavbar } from './_components/lesson-navbar';
import { LessonSidebar } from './_components/lesson-sidebar';
import { AiSidebar } from './_components/ai-sidebar';
import { useLXStore } from '@/store/use-lx-store';
import { useAuth } from '@/hooks/auth/useAuth';
import { Spinner } from '@/components/ui/spinner';

export default function LxLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const courseId = params.courseId as string;
  const { user, isLoading: authLoading } = useAuth();
  const [isAiOpen, setIsAiOpen] = useState(true);
  const { fetchRuntimeOverview, isLoadingStructure, resetLXStore, courseTitle } = useLXStore();

  useEffect(() => {
    if (courseId && user) {
      fetchRuntimeOverview(courseId);
    }
    return () => resetLXStore();
  }, [courseId, user, fetchRuntimeOverview, resetLXStore]);

  if (authLoading || isLoadingStructure) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-white">
      <LessonNavbar
        courseTitle={courseTitle || 'Đang tải...'}
        isAiOpen={isAiOpen}
        onToggleAi={() => setIsAiOpen(!isAiOpen)}
      />
      <div className="flex-1 flex overflow-hidden">
        <div className="hidden md:block h-full shrink-0">
          <LessonSidebar />
        </div>
        <main className="flex-1 overflow-y-auto">{children}</main>
        <div className="h-full shrink-0">
          <AiSidebar isOpen={isAiOpen} />
        </div>
      </div>
    </div>
  );
}

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
  const { fetchRuntimeOverview, isLoadingStructure, structureError, resetLXStore, courseTitle } = useLXStore();

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

  if (structureError) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-y-3 bg-white">
        <p className="text-sm text-red-600 font-medium">{structureError}</p>
        <button
          onClick={() => fetchRuntimeOverview(courseId)}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Thử lại
        </button>
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

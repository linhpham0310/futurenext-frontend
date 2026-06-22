'use client';

import { useRouter, useParams } from 'next/navigation';
import { useLXStore } from '@/store/use-lx-store';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { studentApi } from '@/lib/api';
import { toast } from 'sonner';

export const LessonNavigationControls = () => {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  const { sections, activeLesson, fetchLessonDetail, updateLessonProgressLocal } = useLXStore();

  if (!activeLesson || sections.length === 0) return null;

  const allLessons = sections.flatMap((section) => section.lessons);
  const currentIndex = allLessons.findIndex((lesson) => lesson.id === activeLesson.id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const navigateToLesson = async (lessonId: string) => {
    router.push(`/lx/${courseId}?lessonId=${lessonId}`);
    await fetchLessonDetail(lessonId);
  };

  const handleCompleteAndNext = async () => {
    try {
      await studentApi.updateLessonProgress(activeLesson.id, {
        status: 'COMPLETED',
        lastPosition: activeLesson.lastPosition ?? 0,
      });
      updateLessonProgressLocal(activeLesson.id, 'COMPLETED', activeLesson.lastPosition ?? 0);
      toast.success('Chúc mừng! Bạn đã hoàn thành bài học này.');
      if (nextLesson) await navigateToLesson(nextLesson.id);
    } catch {
      toast.error('Cập nhật thất bại');
    }
  };

  return (
    <div className="flex items-center justify-between border-t pt-6 mt-8 bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-sm">
      <button
        onClick={() => prevLesson && navigateToLesson(prevLesson.id)}
        disabled={!prevLesson}
        className="flex items-center gap-x-2 px-4 py-2.5 text-sm font-semibold border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Bài trước</span>
      </button>

      {activeLesson.status !== 'COMPLETED' && (
        <button
          onClick={handleCompleteAndNext}
          className="flex items-center gap-x-2 px-5 py-2.5 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-105"
        >
          <CheckCircle className="h-4 w-4" />
          <span>Hoàn thành & Tiếp tục</span>
        </button>
      )}

      <button
        onClick={() => nextLesson && navigateToLesson(nextLesson.id)}
        disabled={!nextLesson}
        className="flex items-center gap-x-2 px-4 py-2.5 text-sm font-semibold border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        <span className="hidden sm:inline">Bài tiếp</span>
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
};

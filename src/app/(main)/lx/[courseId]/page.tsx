'use client';

import { useSearchParams } from 'next/navigation';
import { useLXStore } from '@/store/use-lx-store';
import { Spinner } from '@/components/ui/spinner';
import { LessonNavigationControls } from './_components/lesson-navigation-controls';
import { CourseWelcomeOverview } from './_components/course-welcome-overview';
import DOMPurify from 'isomorphic-dompurify';
import { FileText, Video } from 'lucide-react';

export default function LxPage() {
  const searchParams = useSearchParams();
  const lessonId = searchParams.get('lessonId');
  const { activeLesson, isLoadingLesson } = useLXStore();

  if (isLoadingLesson) {
    return (
      <div className="h-full flex justify-center items-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!lessonId) {
    return <CourseWelcomeOverview />;
  }

  if (!activeLesson) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <div className="aspect-video bg-slate-900 flex items-center justify-center relative">
          {activeLesson.type === 'VIDEO' ? (
            <video controls className="w-full h-full object-contain" src={activeLesson.content}>
              <track kind="captions" />
            </video>
          ) : (
            <div className="flex flex-col items-center text-white/30">
              <FileText className="h-16 w-16 mb-2" />
              <span className="text-sm font-medium">Bài viết</span>
            </div>
          )}
          {/* Badge loại bài học */}
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full text-white text-xs font-medium">
            {activeLesson.type === 'VIDEO' ? (
              <Video className="h-3.5 w-3.5" />
            ) : (
              <FileText className="h-3.5 w-3.5" />
            )}
            {activeLesson.type === 'VIDEO' ? 'Video' : 'Bài viết'}
          </div>
        </div>

        <div className="p-6 space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">{activeLesson.title}</h2>
          <p className="text-sm text-gray-500">Loại: {activeLesson.type}</p>
          {activeLesson.type !== 'VIDEO' && activeLesson.content && (
            <div
              className="prose prose-slate max-w-none mt-4"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(activeLesson.content) }}
            />
          )}
        </div>
      </div>

      <LessonNavigationControls />
    </div>
  );
}

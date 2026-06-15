'use client';

import { useSearchParams } from 'next/navigation';
import { useLXStore } from '@/store/use-lx-store';
import { Spinner } from '@/components/ui/spinner';
import { LessonNavigationControls } from './_components/lesson-navigation-controls';
import { CourseWelcomeOverview } from './_components/course-welcome-overview';
import DOMPurify from 'dompurify';

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
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <div className="aspect-video bg-slate-900 rounded-xl flex items-center justify-center text-white">
        {activeLesson.type === 'VIDEO' ? (
          <video controls className="w-full h-full rounded-xl" src={activeLesson.content} />
        ) : (
          <div
            className="prose max-w-none p-6 bg-white text-black rounded-xl"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(activeLesson.content || '') }}
          />
        )}
      </div>
      <div>
        <h2 className="text-2xl font-bold">{activeLesson.title}</h2>
        <p className="text-muted-foreground">Loại: {activeLesson.type}</p>
      </div>
      <LessonNavigationControls />
    </div>
  );
}

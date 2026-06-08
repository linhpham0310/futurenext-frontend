'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useLXStore } from '@/store/use-lx-store';
import { CheckCircle2, Circle, PlayCircle, FileText, HelpCircle, Code2, Clock } from 'lucide-react';

export const LessonSidebar = () => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const courseId = params.courseId as string;
  const { sections, progressPercentage, activeLesson, fetchLessonDetail } = useLXStore();

  const handleLessonClick = async (lessonId: string) => {
    router.push(`/lx/${courseId}?lessonId=${lessonId}`);
    await fetchLessonDetail(lessonId);
  };

  const getLessonTypeIcon = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return <PlayCircle className="h-4 w-4 shrink-0" />;
      case 'ARTICLE':
        return <FileText className="h-4 w-4 shrink-0" />;
      case 'QUIZ':
        return <HelpCircle className="h-4 w-4 shrink-0" />;
      case 'LAB':
        return <Code2 className="h-4 w-4 shrink-0" />;
      default:
        return <FileText className="h-4 w-4 shrink-0" />;
    }
  };

  const getProgressIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />;
      case 'IN_PROGRESS':
        return <Clock className="h-4 w-4 text-amber-500 shrink-0" />;
      default:
        return <Circle className="h-4 w-4 text-gray-300 shrink-0" />;
    }
  };

  return (
    <div className="w-80 h-full border-r bg-gray-50 flex flex-col overflow-y-auto">
      <div className="p-4 border-b bg-white space-y-2">
        <h2 className="font-bold text-sm text-gray-800">Tiến độ của bạn</h2>
        <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
          <span>Tỷ lệ hoàn thành</span>
          <span>{Math.round(progressPercentage)}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-emerald-500 h-full transition-all"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
      <div className="flex-1 p-3 space-y-5 overflow-y-auto">
        {sections.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">Chưa có bài giảng nào</p>
        ) : (
          sections.map((section) => (
            <div key={section.id} className="space-y-1">
              <h3 className="text-xs font-bold text-gray-500 px-2 uppercase tracking-wider mb-2">
                {section.title}
              </h3>
              <div className="space-y-0.5">
                {section.lessons.map((lesson) => {
                  const isActive = activeLesson?.id === lesson.id;
                  return (
                    <div
                      key={lesson.id}
                      onClick={() => handleLessonClick(lesson.id)}
                      className={`flex items-center gap-x-2.5 px-3 py-3 rounded-lg text-xs font-semibold transition cursor-pointer select-none ${isActive ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-200/60 hover:text-gray-900'}`}
                    >
                      {getProgressIcon(lesson.status)}
                      <span className="truncate flex-1 font-medium">{lesson.title}</span>
                      <div className={isActive ? 'text-white' : 'text-gray-400'}>
                        {getLessonTypeIcon(lesson.type)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

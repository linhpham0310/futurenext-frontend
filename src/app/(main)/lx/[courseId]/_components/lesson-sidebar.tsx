'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useLXStore } from '@/store/use-lx-store';
import {
  CheckCircle2,
  Circle,
  PlayCircle,
  FileText,
  HelpCircle,
  Code2,
  Clock,
  BookOpen,
} from 'lucide-react';

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
        return <Circle className="h-4 w-4 text-muted-foreground/40 shrink-0" />;
    }
  };

  // Tính số bài đã hoàn thành
  const totalLessons = sections.reduce((acc, s) => acc + s.lessons.length, 0);
  const completedCount = sections.reduce(
    (acc, s) => acc + s.lessons.filter((l) => l.status === 'COMPLETED').length,
    0
  );

  return (
    <div className="w-80 h-full border-r border-border bg-card flex flex-col overflow-y-auto">
      <div className="p-4 border-b border-border space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-sm text-foreground flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            Nội dung khóa học
          </h2>
          <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
            {completedCount}/{totalLessons}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
          <span>Tiến độ</span>
          <span className="font-bold text-foreground">{Math.round(progressPercentage)}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div
            className="bg-primary h-full transition-all duration-500 rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
      <div className="flex-1 p-3 space-y-5 overflow-y-auto">
        {sections.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">Chưa có bài giảng nào</p>
        ) : (
          sections.map((section) => (
            <div key={section.id} className="space-y-1">
              <h3 className="text-xs font-bold text-muted-foreground px-2 uppercase tracking-wider mb-2">
                {section.title}
              </h3>
              <div className="space-y-0.5">
                {section.lessons.map((lesson) => {
                  const isActive = activeLesson?.id === lesson.id;
                  return (
                    <div
                      key={lesson.id}
                      onClick={() => handleLessonClick(lesson.id)}
                      className={`flex items-center gap-x-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer select-none ${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-foreground hover:bg-muted'
                      }`}
                    >
                      {getProgressIcon(lesson.status)}
                      <span className="truncate flex-1">{lesson.title}</span>
                      <div className={isActive ? 'text-primary-foreground/70' : 'text-muted-foreground'}>
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

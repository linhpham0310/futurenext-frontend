'use client';

import { useRouter, useParams } from 'next/navigation';
import { useLXStore } from '@/store/use-lx-store';
import { Play, Award, BookOpen, CheckCircle, Sparkles, TrendingUp } from 'lucide-react';

export const CourseWelcomeOverview = () => {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  const { courseTitle, sections, progressPercentage, getLastActiveLesson, fetchLessonDetail } =
    useLXStore();

  const allLessons = sections.flatMap((s) => s.lessons);
  const totalLessons = allLessons.length;
  const completedLessons = allLessons.filter((l) => l.status === 'COMPLETED').length;
  const resumeLesson = getLastActiveLesson();

  const handleResume = async () => {
    if (!resumeLesson) return;
    router.push(`/lx/${courseId}?lessonId=${resumeLesson.id}`);
    await fetchLessonDetail(resumeLesson.id);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="relative rounded-xl bg-card border border-border p-8 md:p-12 overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 p-6 opacity-5">
          <Award className="h-48 w-48 text-foreground" />
        </div>
        <div className="relative z-10 space-y-4 max-w-2xl">
          <span className="inline-flex items-center gap-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Không gian học tập
          </span>
          <h1 className="text-2xl md:text-4xl font-extrabold leading-tight tracking-tight text-foreground">
            Chào mừng bạn trở lại!
          </h1>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
            Hệ thống đã chuẩn bị sẵn sàng lộ trình cho khóa học{' '}
            <strong className="text-foreground font-semibold">{courseTitle}</strong>.
            <br className="hidden sm:block" /> Hãy tiếp tục nâng cấp kỹ năng của bạn.
          </p>
          {resumeLesson && (
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-4">
              <button
                onClick={handleResume}
                className="flex items-center justify-center gap-x-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold text-sm transition-all shadow-sm"
              >
                <Play className="h-4 w-4 fill-current" /> Tiếp tục học
              </button>
              <div className="text-xs text-muted-foreground">
                <span className="block font-medium text-foreground">Bài học đang chờ:</span>
                <span className="italic block max-w-[250px] truncate font-semibold text-muted-foreground">
                  {resumeLesson.title}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex items-center gap-x-4 hover:bg-muted/50 transition-colors">
          <div className="p-3 bg-muted rounded-xl text-foreground">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tiến độ</p>
            <p className="text-2xl font-black text-foreground">{Math.round(progressPercentage)}%</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex items-center gap-x-4 hover:bg-muted/50 transition-colors">
          <div className="p-3 bg-muted rounded-xl text-foreground">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Bài học</p>
            <p className="text-2xl font-black text-foreground">
              {completedLessons}/{totalLessons}
            </p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex items-center gap-x-4 hover:bg-muted/50 transition-colors">
          <div className="p-3 bg-muted rounded-xl text-foreground">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Trợ giảng AI</p>
            <p className="text-xs font-bold text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded mt-1 inline-block">
              Sẵn sàng
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

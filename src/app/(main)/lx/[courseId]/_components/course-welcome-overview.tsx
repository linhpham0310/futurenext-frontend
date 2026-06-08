'use client';

import { useRouter, useParams } from 'next/navigation';
import { useLXStore } from '@/store/use-lx-store';
import { Play, Award, BookOpen, CheckCircle, Sparkles } from 'lucide-react';

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
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="relative rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 text-white overflow-hidden shadow-xl border border-indigo-900">
        <div className="absolute top-0 right-0 p-6 opacity-10">
          <Award className="h-40 w-40" />
        </div>
        <div className="relative z-10 space-y-4 max-w-2xl">
          <span className="inline-flex items-center gap-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <Sparkles className="h-3 w-3 text-amber-400" /> Không gian học tập trí tuệ nhân tạo
          </span>
          <h1 className="text-2xl md:text-4xl font-extrabold leading-tight">
            Chào mừng bạn trở lại!
          </h1>
          <p className="text-slate-300 text-sm md:text-base">
            Hệ thống đã chuẩn bị sẵn sàng lộ trình cho khóa học{' '}
            <strong className="text-white font-semibold">{courseTitle}</strong>. Hãy tiếp tục nâng
            cấp kỹ năng.
          </p>
          {resumeLesson && (
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-4">
              <button
                onClick={handleResume}
                className="flex items-center justify-center gap-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition shadow-lg shadow-blue-900/30"
              >
                <Play className="h-4 w-4 fill-white" /> Tiếp tục học
              </button>
              <div className="text-xs text-slate-400">
                <span className="block font-medium text-slate-300">Bài học đang chờ:</span>
                <span className="italic block max-w-[250px] truncate font-semibold text-blue-400">
                  {resumeLesson.title}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border rounded-2xl p-5 shadow-sm flex items-center gap-x-4">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400">Tiến độ chung</p>
            <p className="text-2xl font-black">{Math.round(progressPercentage)}%</p>
          </div>
        </div>
        <div className="bg-white border rounded-2xl p-5 shadow-sm flex items-center gap-x-4">
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400">Bài học đã xong</p>
            <p className="text-2xl font-black">
              {completedLessons}/{totalLessons}
            </p>
          </div>
        </div>
        <div className="bg-white border rounded-2xl p-5 shadow-sm flex items-center gap-x-4">
          <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400">Trợ giảng AI TA</p>
            <p className="text-xs font-bold text-purple-600 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded mt-1">
              Sẵn sàng (RAG)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

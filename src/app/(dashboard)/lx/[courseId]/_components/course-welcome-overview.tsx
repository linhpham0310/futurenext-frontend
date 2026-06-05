'use client';
import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useLXStore } from '@/store/use-lx-store'; // Kế thừa từ Task LX-FE-1.2
import { Play, Award, BookOpen, CheckCircle, Sparkles } from 'lucide-react';
// ---------------------------------------------------------
// TASK: LX-FE-1.5: Giao diện Màn hình chào mừng & Resume Học tập
// ---------------------------------------------------------
export const CourseWelcomeOverview = () => {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  // Gọi các dữ liệu và hàm từ Zustand Store
  const { courseTitle, sections, progressPercentage, fetchLessonDetail, getLastActiveLesson } =
    useLXStore();
  const allLessons = sections.flatMap((s) => s.lessons);
  const totalLessons = allLessons.length;
  const completedLessons = allLessons.filter((l) => l.status === 'COMPLETED').length;
  // Xác định bài học thông minh cần Resume thông qua hàm vừa viết ở Bước 1
  const resumeLesson = getLastActiveLesson();
  const handleResumeClick = async () => {
    if (!resumeLesson) return;
    // 1. Đẩy ID bài học lên URL
    router.push(`/lx/${courseId}?lessonId=${resumeLesson.id}`);
    // 2. Kích hoạt nạp dữ liệu chi tiết bài học (Kế thừa Task LX-FE-1.2)
    await fetchLessonDetail(resumeLesson.id);
  };
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 1. Khu vực Banner Chào mừng tráng lệ */}
      <div className="relative rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 text-white overflow-hidden shadow-xl border border-indigo-900">
        <div className="absolute top-0 right-0 p-6 opacity-10">
          <Award className="h-40 w-40 text-white" />
        </div>
        <div className="relative z-10 space-y-4 max-w-2xl">
          <span className="inline-flex items-center gap-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <Sparkles className="h-3 w-3 text-amber-400" /> Không gian học tập trí tuệ nhân tạo
          </span>
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight leading-tight">
            Chào mừng bạn trở lại!
          </h1>
          <p className="text-slate-300 text-sm md:text-base line-clamp-2">
            Hệ thống đã chuẩn bị sẵn sàng toàn bộ lộ trình cho khóa học{' '}
            <strong className="text-white font-semibold">{courseTitle}</strong>. Hãy tiếp tục nâng
            cấp kỹ năng của mình ngay hôm nay.
          </p>
          {resumeLesson && (
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-4">
              <button
                onClick={handleResumeClick}
                className="flex items-center justify-center gap-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl font-bold text-sm transition shadow-lg shadow-blue-900/30 select-none"
              >
                <Play className="h-4 w-4 fill-white" />
                <span>Tiếp tục học bài dở</span>
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
      {/* 2. Khu vực Thống kê Tiến độ Tổng quan bằng Thẻ số liệu */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Thẻ 1: Tỷ lệ % hoàn thành */}
        <div className="bg-white border rounded-2xl p-5 shadow-sm flex items-center gap-x-4">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Tiến độ chung
            </p>
            <p className="text-2xl font-black text-gray-800 mt-0.5">
              {Math.round(progressPercentage)}%
            </p>
          </div>
        </div>
        {/* Thẻ 2: Số bài đã học xong */}
        <div className="bg-white border rounded-2xl p-5 shadow-sm flex items-center gap-x-4">
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Bài học đã xong
            </p>
            <p className="text-2xl font-black text-gray-800 mt-0.5">
              {completedLessons}/{totalLessons}
            </p>
          </div>
        </div>
        {/* Thẻ 3: Trạng thái Module AI */}
        <div className="bg-white border rounded-2xl p-5 shadow-sm flex items-center gap-x-4">
          <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Trợ giảng AI TA
            </p>
            <p className="text-xs font-bold text-purple-600 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded mt-1 inline-block">
              Sẵn sàng (RAG)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

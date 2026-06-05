'use client';
import React, { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLXStore } from '@/store/use-lx-store'; // Kế thừa từ Task LX-FE-1.2
import { Loader2, BookOpen } from 'lucide-react';
import { LessonNavigationControls } from './_components/lesson-navigation-controls';
import { CourseWelcomeOverview } from './_components/course-welcome-overview';
// TASK: LX-FE-1.3: Đồng bộ vùng hiển thị nội dung chính với Sidebar qua URL
export default function LxPage() {
  const searchParams = useSearchParams();
  const lessonId = searchParams.get('lessonId'); // Lấy ?lessonId=... từ URL
  const { activeLesson, fetchLessonDetail, isLoadingLesson, sections } = useLXStore();
  useEffect(() => {
    // ---------------------------------------------------------
    // TASK: LX-FE-1.5: Thay đổi logic tự động Play của Task 1.3 cũ
    // Thay vì tự ép vào bài 1, nếu URL trống, chúng ta ĐỂ TRỐNG để hiển thị Màn hình Chào mừng
    // ---------------------------------------------------------
    if (lessonId) {
      fetchLessonDetail(lessonId);
    }
  }, [lessonId, fetchLessonDetail]);

  // Trạng thái chờ khi đang tải nội dung bài học mới
  if (isLoadingLesson) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center gap-y-2 bg-white min-h-[400px]">
        <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
        <p className="text-xs text-gray-400 font-medium">Đang tải tài liệu bài giảng...</p>
      </div>
    );
  }

  // ---------------------------------------------------------
  // TASK: LX-FE-1.5: Nếu không có lessonId trên URL, hiển thị Màn hình Chào mừng thông minh
  // ---------------------------------------------------------
  if (!lessonId) {
    return <CourseWelcomeOverview />;
  }
  // Nếu có chọn bài học cụ thể, hiển thị không gian Workspace như cũ
  if (!activeLesson) return null;

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Khung Player giả lập (Sẽ triển khai thật Trình phát Media ở Sprint 2) */}
      <div className="aspect-video bg-slate-900 rounded-xl flex flex-col items-center justify-center text-slate-300 font-medium shadow-inner relative border border-slate-800">
        <span className="text-xs uppercase bg-slate-800 tracking-wider px-2.5 py-1 rounded text-slate-400 mb-2 font-semibold">
          {activeLesson.type} PLAYER WORKSPACE
        </span>
        <p className="text-sm px-4 text-center text-slate-400">
          [ Dữ liệu thô từ API: {activeLesson.content || 'Chưa có nội dung vật lý'} ]
        </p>
      </div>
      {/* Thông tin tiêu đề bài học */}
      <div className="space-y-2 border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">{activeLesson.title}</h2>
        <div className="flex items-center gap-x-2 text-xs text-gray-400 font-semibold uppercase">
          <span>Loại hình: {activeLesson.type}</span>
          <span>•</span>
          <span>Trạng thái: {activeLesson.status}</span>
        </div>
      </div>

      {/* ---------------------------------------------------------
        TASK: LX-FE-1.4: Tích hợp thanh điều hướng bài học vào cuối trang
        --------------------------------------------------------- */}
      <LessonNavigationControls />
    </div>
  );
}

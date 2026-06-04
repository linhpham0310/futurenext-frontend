'use client';
import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useLXStore } from '@/store/use-lx-store'; // Kế thừa từ Task LX-FE-1.2
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
// ---------------------------------------------------------
// TASK: LX-FE-1.4: Trình điều hướng bài học (Lesson Navigation Controls)
// ---------------------------------------------------------
export const LessonNavigationControls = () => {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  // Lấy dữ liệu cấu trúc và bài học đang active từ Zustand Store
  const { sections, activeLesson, fetchLessonDetail, updateLessonProgressLocal } = useLXStore();
  if (!activeLesson || sections.length === 0) return null;
  // 1. Làm phẳng danh sách bài học từ tất cả các chương để tính toán thứ tự tuyến tính
  const allLessons = sections.flatMap((section) => section.lessons);
  // 2. Tìm chỉ mục (index) của bài học hiện tại trong danh sách phẳng
  const currentIndex = allLessons.findIndex((lesson) => lesson.id === activeLesson.id);
  // 3. Xác định bài học phía trước và phía sau
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;
  // Hàm chuyển bài học tổng quát
  const navigateToLesson = async (lessonId: string) => {
    // Cập nhật lại thanh URL
    router.push(`/lx/${courseId}?lessonId=${lessonId}`);
    // Nạp chi tiết nội dung vật lý cho bài học mới (Kế thừa Task LX-FE-1.2)
    await fetchLessonDetail(lessonId);
  };
  // Hàm xử lý khi học viên bấm nút "Hoàn thành & Tiếp tục"
  const handleCompleteAndNext = async () => {
    // Cập nhật trạng thái COMPLETED cục bộ trên UI (Kế thừa Task LX-FE-1.2)
    // Giây thứ 0 biểu thị đã xem hết toàn bộ nội dung
    updateLessonProgressLocal(activeLesson.id, 'COMPLETED', 0);
    // Nếu có bài tiếp theo thì tự động chuyển sang bài mới, không thì giữ nguyên
    if (nextLesson) {
      await navigateToLesson(nextLesson.id);
    }
  };
  return (
    <div className="flex items-center justify-between border-t pt-6 mt-10 bg-white">
      {/* Nút quay lại bài phía trước */}
      <button
        onClick={() => prevLesson && navigateToLesson(prevLesson.id)}
        disabled={!prevLesson}
        className="flex items-center gap-x-2 px-4 py-2 text-sm font-semibold border rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition select-none"
      >
        <ArrowLeft className="h-4 w-4" />
        <div className="flex flex-col items-start hidden sm:flex">
          <span className="text-[10px] text-gray-400 uppercase font-bold">Bài trước</span>
          <span className="max-w-[120px] truncate">{prevLesson?.title || 'Đầu danh sách'}</span>
        </div>
        <span className="sm:hidden">Bài trước</span>
      </button>
      {/* Nút Hoàn thành phím tắt (Chỉ hiển thị nếu chưa hoàn thành bài này) */}
      {activeLesson.status !== 'COMPLETED' && (
        <button
          onClick={handleCompleteAndNext}
          className="flex items-center gap-x-2 px-5 py-2.5 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm shadow-emerald-100 transition select-none"
        >
          <CheckCircle className="h-4 w-4" />
          <span>Hoàn thành & Tiếp tục</span>
        </button>
      )}
      {/* Nút nhảy tới bài học tiếp theo */}
      <button
        onClick={() => nextLesson && navigateToLesson(nextLesson.id)}
        disabled={!nextLesson}
        className={`flex items-center gap-x-2 px-4 py-2 text-sm font-semibold border rounded-lg transition select-none ${
          activeLesson.status === 'COMPLETED' && nextLesson
            ? 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700' // Làm nổi bật nếu bài hiện tại đã học xong
            : 'text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white'
        }`}
      >
        <div className="flex flex-col items-end hidden sm:flex">
          <span className="text-[10px] text-gray-400 uppercase font-bold">Bài kế tiếp</span>
          <span className="max-w-[120px] truncate">{nextLesson?.title || 'Hết giáo trình'}</span>
        </div>
        <span className="sm:hidden">Bài kế tiếp</span>
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
};

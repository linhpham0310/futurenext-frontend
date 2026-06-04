'use client';
import React, { useEffect, useState } from 'react';
import { LessonNavbar } from './_components/lesson-navbar';
import { LessonSidebar } from './_components/lesson-sidebar';
import { AiSidebar } from './_components/ai-sidebar';
import { Loader2 } from 'lucide-react';
import { useLXStore } from '@/store/use-lx-store';
import { useParams } from 'next/navigation';
interface LxLayoutProps {
  children: React.ReactNode;
}
// TASK: LX-FE-1.1: Trực tiếp bọc toàn bộ cấu trúc không gian học tập 3 vùng (Split Screen)
export default function LxLayout({ children }: LxLayoutProps) {
  const params = useParams();
  const courseId = params.courseId as string;

  // Quản lý trạng thái đóng mở AI Chat ngầm tại tầng giao diện
  const [isAiOpen, setIsAiOpen] = useState(true);

  // ---------------------------------------------------------
  // TASK: LX-FE-1.2: Kết nối Layout với Zustand Store
  // ---------------------------------------------------------
  const { fetchRuntimeOverview, courseTitle, isLoadingStructure, resetLXStore } = useLXStore();

  useEffect(() => {
    if (courseId) {
      fetchRuntimeOverview(courseId);
    }
    return () => {
      resetLXStore();
    };
  }, [courseId, fetchRuntimeOverview, resetLXStore]);

  // Hiển thị màn hình chờ nếu đang tải cấu trúc
  if (isLoadingStructure) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center gap-y-2 bg-white">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        <p className="text-sm text-gray-500 font-medium">Đang chuẩn bị không gian học tập...</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-white">
      {/* 1. Thanh Navbar trên cùng */}
      <LessonNavbar
        courseTitle={courseTitle || 'Đang tải tên khóa học...'}
        isAiOpen={isAiOpen}
        onToggleAi={() => setIsAiOpen(!isAiOpen)}
      />
      {/* Khung chứa các tháp nội dung chính bên dưới */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* 2. Vùng Sidebar Trái: Cấu trúc chương mục */}
        <div className="hidden md:block h-full shrink-0">
          <LessonSidebar />
        </div>
        {/* 3. Vùng Trung tâm: Nội dung bài giảng chính */}
        <main className="flex-1 h-full bg-white overflow-y-auto relative">{children}</main>
        {/* 4. Vùng Sidebar Phải: Trợ giảng AI Chat */}
        <div className="h-full shrink-0">
          <AiSidebar isOpen={isAiOpen} />
        </div>
      </div>
    </div>
  );
}

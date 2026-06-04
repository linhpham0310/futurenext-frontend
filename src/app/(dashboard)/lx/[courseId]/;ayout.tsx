'use client';
import React, { useState } from 'react';
import { LessonNavbar } from './_components/lesson-navbar';
import { LessonSidebar } from './_components/lesson-sidebar';
import { AiSidebar } from './_components/ai-sidebar';
interface LxLayoutProps {
  children: React.ReactNode;
  params: { courseId: string };
}
// TASK: LX-FE-1.1: Trực tiếp bọc toàn bộ cấu trúc không gian học tập 3 vùng (Split Screen)
export default function LxLayout({ children, params }: LxLayoutProps) {
  // Quản lý trạng thái đóng mở AI Chat ngầm tại tầng giao diện
  const [isAiOpen, setIsAiOpen] = useState(true);
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-white">
      {/* 1. Thanh Navbar trên cùng */}
      <LessonNavbar
        courseTitle="Khóa học thiết lập hệ thống AI-Driven SaaS (Demo)"
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

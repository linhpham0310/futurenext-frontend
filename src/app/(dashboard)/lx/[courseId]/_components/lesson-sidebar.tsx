'use client';
import React from 'react';
import { CheckCircle2, Circle, PlayCircle } from 'lucide-react';
// Mock dữ liệu tạm thời để chạy thử giao diện (Sẽ thay thế ở Task LX-FE-1.2 & 1.3)
const mockSections = [
  {
    id: 'sec-1',
    title: 'Chương 1: Khởi đầu dự án',
    lessons: [
      { id: 'les-1', title: '1.1 Giới thiệu tổng quan', type: 'VIDEO', isCompleted: true },
      { id: 'les-2', title: '1.2 Cài đặt môi trường', type: 'ARTICLE', isCompleted: false },
    ],
  },
  {
    id: 'sec-2',
    title: 'Chương 2: Thiết kế Hệ thống',
    lessons: [
      { id: 'les-3', title: '2.1 Thiết kế Cơ sở dữ liệu', type: 'VIDEO', isCompleted: false },
      { id: 'les-4', title: '2.2 Viết Lab thử nghiệm', type: 'LAB', isCompleted: false },
    ],
  },
];
// TASK: LX-FE-1.1: Sidebar bên trái hiển thị danh mục bài học (Read-only stub)
export const LessonSidebar = () => {
  return (
    <div className="w-80 h-full border-r bg-gray-50 flex flex-col overflow-y-auto">
      <div className="p-4 border-b bg-white">
        <h2 className="font-bold text-sm text-gray-800">Nội dung khóa học</h2>
        <p className="text-xs text-gray-500 mt-1">Hoàn thành 1/4 bài học</p>
      </div>
      <div className="flex-1 p-3 space-y-4">
        {mockSections.map((section) => (
          <div key={section.id} className="space-y-1">
            <h3 className="text-xs font-semibold text-gray-600 px-2 mb-2">{section.title}</h3>
            {section.lessons.map((lesson) => (
              <div
                key={lesson.id}
                className={`flex items-center gap-x-2 px-3 py-2.5 rounded-lg text-sm font-medium transition cursor-pointer ${
                  lesson.id === 'les-2'
                    ? 'bg-blue-100/60 text-blue-700' // Giả lập bài học đang Active
                    : 'text-gray-600 hover:bg-gray-200/50'
                }`}
              >
                {lesson.isCompleted ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                ) : (
                  <Circle className="h-4 w-4 text-gray-400 shrink-0" />
                )}
                <span className="truncate flex-1">{lesson.title}</span>
                {lesson.type === 'VIDEO' && <PlayCircle className="h-3.5 w-3.5 text-gray-400" />}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

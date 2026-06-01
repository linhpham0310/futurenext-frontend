// src/app/(dashboard)/teacher/courses/page.tsx
import React from 'react';
import Link from 'next/link';
// Task S1-CM-05: Trang chính quản lý khóa học của Giảng viên
export default function TeacherCoursesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Khóa học của tôi</h1>
          <p className="text-gray-500 text-sm">Quản lý và cập nhật nội dung bài giảng AI-Native.</p>
        </div>
        {/* Nút điều hướng sang trang tạo khóa học (Sẽ làm ở Task 1.6) */}
        <Link
          href="/teacher/courses/create"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          + Tạo khóa học mới
        </Link>
      </div>
      {/* Placeholder cho danh sách khóa học */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="border-2 border-dashed border-gray-300 rounded-xl h-64 flex flex-col items-center justify-center text-gray-400">
          <p>Chưa có khóa học nào.</p>
          <p className="text-xs">Hãy nhấn &quot;Tạo khóa học mới&quot; để bắt đầu.</p>
        </div>
      </div>
    </div>
  );
}

// src/app/(dashboard)/layout.tsx
import React from 'react';
import Link from 'next/link'; // ✅ Thêm import Link
// Task S1-CM-05: Định nghĩa Layout tổng cho Dashboard

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Cố định bên trái */}
      <aside className="w-64 bg-white border-r hidden md:block">
        <div className="p-6 font-bold text-xl text-blue-600">FutureNext AI</div>
        <nav className="mt-6 px-4">
          <Link
            href="/teacher/courses"
            className="flex items-center p-3 bg-blue-50 text-blue-700 rounded-lg"
          >
            <span>📚 Quản lý khóa học</span>
          </Link>
          {/* Các menu khác sẽ thêm tại đây */}
        </nav>
      </aside>
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b flex items-center justify-between px-8">
          <h2 className="font-semibold text-gray-700">Teacher Dashboard</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">Giảng viên: Senior Dev</span>
            <div className="w-8 h-8 rounded-full bg-blue-500"></div>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-8">{children}</main>
      </div>
    </div>
  );
}

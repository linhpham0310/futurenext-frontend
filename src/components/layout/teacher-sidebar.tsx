// src/components/layout/SiteHeader.tsx
'use client';

import Link from 'next/link';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { TeacherMenu } from './teacher-menu';

export function TeacherHeader() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-blue-100">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/">
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-700 bg-clip-text text-transparent">
            FutureNext.ai
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/dashboard" className="text-slate-600 hover:text-blue-600">
            Trang chủ
          </Link>
          <Link href="/courses" className="text-slate-600 hover:text-blue-600">
            Khóa học
          </Link>
          <Link href="/teacher/courses" className="text-slate-600 hover:text-blue-600">
            Quản lý khóa học
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <TeacherMenu />
        </div>
      </div>
    </header>
  );
}

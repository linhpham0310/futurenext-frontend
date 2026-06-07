// src/app/(main)/my-courses/page.tsx
'use client';

import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function MyCoursesPage() {
  return (
    <div className="text-center py-12">
      <BookOpen className="h-12 w-12 mx-auto text-slate-300 mb-3" />
      <h2 className="text-xl font-semibold text-slate-700">Bạn chưa đăng ký khóa học nào</h2>
      <p className="text-slate-500 mt-2">Hãy bắt đầu hành trình học tập của bạn ngay hôm nay.</p>
      <Link href="/courses" className="mt-4 inline-block">
        <Button className="bg-blue-600">Khám phá khóa học</Button>
      </Link>
    </div>
  );
}

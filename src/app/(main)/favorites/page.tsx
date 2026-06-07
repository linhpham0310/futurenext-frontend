// src/app/(main)/favorites/page.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import Link from 'next/link';

export default function FavoritesPage() {
  return (
    <div className="text-center py-12">
      <Heart className="h-12 w-12 mx-auto text-slate-300 mb-3" />
      <h2 className="text-xl font-semibold text-slate-700">Tính năng đang phát triển</h2>
      <p className="text-slate-500 mt-2">Danh sách yêu thích sẽ sớm ra mắt.</p>
      <Link href="/courses" className="mt-4 inline-block">
        <Button className="bg-blue-600">Khám phá khóa học</Button>
      </Link>
    </div>
  );
}

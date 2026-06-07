// src/app/(main)/cart/page.tsx
'use client';

import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function CartPage() {
  return (
    <div className="text-center py-12">
      <ShoppingBag className="h-12 w-12 mx-auto text-slate-300 mb-3" />
      <h2 className="text-xl font-semibold text-slate-700">Tính năng đang phát triển</h2>
      <p className="text-slate-500 mt-2">Giỏ hàng sẽ sớm ra mắt.</p>
      <Link href="/courses" className="mt-4 inline-block">
        <Button className="bg-blue-600">Khám phá khóa học</Button>
      </Link>
    </div>
  );
}

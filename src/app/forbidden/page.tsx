import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';

export default function ForbiddenPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center space-y-4 bg-slate-50 text-center">
      <div className="rounded-full bg-red-100 p-4">
        <ShieldAlert className="h-12 w-12 text-red-600" />
      </div>
      <h1 className="text-4xl font-bold text-slate-900">403</h1>
      <h2 className="text-xl font-semibold text-slate-700">Truy cập bị từ chối</h2>
      <p className="max-w-md text-slate-500">
        Bạn không có quyền truy cập vào khu vực này. Trang này chỉ dành cho Quản trị viên hệ thống.
      </p>
      <div className="pt-4">
        <Button asChild>
          <Link href="/">Quay về trang chủ</Link>
        </Button>
      </div>
    </div>
  );
}

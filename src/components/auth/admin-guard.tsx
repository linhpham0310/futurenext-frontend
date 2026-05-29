'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/types';
import { useAuth } from '@/hooks/auth/useAuth';

interface AdminGuardProps {
  children: React.ReactNode;
}

export const AdminGuard = ({ children }: AdminGuardProps) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Nếu đang tải thông tin user thì không làm gì cả
    if (isLoading) return;

    // 1. Chưa đăng nhập -> Đá về Login
    if (!isAuthenticated) {
      router.replace('/sign-in');
      return;
    }

    // 2. Đã đăng nhập nhưng không phải Admin -> Đá về trang cấm hoặc trang chủ
    if (user && user.role !== UserRole.ADMIN) {
      router.replace('/forbidden'); // Hoặc router.push("/")
    }
  }, [user, isLoading, isAuthenticated, router]);

  // Hiển thị loading trong lúc chờ check quyền để tránh lộ giao diện
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary border-t-transparent" />
      </div>
    );
  }

  // Nếu không phải admin, return null (để useEffect xử lý redirect)
  if (!user || user.role !== UserRole.ADMIN) {
    return null;
  }

  // Nếu là Admin, render nội dung con
  return <>{children}</>;
};

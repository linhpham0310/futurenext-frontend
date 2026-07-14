'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  DollarSign,
  FileQuestion,
  Award,
  CreditCard,
  User,
  Settings,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/auth/useAuth';
import { Spinner } from '@/components/ui/spinner';

const teacherNavItems = [
  { href: '/teacher/dashboard', label: 'Bảng điều khiển', icon: LayoutDashboard },
  { href: '/teacher/courses', label: 'Khóa học', icon: BookOpen },
  { href: '/teacher/students', label: 'Học viên', icon: Users },
  { href: '/teacher/revenue', label: 'Doanh thu', icon: DollarSign },
  { href: '/teacher/exams', label: 'Bài kiểm tra', icon: FileQuestion },
  { href: '/teacher/certificates', label: 'Chứng chỉ', icon: Award },
  { href: '/teacher/payment', label: 'Thanh toán', icon: CreditCard },
  { href: '/teacher/profile', label: 'Hồ sơ', icon: User },
  { href: '/teacher/settings', label: 'Cài đặt', icon: Settings },
];

export function TeacherSidebar() {
  const pathname = usePathname();
  const { isLoggingOut, logout } = useAuth();

  return (
    <div className="w-64 border-r border-border bg-card flex flex-col h-[calc(100vh-4rem)] sticky top-16">
      <div className="p-4 flex-1 overflow-y-auto space-y-1">
        {teacherNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </div>
      <div className="p-4 border-t border-border">
        <button
          onClick={logout}
          disabled={isLoggingOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors w-full"
        >
          {isLoggingOut ? <Spinner className="h-4 w-4" /> : <LogOut className="h-4 w-4" />}
          {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
        </button>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth';
import {
  LayoutDashboard,
  Users,
  UserCog,
  GraduationCap,
  BookOpen,
  DollarSign,
  CreditCard,
  Settings,
  Megaphone,
  LogOut,
  Award,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const AdminSidebar = () => {
  const pathname = usePathname();
  const { logout } = useAuth();

  const mainMenus = [{ icon: LayoutDashboard, label: 'Bảng điều khiển', href: '/admin/dashboard' }];

  const userMenus = [
    { icon: Users, label: 'Quản lý người dùng', href: '/admin/users' },
    { icon: GraduationCap, label: 'Quản lý học viên', href: '/admin/students' },
    { icon: UserCog, label: 'Duyệt giáo viên', href: '/admin/teacher-profiles' },
  ];

  const courseMenus = [
    { icon: BookOpen, label: 'Quản lý khóa học', href: '/admin/courses' },
    { icon: Award, label: 'Chứng chỉ', href: '/admin/certificates' },
  ];

  const financeMenus = [
    { icon: DollarSign, label: 'Quản lý thanh toán', href: '/admin/payments' },
    { icon: DollarSign, label: 'Doanh thu', href: '/admin/revenue' },
    { icon: CreditCard, label: 'Đơn hàng', href: '/admin/orders' },
  ];

  const systemMenus = [{ icon: Megaphone, label: 'Truyền thông', href: '/admin/communications' }];

  const renderNavItems = (items: typeof mainMenus) =>
    items.map((item) => (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          'flex items-center gap-3 px-4 py-2.5 text-sm rounded-lg transition-all',
          pathname === item.href || pathname.startsWith(item.href + '/')
            ? 'bg-primary text-primary-foreground font-medium'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        )}
      >
        <item.icon className="h-5 w-5" />
        <span>{item.label}</span>
      </Link>
    ));

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col h-screen sticky top-0">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <Link href="/admin/dashboard">
          <span className="text-2xl font-bold tracking-tight text-foreground">
            FutureNext
          </span>
        </Link>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-6 overflow-y-auto">
        <div className="space-y-1">{renderNavItems(mainMenus)}</div>
        <div>
          <div className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Người dùng
          </div>
          {renderNavItems(userMenus)}
        </div>
        <div>
          <div className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Khóa học
          </div>
          {renderNavItems(courseMenus)}
        </div>
        <div>
          <div className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Tài chính
          </div>
          {renderNavItems(financeMenus)}
        </div>
        <div>
          <div className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Hệ thống
          </div>
          {renderNavItems(systemMenus)}
        </div>
      </nav>

      <div className="p-3 border-t border-border">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-2.5 text-sm rounded-lg w-full text-destructive hover:bg-destructive/10 transition-all"
        >
          <LogOut className="h-5 w-5" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};

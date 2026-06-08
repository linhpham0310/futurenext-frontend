// src/components/layout/admin-sidebar.tsx
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
  Settings,
  Megaphone,
  FileCheck,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const AdminSidebar = () => {
  const pathname = usePathname();
  const { logout } = useAuth();

  // Các nhóm menu
  const mainMenus = [{ icon: LayoutDashboard, label: 'Bảng điều khiển', href: '/admin/dashboard' }];

  const userMenus = [
    { icon: Users, label: 'Quản lý người dùng', href: '/admin/users' },
    { icon: GraduationCap, label: 'Quản lý học viên', href: '/admin/students' },
    { icon: UserCog, label: 'Duyệt giáo viên', href: '/admin/teacher-profiles' },
  ];

  const courseMenus = [{ icon: BookOpen, label: 'Quản lý khóa học', href: '/admin/courses' }];

  const financeMenus = [{ icon: DollarSign, label: 'Doanh thu', href: '/admin/revenue' }];

  const systemMenus = [
    { icon: Settings, label: 'Thiết lập', href: '/admin/settings' },
    { icon: Megaphone, label: 'Truyền thông', href: '/admin/communications' },
  ];

  const renderNavItems = (items: typeof mainMenus) =>
    items.map((item) => (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          'flex items-center gap-3 px-4 py-2.5 text-sm rounded-xl transition-all',
          pathname === item.href || pathname.startsWith(item.href + '/')
            ? 'bg-blue-600 text-white shadow-md'
            : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600'
        )}
      >
        <item.icon className="h-5 w-5" />
        <span>{item.label}</span>
      </Link>
    ));

  return (
    <aside className="w-64 bg-white/80 backdrop-blur-sm border-r border-blue-100 flex flex-col h-screen sticky top-0">
      <div className="h-16 flex items-center px-6 border-b border-blue-100">
        <Link href="/admin/dashboard">
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-700 bg-clip-text text-transparent">
            FutureNext.ai
          </span>
        </Link>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-6 overflow-y-auto">
        {/* Nhóm chính */}
        <div className="space-y-1">{renderNavItems(mainMenus)}</div>

        {/* Quản lý người dùng */}
        <div>
          <div className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Người dùng
          </div>
          {renderNavItems(userMenus)}
        </div>

        {/* Quản lý khóa học */}
        <div>
          <div className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Khóa học
          </div>
          {renderNavItems(courseMenus)}
        </div>

        {/* Tài chính */}
        <div>
          <div className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Tài chính
          </div>
          {renderNavItems(financeMenus)}
        </div>

        {/* Hệ thống */}
        <div>
          <div className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Hệ thống
          </div>
          {renderNavItems(systemMenus)}
        </div>
      </nav>

      <div className="p-3 border-t border-blue-100">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-2.5 text-sm rounded-xl w-full text-red-600 hover:bg-red-50 transition-all"
        >
          <LogOut className="h-5 w-5" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};

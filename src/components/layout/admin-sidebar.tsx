// src/components/layout/admin-sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth'; //  Import useAuth
import { LayoutDashboard, Users, UserCog, FileCheck, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

export const AdminSidebar = () => {
  const pathname = usePathname();
  const { logout } = useAuth();
  //  Menu cho Admin
  const navItems = [
    { icon: LayoutDashboard, label: 'Bảng điều khiển', href: '/admin/dashboard' },
    { icon: Users, label: 'Quản lý người dùng', href: '/admin/users' },
    { icon: UserCog, label: 'Duyệt giáo viên', href: '/admin/teacher-profiles' },
    { icon: FileCheck, label: 'Duyệt khóa học', href: '/admin/review' },
  ];

  return (
    <aside className="w-64 bg-white/80 backdrop-blur-sm border-r border-blue-100 flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-blue-100">
        <Link href="/">
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-700 bg-clip-text text-transparent">
            FutureNext.ai
          </span>
        </Link>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-4 py-2.5 text-sm rounded-xl transition-all',
              pathname === item.href
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600'
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        ))}
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

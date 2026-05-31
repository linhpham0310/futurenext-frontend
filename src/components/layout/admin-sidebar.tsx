// src/components/layout/admin-sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth'; //  Import useAuth
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Settings,
  DollarSign,
  MessageSquare,
  UserCircle,
  GraduationCap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

//  Menu cho Admin
const adminMenuItems = [
  { icon: LayoutDashboard, label: 'Bảng điều khiển', href: '/admin' },
  { icon: BookOpen, label: 'Khóa học', href: '/admin/courses' },
  { icon: MessageSquare, label: 'Truyền thông', href: '/admin/communications' },
  { icon: DollarSign, label: 'Doanh thu', href: '/admin/revenue' },
  { icon: Users, label: 'Học viên', href: '/admin/students' },
  { icon: UserCircle, label: 'Giảng viên', href: '/admin/teachers' },
  { icon: Settings, label: 'Thiết lập', href: '/admin/settings' },
];

//  Menu cho Teacher
const teacherMenuItems = [
  { icon: LayoutDashboard, label: 'Bảng điều khiển', href: '/teacher/dashboard' },
  { icon: BookOpen, label: 'Quản lý khóa học', href: '/teacher/courses' },
  { icon: Users, label: 'Học viên của tôi', href: '/teacher/students' },
  { icon: DollarSign, label: 'Doanh thu', href: '/teacher/revenue' },
];

export const AdminSidebar = () => {
  const pathname = usePathname();
  const { isAdmin, isTeacher } = useAuth(); //  Lấy role

  // Nếu không có quyền gì, không hiển thị
  if (!isAdmin && !isTeacher) return null;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
      <div className="p-6 border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-900">{isAdmin ? 'Admin' : 'Giảng viên'}</h1>
        <p className="text-xs text-slate-500 mt-1">SpaceTime</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {/* Menu cho Admin */}
        {isAdmin &&
          adminMenuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}

        {/* Menu cho Teacher (chỉ hiển thị nếu không phải Admin) */}
        {isTeacher && !isAdmin && (
          <>
            <div className="pt-4 mt-2">
              <p className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Khu vực giảng viên
              </p>
            </div>
            {teacherMenuItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* Footer / User info */}
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
            <span className="text-sm font-medium text-slate-600">A</span>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900">
              {isAdmin ? 'Admin' : isTeacher ? 'Giảng viên' : 'User'}
            </p>
            <p className="text-xs text-slate-500">
              {isAdmin ? 'Quản trị viên' : isTeacher ? 'Giảng viên' : 'Thành viên'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

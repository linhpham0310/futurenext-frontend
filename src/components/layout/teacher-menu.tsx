'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/hooks/auth/useAuth';
import { getInitials } from '@/lib/utils';
import {
  User,
  LogOut,
  Settings,
  LayoutDashboard,
  BookOpen,
  FileQuestion,
  DollarSign,
  Users,
  Award,
  CreditCard,
} from 'lucide-react';
import Link from 'next/link';

export function TeacherMenu() {
  const { user, isLoggingOut, logout } = useAuth();

  if (!user) {
    return (
      <Link href="/sign-in">
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
          Đăng nhập
        </Button>
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
          <Avatar className="h-10 w-10 border-2 border-blue-200">
            <AvatarImage src={user.avatarUrl || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
              {getInitials(user.fullName)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.fullName}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link href="/teacher/dashboard">
          <DropdownMenuItem className="cursor-pointer">
            <LayoutDashboard className="mr-2 h-4 w-4" /> Trang chủ
          </DropdownMenuItem>
        </Link>
        <Link href="/teacher/courses">
          <DropdownMenuItem className="cursor-pointer">
            <BookOpen className="mr-2 h-4 w-4" /> Khóa học
          </DropdownMenuItem>
        </Link>
        <Link href="/teacher/students">
          <DropdownMenuItem className="cursor-pointer">
            <Users className="mr-2 h-4 w-4" /> Học viên
          </DropdownMenuItem>
        </Link>
        <Link href="/teacher/revenue">
          <DropdownMenuItem className="cursor-pointer">
            <DollarSign className="mr-2 h-4 w-4" /> Doanh thu
          </DropdownMenuItem>
        </Link>
        <Link href="/teacher/exams">
          <DropdownMenuItem className="cursor-pointer">
            <FileQuestion className="mr-2 h-4 w-4" /> Quiz
          </DropdownMenuItem>
        </Link>
        <Link href="/teacher/certificates">
          <DropdownMenuItem className="cursor-pointer">
            <Award className="mr-2 h-4 w-4" /> Chứng chỉ
          </DropdownMenuItem>
        </Link>
        <Link href="/teacher/payment">
          <DropdownMenuItem className="cursor-pointer">
            <CreditCard className="mr-2 h-4 w-4" /> Thanh toán
          </DropdownMenuItem>
        </Link>
        <Link href="/teacher/profile">
          <DropdownMenuItem className="cursor-pointer">
            <User className="mr-2 h-4 w-4" /> Hồ sơ
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <Link href="/teacher/settings">
          <DropdownMenuItem className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" /> Cài đặt
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={logout}
          disabled={isLoggingOut}
          className="text-red-600 focus:text-red-600 cursor-pointer"
        >
          {isLoggingOut ? (
            <Spinner className="mr-2 h-4 w-4" />
          ) : (
            <LogOut className="mr-2 h-4 w-4" />
          )}
          <span>{isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

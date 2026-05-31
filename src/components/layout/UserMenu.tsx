// src/components/layout/UserMenu.tsx
'use client';

import { useAuth } from '@/hooks/auth/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Spinner } from '@/components/ui/spinner';
import { LifeBuoy, LogOut, User as UserIcon, Settings, GraduationCap } from 'lucide-react';
import Link from 'next/link';

export function UserMenu() {
  const { user, logout, isLoggingOut, isTeacher, isAdmin } = useAuth(); //  Thêm isTeacher, isAdmin

  const handleLogoutClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isLoggingOut) {
      logout();
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-muted animate-pulse" />
    );
  }

  const getInitials = (fullName: string): string => {
    return fullName
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
          <Avatar className="h-10 w-10 border border-border/40">
            <AvatarImage src={user.avatarUrl || undefined} alt={user.fullName || 'User Avatar'} />
            <AvatarFallback className="bg-muted text-muted-foreground font-semibold">
              {getInitials(user.fullName)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none truncate">{user.fullName}</p>
            <p className="text-xs leading-none text-muted-foreground truncate">{user.email}</p>
          </div>
          {/*  Badge role */}
          <div className="flex gap-1 mt-2">
            {isTeacher && (
              <span className="inline-block px-2 py-0.5 text-xs font-semibold bg-indigo-100 text-indigo-700 rounded">
                Giảng viên
              </span>
            )}
            {isAdmin && (
              <span className="inline-block px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-700 rounded">
                Quản trị viên
              </span>
            )}
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <Link href="/profile" passHref legacyBehavior>
            <DropdownMenuItem className="cursor-pointer">
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Hồ sơ</span>
            </DropdownMenuItem>
          </Link>

          {/*  Menu Teacher */}
          {isTeacher && (
            <Link href="/teacher/dashboard" passHref legacyBehavior>
              <DropdownMenuItem className="cursor-pointer">
                <GraduationCap className="mr-2 h-4 w-4" />
                <span>Khu vực giảng viên</span>
              </DropdownMenuItem>
            </Link>
          )}

          <DropdownMenuItem className="cursor-pointer" disabled>
            <Settings className="mr-2 h-4 w-4" />
            <span>Cài đặt</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" disabled>
            <LifeBuoy className="mr-2 h-4 w-4" />
            <span>Hỗ trợ</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleLogoutClick}
          disabled={isLoggingOut}
          className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
        >
          {isLoggingOut ? (
            <Spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="mr-2 h-4 w-4" />
          )}
          <span>{isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/auth/useAuth';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './theme-toggle';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function PublicHeader() {
  const { user, isAuthenticated } = useAuth();

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-40 shadow-sm">
      {/* Logo */}
      <Link href="/" className="flex items-center shrink-0">
        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-700 bg-clip-text text-transparent">
          FutureNext.ai
        </span>
      </Link>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        <ThemeToggle />

        {isAuthenticated && user ? (
          <Link href="/dashboard">
            <Button variant="outline" className="gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-xs font-medium">
                  {getInitials(user.fullName)}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
          </Link>
        ) : (
          <>
            <Link href="/sign-in">
              <Button variant="ghost" className="hidden sm:inline-flex">
                Đăng nhập
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Đăng ký</Button>
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

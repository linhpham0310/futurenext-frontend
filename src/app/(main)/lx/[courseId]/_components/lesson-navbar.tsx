'use client';

import { ArrowLeft, MessageSquareCode, User } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/auth/useAuth';

interface LessonNavbarProps {
  courseTitle: string;
  isAiOpen: boolean;
  onToggleAi: () => void;
}

export const LessonNavbar = ({ courseTitle, isAiOpen, onToggleAi }: LessonNavbarProps) => {
  const { user } = useAuth();
  const initial = user?.fullName?.charAt(0) || 'U';

  return (
    <div className="h-16 border-b border-border bg-background/95  flex items-center justify-between px-6 shadow-sm z-50 sticky top-0">
      <div className="flex items-center gap-x-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden md:inline font-medium">Rời không gian học</span>
        </Link>
        <div className="h-6 w-[1px] bg-border hidden md:block" />
        <h1 className="font-semibold text-foreground line-clamp-1 max-w-[300px] md:max-w-xl text-base">
          {courseTitle}
        </h1>
      </div>
      <div className="flex items-center gap-x-3">
        <button
          onClick={onToggleAi}
          className={`flex items-center gap-x-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all shadow-sm ${
            isAiOpen
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-background border-border text-foreground hover:bg-muted'
          }`}
        >
          <MessageSquareCode className="h-4 w-4" />
          <span className="hidden sm:inline">Trợ giảng AI</span>
        </button>
        <Avatar className="h-8 w-8 border border-border">
          <AvatarFallback className="bg-muted text-foreground text-xs font-bold">
            {initial}
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
};

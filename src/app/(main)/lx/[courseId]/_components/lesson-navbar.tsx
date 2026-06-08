'use client';

import { ArrowLeft, MessageSquareCode } from 'lucide-react';
import Link from 'next/link';

interface LessonNavbarProps {
  courseTitle: string;
  isAiOpen: boolean;
  onToggleAi: () => void;
}

export const LessonNavbar = ({ courseTitle, isAiOpen, onToggleAi }: LessonNavbarProps) => {
  return (
    <div className="h-16 border-b bg-white flex items-center justify-between px-6 shadow-sm z-50">
      <div className="flex items-center gap-x-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-x-2 text-sm text-gray-600 hover:text-gray-900 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden md:inline font-medium">Rời không gian học</span>
        </Link>
        <div className="h-4 w-[1px] bg-gray-200 hidden md:block" />
        <h1 className="font-semibold text-gray-800 line-clamp-1 max-w-[300px] md:max-w-xl">
          {courseTitle}
        </h1>
      </div>
      <button
        onClick={onToggleAi}
        className={`flex items-center gap-x-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition shadow-sm ${isAiOpen ? 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
      >
        <MessageSquareCode className="h-4 w-4" />
        <span>Trợ giảng AI</span>
      </button>
    </div>
  );
};

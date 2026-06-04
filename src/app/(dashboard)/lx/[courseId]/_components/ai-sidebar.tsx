'use client';
import React from 'react';
import { Bot, Sparkles } from 'lucide-react';
interface AiSidebarProps {
  isOpen: boolean;
}
// TASK: LX-FE-1.1: Cửa sổ Trợ giảng AI (Collapsible Panel)
export const AiSidebar = ({ isOpen }: AiSidebarProps) => {
  if (!isOpen) return null;
  return (
    <div className="w-96 h-full border-l bg-white flex flex-col shadow-xl animate-in slide-in-from-right duration-200">
      {/* AI Header */}
      <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center gap-x-2">
        <div className="p-2 bg-blue-600 rounded-lg text-white">
          <Bot className="h-4 w-4" />
        </div>
        <div>
          <h2 className="font-bold text-sm text-gray-800 flex items-center gap-x-1">
            Trợ giảng AI FutureNext <Sparkles className="h-3 w-3 text-amber-500 fill-amber-500" />
          </h2>
          <p className="text-[11px] text-gray-500">Sẵn sàng giải đáp theo ngữ cảnh bài học</p>
        </div>
      </div>
      {/* Khung chat tạm thời (Sẽ tích hợp sâu ở Sprint 3) */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50/50 flex flex-col justify-center items-center text-center text-gray-400 space-y-2">
        <Bot className="h-8 w-8 text-gray-300" />
        <p className="text-xs">Chưa có cuộc hội thoại nào.</p>
        <p className="text-[11px] max-w-[200px]">
          Hãy đặt câu hỏi nếu bạn gặp khó khăn trong bài học này!
        </p>
      </div>
      {/* Input box tạm thời */}
      <div className="p-3 border-t bg-white">
        <div className="flex gap-x-2">
          <input
            type="text"
            placeholder="Hỏi AI về bài học này..."
            className="flex-1 px-3 py-1.5 text-sm border rounded-lg outline-none bg-gray-50 focus:bg-white focus:ring-1 focus:ring-blue-500 transition"
            disabled
          />
        </div>
      </div>
    </div>
  );
};

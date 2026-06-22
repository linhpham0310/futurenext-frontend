'use client';

import { Bot, Sparkles, Send, User as UserIcon } from 'lucide-react';
import { useState } from 'react';
import { useLXStore } from '@/store/use-lx-store';
import { studentApi } from '@/lib/api';
import { toast } from 'sonner';

interface AiSidebarProps {
  isOpen: boolean;
}

export const AiSidebar = ({ isOpen }: AiSidebarProps) => {
  const { activeLesson } = useLXStore();
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAsk = async () => {
    if (!question.trim()) return;
    const userMsg = { role: 'user' as const, content: question };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    try {
      const res = await studentApi.askAi({
        lessonId: activeLesson?.id,
        question,
      });
      const assistantMsg = { role: 'assistant' as const, content: res.data.answer };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      toast.error('Không thể nhận câu trả lời từ AI');
    } finally {
      setLoading(false);
      setQuestion('');
    }
  };

  return (
    <div className="w-96 h-full border-l bg-white flex flex-col shadow-2xl transition-transform duration-300">
      <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center gap-x-3">
        <div className="p-2 bg-blue-600 rounded-xl text-white shadow-md">
          <Bot className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-bold text-sm text-gray-800 flex items-center gap-x-1">
            Trợ giảng AI
            <Sparkles className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
          </h2>
          <p className="text-[11px] text-gray-500">Hỏi đáp theo ngữ cảnh bài học</p>
        </div>
      </div>
      <div className="flex-1 p-4 overflow-y-auto bg-slate-50/50 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 space-y-3">
            <Bot className="h-10 w-10 text-gray-300" />
            <p className="text-sm font-medium">Chưa có câu hỏi nào</p>
            <p className="text-xs max-w-[200px]">
              Hãy đặt câu hỏi về bài học để được trợ giảng AI hỗ trợ
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className="flex items-start gap-2 max-w-[85%]">
                {msg.role === 'assistant' && (
                  <div className="p-1.5 bg-blue-100 rounded-full">
                    <Bot className="h-4 w-4 text-blue-600" />
                  </div>
                )}
                <div
                  className={`p-3 rounded-2xl text-sm shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
                  }`}
                >
                  {msg.content}
                </div>
                {msg.role === 'user' && (
                  <div className="p-1.5 bg-gray-200 rounded-full">
                    <UserIcon className="h-4 w-4 text-gray-600" />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 bg-white border border-gray-200 p-3 rounded-2xl rounded-bl-none shadow-sm">
              <div className="animate-pulse flex gap-1">
                <span className="h-2 w-2 bg-blue-400 rounded-full"></span>
                <span className="h-2 w-2 bg-blue-400 rounded-full animation-delay-200"></span>
                <span className="h-2 w-2 bg-blue-400 rounded-full animation-delay-400"></span>
              </div>
              <span className="text-sm text-gray-500">Đang suy nghĩ...</span>
            </div>
          </div>
        )}
      </div>
      <div className="p-3 border-t bg-white">
        <div className="flex gap-x-2">
          <input
            type="text"
            placeholder="Hỏi AI về bài học này..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
            className="flex-1 px-3 py-2 text-sm border rounded-xl outline-none bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-400 transition-all"
          />
          <button
            onClick={handleAsk}
            disabled={loading}
            className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-blue-300 transition-colors shadow-md"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

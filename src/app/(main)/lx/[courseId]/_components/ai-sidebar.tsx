'use client';

import { Bot, Sparkles, Send } from 'lucide-react';
import { useState } from 'react';
import { useLXStore } from '@/store/use-lx-store';
import { apiClient } from '@/lib/api';
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
      const res = await apiClient.post('/student/ai/ask', { lessonId: activeLesson?.id, question });
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
    <div className="w-96 h-full border-l bg-white flex flex-col shadow-xl">
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
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50/50 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 space-y-2">
            <Bot className="h-8 w-8 text-gray-300" />
            <p className="text-xs">Hãy đặt câu hỏi về bài học này</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
              >
                {msg.content}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 p-3 rounded-lg text-sm">Đang suy nghĩ...</div>
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
            className="flex-1 px-3 py-1.5 text-sm border rounded-lg outline-none bg-gray-50 focus:bg-white focus:ring-1 focus:ring-blue-500"
          />
          <button
            onClick={handleAsk}
            disabled={loading}
            className="p-2 bg-blue-600 text-white rounded-lg"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

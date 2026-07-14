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
    <div className="w-96 h-full border-l border-border bg-card flex flex-col transition-transform duration-300">
      <div className="p-4 border-b border-border flex items-center gap-x-3">
        <div className="p-2 bg-primary rounded-xl text-primary-foreground">
          <Bot className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-bold text-sm text-foreground flex items-center gap-x-1">
            Trợ giảng AI
            <Sparkles className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
          </h2>
          <p className="text-[11px] text-muted-foreground">Hỏi đáp theo ngữ cảnh bài học</p>
        </div>
      </div>
      <div className="flex-1 p-4 overflow-y-auto bg-muted/30 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground space-y-3">
            <Bot className="h-10 w-10 text-muted-foreground/40" />
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
                  <div className="p-1.5 bg-muted rounded-full">
                    <Bot className="h-4 w-4 text-foreground" />
                  </div>
                )}
                <div
                  className={`p-3 rounded-xl text-sm shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-none'
                      : 'bg-card border border-border text-foreground rounded-bl-none'
                  }`}
                >
                  {msg.content}
                </div>
                {msg.role === 'user' && (
                  <div className="p-1.5 bg-muted rounded-full">
                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 bg-card border border-border p-3 rounded-xl rounded-bl-none shadow-sm">
              <div className="animate-pulse flex gap-1">
                <span className="h-2 w-2 bg-muted-foreground/40 rounded-full"></span>
                <span className="h-2 w-2 bg-muted-foreground/40 rounded-full animation-delay-200"></span>
                <span className="h-2 w-2 bg-muted-foreground/40 rounded-full animation-delay-400"></span>
              </div>
              <span className="text-sm text-muted-foreground">Đang suy nghĩ...</span>
            </div>
          </div>
        )}
      </div>
      <div className="p-3 border-t border-border bg-card">
        <div className="flex gap-x-2">
          <input
            type="text"
            placeholder="Hỏi AI về bài học này..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
            className="flex-1 px-3 py-2 text-sm border border-border rounded-xl outline-none bg-background focus:bg-background focus:ring-2 focus:ring-ring transition-all"
          />
          <button
            onClick={handleAsk}
            disabled={loading}
            className="p-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import { studentApi } from '@/lib/api';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { BackButton } from '@/components/ui/back-button';

interface Question {
  id: string;
  courseTitle: string;
  question: string;
  answer?: string;
  answeredAt?: string;
  createdAt: string;
}

export default function StudentQuestionsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      studentApi
        .getMyQuestions()
        .then((res) => setQuestions(res.data))
        .catch(() => toast.error('Không thể tải câu hỏi'))
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (authLoading || loading)
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Câu hỏi của tôi</h1>
      </div>
      {questions.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/60 mb-3" />
          <h2 className="text-xl font-semibold">Chưa có câu hỏi nào</h2>
          <p className="text-muted-foreground">Đặt câu hỏi trong các khóa học của bạn.</p>
          <Link href="/my-courses" className="mt-4 inline-block">
            <Button className="bg-primary">Xem khóa học</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q) => (
            <Card key={q.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-muted-foreground">Khóa học: {q.courseTitle}</p>
                    <p className="font-medium mt-1">{q.question}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(q.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  {q.answer && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
                    >
                      {expandedId === q.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
                {expandedId === q.id && q.answer && (
                  <div className="mt-3 p-3 bg-muted/50 rounded-md">
                    <p className="text-sm font-medium text-foreground">Trả lời:</p>
                    <p className="text-sm">{q.answer}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {q.answeredAt && new Date(q.answeredAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

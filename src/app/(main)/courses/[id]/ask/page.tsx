'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth';
import { studentApi } from '@/lib/api';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { BackButton } from '@/components/ui/back-button';

export default function AskQuestionPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [question, setQuestion] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để đặt câu hỏi');
      return;
    }
    if (!question.trim()) {
      toast.error('Vui lòng nhập câu hỏi');
      return;
    }
    setSubmitting(true);
    try {
      await studentApi.askQuestion(id as string, { question: question.trim() });
      toast.success('Câu hỏi đã được gửi');
      router.push(`/courses/${id}`);
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || 'Gửi câu hỏi thất bại';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Đặt câu hỏi</h1>
        <BackButton />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Câu hỏi của bạn</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nội dung câu hỏi</label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={5}
              placeholder="Nhập câu hỏi của bạn về khóa học này..."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <Button onClick={handleSubmit} disabled={submitting} className="w-full">
            {submitting ? 'Đang gửi...' : 'Gửi câu hỏi'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

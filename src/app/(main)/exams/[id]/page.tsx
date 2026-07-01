'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth';
import { studentApi } from '@/lib/api';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { BackButton } from '@/components/ui/back-button';

interface ExamInfo {
  id: string;
  title: string;
  description: string;
  duration: number;
  totalQuestions: number;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
}

export default function ExamDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [exam, setExam] = useState<ExamInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && id) {
      studentApi
        .getExamInfo(id as string)
        .then((res) => setExam(res.data))
        .catch(() => toast.error('Không thể tải thông tin đề thi'))
        .finally(() => setLoading(false));
    }
  }, [id, user]);

  const handleStart = () => {
    if (exam?.status === 'NOT_STARTED') {
      router.push(`/exams/${id}/take`);
    } else if (exam?.status === 'IN_PROGRESS') {
      router.push(`/exams/${id}/take`);
    } else if (exam?.status === 'COMPLETED') {
      router.push(`/exams/${id}/result`);
    }
  };

  if (authLoading || loading)
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  if (!exam) return <div className="text-center py-12">Không tìm thấy đề thi.</div>;

  const getButtonText = () => {
    switch (exam.status) {
      case 'NOT_STARTED':
        return 'Bắt đầu làm bài';
      case 'IN_PROGRESS':
        return 'Tiếp tục làm bài';
      case 'COMPLETED':
        return 'Xem kết quả';
      default:
        return 'Bắt đầu';
    }
  };

  const getStatusBadge = () => {
    switch (exam.status) {
      case 'NOT_STARTED':
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">Chưa làm</span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
            Đang làm
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
            Đã hoàn thành
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <BackButton />
        <h1 className="text-2xl font-bold">Chi tiết bài thi</h1>
      </div>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-2xl">{exam.title}</CardTitle>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{exam.description || 'Không có mô tả.'}</p>
          <div className="flex gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span>Thời gian: {exam.duration} phút</span>
            </div>
            <div>
              <span>Số câu hỏi: {exam.totalQuestions}</span>
            </div>
          </div>
          {exam.status === 'IN_PROGRESS' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-2 text-yellow-800 text-sm">
              <AlertCircle className="h-4 w-4" />
              Bạn đã bắt đầu bài thi này nhưng chưa hoàn thành. Hãy tiếp tục.
            </div>
          )}
          <Button onClick={handleStart} className="w-full" size="lg">
            {getButtonText()}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/auth/useAuth';
import { studentApi } from '@/lib/api';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface AssignedExam {
  id: string;
  title: string;
  duration: number;
  deadline?: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  score?: number;
}

export default function StudentExamsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [exams, setExams] = useState<AssignedExam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      studentApi
        .getAssignedExams()
        .then((res) => setExams(res.data))
        .catch(() => toast.error('Không thể tải bài kiểm tra'))
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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Bài kiểm tra của tôi</h1>
      {exams.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">Chưa có bài kiểm tra nào.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exams.map((exam) => (
            <Card key={exam.id}>
              <CardContent className="p-4 space-y-2">
                <h3 className="font-bold text-lg">{exam.title}</h3>
                <p className="text-sm">Thời gian: {exam.duration} phút</p>
                <p className="text-sm">
                  Trạng thái:{' '}
                  {exam.status === 'NOT_STARTED'
                    ? 'Chưa làm'
                    : exam.status === 'IN_PROGRESS'
                      ? 'Đang làm'
                      : 'Đã hoàn thành'}
                </p>
                {exam.status === 'COMPLETED' && (
                  <p className="text-sm font-medium">Điểm: {exam.score}/10</p>
                )}
                {exam.status === 'NOT_STARTED' && (
                  <Link href={`/exams/${exam.id}/take`}>
                    <Button className="mt-2 w-full">Làm bài</Button>
                  </Link>
                )}
                {exam.status === 'IN_PROGRESS' && (
                  <Link href={`/exams/${exam.id}/take`}>
                    <Button variant="outline" className="mt-2 w-full">
                      Tiếp tục
                    </Button>
                  </Link>
                )}
                {exam.status === 'COMPLETED' && (
                  <Link href={`/exams/${exam.id}/result`}>
                    <Button variant="outline" className="mt-2 w-full">
                      Xem kết quả
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

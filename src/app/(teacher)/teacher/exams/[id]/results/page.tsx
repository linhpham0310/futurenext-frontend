'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth';
import { teacherApi } from '@/lib/api';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

interface StudentResult {
  studentId: string;
  studentName: string;
  email: string;
  score: number | null;
  submittedAt: string | null;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
}

export default function ExamResultsPage() {
  const { id } = useParams();
  const { isTeacher, isLoading: authLoading } = useAuth();
  const [results, setResults] = useState<StudentResult[]>([]);
  const [examTitle, setExamTitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isTeacher && id) {
      teacherApi
        .getExamResults(id as string)
        .then((res) => {
          setExamTitle(res.data.examTitle);
          setResults(res.data.results);
        })
        .catch(() => toast.error('Không thể tải kết quả'))
        .finally(() => setLoading(false));
    }
  }, [id, isTeacher]);

  if (authLoading || loading)
    return (
      <div className="p-8 flex justify-center">
        <Spinner />
      </div>
    );
  if (!isTeacher) return null;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Kết quả bài thi: {examTitle}</h1>
      <Card>
        <CardHeader>
          <CardTitle>Danh sách học viên</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>Học viên</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Điểm</TableCell>
                <TableCell>Thời gian nộp</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((s) => (
                <TableRow key={s.studentId}>
                  <TableCell className="font-medium">{s.studentName}</TableCell>
                  <TableCell>{s.email}</TableCell>
                  <TableCell>
                    {s.status === 'COMPLETED'
                      ? '✅ Đã nộp'
                      : s.status === 'IN_PROGRESS'
                        ? '🟡 Đang làm'
                        : '⚪ Chưa bắt đầu'}
                  </TableCell>
                  <TableCell>{s.score !== null ? `${s.score}/10` : '--'}</TableCell>
                  <TableCell>
                    {s.submittedAt ? new Date(s.submittedAt).toLocaleString('vi-VN') : '--'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

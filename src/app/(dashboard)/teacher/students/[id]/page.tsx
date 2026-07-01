'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth';
import { teacherApi } from '@/lib/api';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { BackButton } from '@/components/ui/back-button';

interface StudentDetail {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  enrolledAt: string;
  progress: number;
  courseProgress: {
    courseId: string;
    courseTitle: string;
    progress: number;
    lastActiveAt: string;
  }[];
}

export default function StudentDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isTeacher, isLoading: authLoading } = useAuth();
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isTeacher) router.push('/forbidden');
  }, [isTeacher, authLoading, router]);

  useEffect(() => {
    if (isTeacher && id) {
      teacherApi
        .getStudentDetail(id as string)
        .then((res) => setStudent(res.data))
        .catch(() => toast.error('Không thể tải thông tin học viên'))
        .finally(() => setLoading(false));
    }
  }, [id, isTeacher]);

  if (authLoading || loading)
    return (
      <div className="p-8 flex justify-center">
        <Spinner />
      </div>
    );
  if (!isTeacher || !student) return null;

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-blue-100 text-blue-700 text-xl">
              {getInitials(student.fullName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{student.fullName}</h1>
            <p className="text-muted-foreground">{student.email}</p>
            <p className="text-sm">
              Tham gia: {new Date(student.enrolledAt).toLocaleDateString('vi-VN')}
            </p>
          </div>
        </div>
        <BackButton />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tiến độ tổng quan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Progress value={student.progress} className="flex-1" />
            <span className="font-bold">{student.progress}%</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tiến độ theo khóa học</CardTitle>
        </CardHeader>
        <CardContent>
          {student.courseProgress.length === 0 ? (
            <p className="text-muted-foreground">Học viên chưa tham gia khóa học nào.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Khóa học</TableCell>
                  <TableCell>Tiến độ</TableCell>
                  <TableCell>Hoạt động gần nhất</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {student.courseProgress.map((cp) => (
                  <TableRow key={cp.courseId}>
                    <TableCell className="font-medium">{cp.courseTitle}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={cp.progress} className="w-32" />
                        <span className="text-sm">{cp.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {cp.lastActiveAt
                        ? new Date(cp.lastActiveAt).toLocaleDateString('vi-VN')
                        : 'Chưa hoạt động'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

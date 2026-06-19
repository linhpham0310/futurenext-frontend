'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth';
import { apiClient, teacherApi } from '@/lib/api';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';

interface CourseStudent {
  id: string;
  fullName: string;
  email: string;
  progress: number;
  joinedAt: string;
  lastActiveAt?: string;
}

export default function CourseStudentsPage() {
  const { id } = useParams();
  const { isTeacher, isLoading: authLoading } = useAuth();
  const [students, setStudents] = useState<CourseStudent[]>([]);
  const [courseTitle, setCourseTitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isTeacher && id) {
      Promise.all([
        teacherApi.getCourseDetail(id as string),
        teacherApi.getCourseStudents(id as string),
      ])
        .then(([courseRes, studentsRes]) => {
          setCourseTitle(courseRes.data.title);
          setStudents(studentsRes.data);
        })
        .catch(() => toast.error('Không thể tải danh sách học viên'))
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
      <div>
        <h1 className="text-2xl font-bold">Học viên khóa học: {courseTitle}</h1>
        <p className="text-muted-foreground">Quản lý tiến độ và thông tin học viên.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách học viên ({students.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Chưa có học viên nào đăng ký khóa học này.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Học viên</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Tiến độ</TableCell>
                  <TableCell>Ngày tham gia</TableCell>
                  <TableCell>Hoạt động gần nhất</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                            {getInitials(student.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{student.fullName}</span>
                      </div>
                    </TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={student.progress} className="w-32" />
                        <span className="text-sm font-medium">{student.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{new Date(student.joinedAt).toLocaleDateString('vi-VN')}</TableCell>
                    <TableCell>
                      {student.lastActiveAt
                        ? new Date(student.lastActiveAt).toLocaleDateString('vi-VN')
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

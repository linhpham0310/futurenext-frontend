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

const formatDateSafe = (dateString?: string | null): string => {
  if (!dateString) return '--';
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? '--' : date.toLocaleDateString('vi-VN');
};

interface CourseProgress {
  courseId: string;
  courseTitle: string;
  progress: number;
  lastActiveAt: string | null;
}

interface StudentDetail {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  enrolledAt: string;
  progress: number;
  courseProgress: CourseProgress[];
}

export default function StudentDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isTeacher, isLoading: authLoading } = useAuth();
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isTeacher) router.push('/forbidden');
  }, [isTeacher, authLoading, router]);

  useEffect(() => {
    if (isTeacher && id) {
      setLoading(true);
      setError(null);
      teacherApi
        .getStudentDetail(id as string)
        .then((res) => {
          console.log('📦 Raw student detail:', res);

          let rawData = res.data;
          if (!rawData) throw new Error('Dữ liệu trả về rỗng');

          // Xử lý lồng data
          if (rawData.data && typeof rawData.data === 'object' && !Array.isArray(rawData.data)) {
            rawData = rawData.data;
          }

          console.log('📦 Processed student data:', rawData);

          if (!rawData.id || !rawData.fullName) {
            throw new Error('Dữ liệu không đủ thông tin');
          }

          const courseProgress = Array.isArray(rawData.courseProgress)
            ? rawData.courseProgress
            : [];

          const courseProgressMapped: CourseProgress[] = courseProgress.map((cp: any) => ({
            courseId: cp.courseId || '',
            courseTitle: cp.courseTitle || cp.title || 'Không có tên',
            progress: typeof cp.progress === 'number' ? cp.progress : 0,
            lastActiveAt: cp.lastActiveAt || null,
          }));

          // Tính progress tổng quan từ courseProgress
          const overallProgress = courseProgressMapped.length
            ? Math.round(
                courseProgressMapped.reduce((sum, cp) => sum + cp.progress, 0) /
                  courseProgressMapped.length
              )
            : 0;

          const studentData: StudentDetail = {
            id: rawData.id,
            fullName: rawData.fullName,
            email: rawData.email || '',
            avatarUrl: rawData.avatarUrl || undefined,
            enrolledAt: rawData.enrolledAt || rawData.joinedAt || rawData.createdAt || '',
            // Ưu tiên rawData.progress nếu có, nếu không dùng overallProgress
            progress: typeof rawData.progress === 'number' ? rawData.progress : overallProgress,
            courseProgress: courseProgressMapped,
          };

          setStudent(studentData);
        })
        .catch((err) => {
          console.error('❌ Error:', err);
          const msg =
            err?.response?.data?.message || err?.message || 'Không thể tải thông tin học viên';
          setError(msg);
          toast.error(msg);
        })
        .finally(() => setLoading(false));
    }
  }, [id, isTeacher]);

  if (authLoading || loading) {
    return (
      <div className="p-8 flex justify-center">
        <Spinner />
      </div>
    );
  }
  if (!isTeacher) return null;
  if (error || !student) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <BackButton />
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-red-500 mb-2">⚠️ {error || 'Không tìm thấy thông tin học viên'}</p>
            <p className="text-sm text-muted-foreground">
              Vui lòng kiểm tra lại ID hoặc thử tải lại trang.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const courseProgress = student.courseProgress || [];

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-muted text-foreground text-xl">
              {getInitials(student.fullName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{student.fullName}</h1>
            <p className="text-muted-foreground">{student.email}</p>
            <p className="text-sm">Tham gia: {formatDateSafe(student.enrolledAt)}</p>
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
          {courseProgress.length === 0 ? (
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
                {courseProgress.map((cp) => (
                  <TableRow key={cp.courseId}>
                    <TableCell className="font-medium">{cp.courseTitle}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={cp.progress} className="w-32" />
                        <span className="text-sm">{cp.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{formatDateSafe(cp.lastActiveAt)}</TableCell>
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

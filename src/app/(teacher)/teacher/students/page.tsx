'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { SelectFilter } from '@/components/ui/select-filter';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination } from '@/components/ui/pagination';
import { Search } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/hooks/auth/useAuth';
import { Spinner } from '@/components/ui/spinner';
import { useRouter } from 'next/navigation';

interface Student {
  id: string;
  fullName: string;
  email: string;
  enrolledCourse: string;
  progress: number;
  joinedAt: string;
}

export default function TeacherStudentsPage() {
  const { isTeacher, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);

  useEffect(() => {
    if (!authLoading && !isTeacher) router.push('/forbidden');
  }, [isTeacher, authLoading, router]);

  useEffect(() => {
    if (isTeacher) {
      apiClient
        .get('/teacher/courses')
        .then((res) => setCourses(res.data.map((c: any) => ({ id: c.id, title: c.title }))));
    }
  }, [isTeacher]);

  useEffect(() => {
    if (isTeacher) {
      apiClient
        .get('/teacher/students', {
          params: { q: search, courseId: courseFilter, page, limit: 10 },
        })
        .then((res) => {
          setStudents(res.data.data);
          setTotalPages(res.data.totalPages);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [search, courseFilter, page, isTeacher]);

  if (authLoading)
    return (
      <div className="p-8 flex justify-center">
        <Spinner />
      </div>
    );
  if (!isTeacher) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Học viên của tôi</h1>
        <p className="text-muted-foreground">Quản lý học viên trong các khóa học của bạn.</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4" />
          <Input
            placeholder="Tìm theo tên hoặc email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <SelectFilter
          options={[
            { label: 'Tất cả khóa học', value: '' },
            ...courses.map((c) => ({ label: c.title, value: c.id })),
          ]}
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className="w-full sm:w-48"
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Danh sách học viên</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>Học viên</TableCell>
                <TableCell>Khóa học</TableCell>
                <TableCell>Tiến độ</TableCell>
                <TableCell>Ngày tham gia</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    <Spinner />
                  </TableCell>
                </TableRow>
              ) : (
                students.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{s.fullName}</p>
                        <p className="text-sm text-muted-foreground">{s.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{s.enrolledCourse}</TableCell>
                    <TableCell>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${s.progress}%` }}
                        />
                      </div>
                      <span className="text-xs">{s.progress}%</span>
                    </TableCell>
                    <TableCell>{new Date(s.joinedAt).toLocaleDateString('vi-VN')}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        isLoading={loading}
      />
    </div>
  );
}

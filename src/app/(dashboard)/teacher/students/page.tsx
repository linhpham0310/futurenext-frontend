'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { SelectFilter } from '@/components/ui/select-filter';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination } from '@/components/ui/pagination';
import { Search } from 'lucide-react';
import Link from 'next/link';
import { teacherApi } from '@/lib/api';
import { useAuth } from '@/hooks/auth/useAuth';
import { Spinner } from '@/components/ui/spinner';
import { useRouter } from 'next/navigation';

// Helper xử lý ngày an toàn
const formatDateSafe = (dateString?: string | null): string => {
  if (!dateString) return '--';
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? '--' : date.toLocaleDateString('vi-VN');
};

interface Student {
  id: string;
  fullName: string;
  email: string;
  enrolledCourse: string;
  progress: number;
  joinedAt: string; // có thể là createdAt hoặc enrolledAt từ API
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

  // Lấy danh sách khóa học của giáo viên để lọc
  useEffect(() => {
    if (isTeacher) {
      teacherApi
        .getMyCourses()
        .then((res) => {
          const courseList = Array.isArray(res.data) ? res.data : [];
          setCourses(courseList.map((c: any) => ({ id: c.id, title: c.title })));
        })
        .catch(() => {});
    }
  }, [isTeacher]);

  // Lấy danh sách học viên
  useEffect(() => {
    if (isTeacher) {
      setLoading(true);
      teacherApi
        .getStudents({ q: search, courseId: courseFilter, page, limit: 10 })
        .then((res) => {
          console.log('📦 Students API response:', res.data); // debug

          const responseData = res.data;
          let studentData: any[] = [];
          let total = 1;

          // Xác định cấu trúc response linh hoạt
          if (responseData?.data && Array.isArray(responseData.data)) {
            studentData = responseData.data;
            total = responseData.meta?.totalPages || 1;
          } else if (responseData?.items && Array.isArray(responseData.items)) {
            studentData = responseData.items;
            total = responseData.totalPages || Math.ceil((responseData.total || 0) / 10);
          } else if (Array.isArray(responseData)) {
            studentData = responseData;
          } else if (responseData?.data?.items && Array.isArray(responseData.data.items)) {
            studentData = responseData.data.items;
            total = responseData.data.totalPages || 1;
          }

          // Map dữ liệu, đảm bảo trường joinedAt luôn có giá trị
          const mapped: Student[] = studentData.map((item: any) => ({
            id: item.id,
            fullName: item.fullName || item.studentName || '',
            email: item.email || '',
            enrolledCourse: item.courseTitle || item.enrolledCourse || '',
            progress: item.progress ?? 0,
            // Ưu tiên joinedAt, fallback sang createdAt hoặc enrolledAt
            joinedAt: item.joinedAt || item.createdAt || item.enrolledAt || '',
          }));

          setStudents(mapped);
          setTotalPages(total);
        })
        .catch((err) => {
          console.error('❌ Error fetching students:', err);
          setStudents([]);
        })
        .finally(() => setLoading(false));
    }
  }, [search, courseFilter, page, isTeacher]);

  if (authLoading) {
    return (
      <div className="p-8 flex justify-center">
        <Spinner />
      </div>
    );
  }
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
                <TableCell></TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    <Spinner />
                  </TableCell>
                </TableRow>
              ) : students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Không có học viên nào
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{student.fullName}</p>
                        <p className="text-sm text-muted-foreground">{student.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{student.enrolledCourse}</TableCell>
                    <TableCell>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${student.progress}%` }}
                        />
                      </div>
                      <span className="text-xs">{student.progress}%</span>
                    </TableCell>
                    <TableCell>{formatDateSafe(student.joinedAt)}</TableCell>
                    <TableCell>
                      <Link
                        href={`/teacher/students/${student.id}`}
                        className="text-blue-500 hover:underline text-sm"
                      >
                        Xem chi tiết
                      </Link>
                    </TableCell>
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

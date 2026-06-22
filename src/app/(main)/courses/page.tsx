'use client';

import { useEffect, useState } from 'react';
import { courseApi, studentApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnail?: string;
  isEnrolled?: boolean;
}

export default function StudentCoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [enrolling, setEnrolling] = useState<string | null>(null);

  // Lấy danh sách khóa học công khai và danh sách đã đăng ký để đánh dấu
  const fetchCourses = async (keyword = '') => {
    setLoading(true);
    try {
      const [publicRes, myCoursesRes] = await Promise.all([
        courseApi.getPublicCourses({ search: keyword }),
        studentApi.getMyCourses().catch(() => ({ data: [] })), // nếu chưa đăng nhập thì bỏ qua
      ]);

      const publicCourses = publicRes.data.data || publicRes.data || [];
      const myCourseIds = new Set((myCoursesRes.data || []).map((c: any) => c.id));

      const merged = publicCourses.map((c: Course) => ({
        ...c,
        isEnrolled: myCourseIds.has(c.id),
      }));

      setCourses(merged);
    } catch (error) {
      console.error(error);
      toast.error('Không thể tải danh sách khóa học');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Debounce tìm kiếm
  useEffect(() => {
    const timer = setTimeout(() => fetchCourses(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const handleEnroll = async (courseId: string) => {
    setEnrolling(courseId);
    try {
      await studentApi.enrollCourse(courseId);
      toast.success('Đăng ký thành công!');
      // Cập nhật trạng thái ngay lập tức
      setCourses((prev) => prev.map((c) => (c.id === courseId ? { ...c, isEnrolled: true } : c)));
    } catch (error) {
      toast.error('Đăng ký thất bại, vui lòng thử lại');
    } finally {
      setEnrolling(null);
    }
  };

  const goToLearning = (courseId: string) => {
    router.push(`/lx/${courseId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Khám phá khóa học</h1>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Tìm khóa học..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-12 text-gray-500">Không có khóa học nào phù hợp.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id}>
              <CardHeader>
                <CardTitle>{course.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                <div className="mt-4 flex justify-between items-center">
                  <span className="font-bold text-blue-600">
                    {course.price.toLocaleString('vi-VN')}đ
                  </span>
                  {course.isEnrolled ? (
                    <Button size="sm" onClick={() => goToLearning(course.id)}>
                      Vào học
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleEnroll(course.id)}
                      disabled={enrolling === course.id}
                    >
                      {enrolling === course.id ? 'Đang xử lý...' : 'Đăng ký'}
                    </Button>
                  )}
                </div>
                <Link
                  href={`/courses/${course.id}`}
                  className="block mt-2 text-xs text-blue-500 hover:underline"
                >
                  Xem chi tiết
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

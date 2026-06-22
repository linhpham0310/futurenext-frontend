'use client';

import { useEffect, useState } from 'react';
import { courseApi, studentApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import Link from 'next/link';
import { Search, RefreshCw, AlertCircle } from 'lucide-react';
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
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [enrolling, setEnrolling] = useState<string | null>(null);

  // Lấy danh sách khóa học công khai và danh sách đã đăng ký
  const fetchCourses = async (keyword = '') => {
    setLoading(true);
    setError(null);
    try {
      // Gọi API public với tham số page, limit và search
      const publicRes = await courseApi.getPublicCourses({
        page: 1,
        limit: 20,
        search: keyword || undefined,
      });

      console.log('📦 Public courses response:', publicRes.data);

      // Lấy mảng courses từ response (có thể là data.data hoặc data.items hoặc data trực tiếp)
      let publicCourses: Course[] = [];
      if (publicRes.data?.data && Array.isArray(publicRes.data.data)) {
        publicCourses = publicRes.data.data;
      } else if (publicRes.data?.items && Array.isArray(publicRes.data.items)) {
        publicCourses = publicRes.data.items;
      } else if (Array.isArray(publicRes.data)) {
        publicCourses = publicRes.data;
      } else {
        console.warn('⚠️ Không thể parse courses từ response:', publicRes.data);
        publicCourses = [];
      }

      // Lấy danh sách khóa học đã đăng ký của student
      let myCourseIds = new Set<string>();
      try {
        const myRes = await studentApi.getMyCourses();
        const myCourses = myRes.data?.data || myRes.data || [];
        myCourseIds = new Set(myCourses.map((c: any) => c.id));
      } catch (err) {
        // Nếu chưa đăng nhập hoặc chưa có khóa học nào, bỏ qua
        console.log('Chưa có khóa học đã đăng ký hoặc chưa đăng nhập');
      }

      // Gắn cờ isEnrolled
      const merged = publicCourses.map((c) => ({
        ...c,
        isEnrolled: myCourseIds.has(c.id),
      }));

      setCourses(merged);
    } catch (err: any) {
      console.error('❌ Lỗi fetch courses:', err);
      setError(err.message || 'Không thể tải danh sách khóa học');
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
      // Cập nhật trạng thái ngay
      setCourses((prev) => prev.map((c) => (c.id === courseId ? { ...c, isEnrolled: true } : c)));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setEnrolling(null);
    }
  };

  const goToLearning = (courseId: string) => {
    router.push(`/lx/${courseId}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Spinner className="h-8 w-8" />
        <p className="mt-4 text-sm text-gray-500">Đang tải danh sách khóa học...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <AlertCircle className="h-12 w-12 text-red-400" />
        <p className="text-red-500">{error}</p>
        <Button onClick={() => fetchCourses(search)} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" /> Thử lại
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Khám phá khóa học</h1>
        <div className="relative w-full sm:w-64">
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
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
          <p className="text-gray-500">Hiện chưa có khóa học nào phù hợp.</p>
          <p className="text-sm text-gray-400 mt-1">
            Hãy thử tìm kiếm với từ khóa khác hoặc quay lại sau.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="line-clamp-1">{course.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {course.description || 'Chưa có mô tả'}
                </p>
                <div className="flex justify-between items-center">
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
                  className="block text-xs text-blue-500 hover:underline"
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

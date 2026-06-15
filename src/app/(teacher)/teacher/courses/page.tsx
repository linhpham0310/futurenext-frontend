'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/hooks/auth/useAuth';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface Course {
  id: string;
  title: string;
  status: 'DRAFT' | 'SUBMITTED' | 'PUBLISHED' | 'REJECTED';
  thumbnailUrl?: string;
  price: number;
  createdAt: string;
  _count: { sections: number };
}

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  DRAFT: { label: 'Bản nháp', variant: 'secondary' },
  SUBMITTED: { label: 'Chờ duyệt', variant: 'outline' },
  PUBLISHED: { label: 'Đã xuất bản', variant: 'default' },
  REJECTED: { label: 'Bị từ chối', variant: 'destructive' },
};

export default function TeacherCoursesPage() {
  const { isTeacher, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isTeacher) router.push('/forbidden');
  }, [isTeacher, authLoading, router]);

  useEffect(() => {
    if (isTeacher) {
      const fetchCourses = async () => {
        try {
          const res = await apiClient.get('/teacher/courses');
          setCourses(res.data);
        } catch (error) {
          toast.error('Không thể tải danh sách khóa học');
        } finally {
          setLoading(false);
        }
      };
      fetchCourses();
    }
  }, [isTeacher]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Xóa khóa học "${title}"? Hành động không thể hoàn tác.`)) return;
    try {
      await apiClient.delete(`/teacher/courses/${id}`);
      toast.success('Xóa khóa học thành công');
      setCourses(courses.filter((c) => c.id !== id));
    } catch (error) {
      toast.error('Xóa thất bại');
    }
  };

  if (authLoading || loading)
    return (
      <div className="flex justify-center p-10">
        <Spinner />
      </div>
    );
  if (!isTeacher) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Khóa học của tôi</h1>
          <p className="text-gray-500 text-sm">Quản lý và cập nhật nội dung bài giảng.</p>
        </div>
        <Link
          href="/teacher/courses/create"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus size={16} /> Tạo khóa học mới
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="border-2 border-dashed border-gray-300 rounded-xl h-64 flex flex-col items-center justify-center text-gray-400">
          <BookOpen className="h-10 w-10 mb-2" />
          <p>Chưa có khóa học nào.</p>
          <p className="text-xs">Hãy nhấn "Tạo khóa học mới" để bắt đầu.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const statusInfo = STATUS_CONFIG[course.status] || {
              label: course.status,
              variant: 'secondary',
            };
            return (
              <div
                key={course.id}
                className="border rounded-xl overflow-hidden shadow-sm bg-white hover:shadow-md transition"
              >
                <div className="h-36 bg-gray-100 flex items-center justify-center">
                  {course.thumbnailUrl ? (
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <BookOpen className="h-12 w-12 text-gray-300" />
                  )}
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-gray-800 line-clamp-2">{course.title}</h3>
                    <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                  </div>
                  <p className="text-xs text-gray-500">
                    {course._count?.sections ?? 0} chương · {course.price.toLocaleString('vi-VN')}đ
                  </p>
                  <div className="flex gap-2 pt-2">
                    <Link
                      href={`/teacher/courses/${course.id}`}
                      className="flex-1 flex items-center justify-center gap-1 text-sm text-blue-600 border border-blue-200 rounded-md py-1.5 hover:bg-blue-50"
                    >
                      <Eye size={14} /> Xem
                    </Link>
                    <Link
                      href={`/teacher/courses/${course.id}/edit`}
                      className="flex-1 flex items-center justify-center gap-1 text-sm text-gray-600 border border-gray-300 rounded-md py-1.5 hover:bg-gray-50"
                    >
                      <Pencil size={14} /> Sửa
                    </Link>
                    <button
                      onClick={() => handleDelete(course.id, course.title)}
                      className="flex items-center justify-center gap-1 text-sm text-red-600 border border-red-200 rounded-md py-1.5 px-3 hover:bg-red-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/hooks/auth/useAuth';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Pencil, Trash2, Send } from 'lucide-react';

interface CourseDetail {
  id: string;
  title: string;
  description: string;
  status: 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'REJECTED';
  price: number;
  thumbnailUrl: string;
  sections: { id: string; title: string; lessons: { id: string; title: string; type: string }[] }[];
}

export default function CourseDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isTeacher, isLoading: authLoading } = useAuth();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !isTeacher) router.push('/forbidden');
  }, [isTeacher, authLoading, router]);

  useEffect(() => {
    if (isTeacher && id) {
      const fetchCourse = async () => {
        try {
          const res = await apiClient.get(`/teacher/courses/${id}`);
          setCourse(res.data);
        } catch (error) {
          toast.error('Không thể tải chi tiết khóa học');
        } finally {
          setLoading(false);
        }
      };
      fetchCourse();
    }
  }, [id, isTeacher]);

  const handleDelete = async () => {
    if (!confirm('Xóa khóa học này?')) return;
    try {
      await apiClient.delete(`/teacher/courses/${id}`);
      toast.success('Xóa thành công');
      router.push('/teacher/courses');
    } catch (error) {
      toast.error('Xóa thất bại');
    }
  };

  const handleSubmitForReview = async () => {
    if (
      !confirm(
        'Gửi khóa học này để duyệt? Bạn sẽ không thể chỉnh sửa cho đến khi được duyệt hoặc từ chối.'
      )
    )
      return;
    setIsSubmitting(true);
    try {
      await apiClient.patch(`/teacher/courses/${id}/submit`);
      toast.success('Đã gửi yêu cầu duyệt, vui lòng chờ phản hồi từ admin.');
      const res = await apiClient.get(`/teacher/courses/${id}`);
      setCourse(res.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gửi thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || loading)
    return (
      <div className="p-8 flex justify-center">
        <Spinner />
      </div>
    );
  if (!isTeacher || !course) return null;

  const getStatusBadge = () => {
    switch (course.status) {
      case 'PUBLISHED':
        return <Badge className="bg-green-100 text-green-800">Đã xuất bản</Badge>;
      case 'PENDING_REVIEW':
        return <Badge className="bg-yellow-100 text-yellow-800">Chờ duyệt</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800">Bị từ chối</Badge>;
      default:
        return <Badge variant="secondary">Bản nháp</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{course.title}</h1>
          <p className="text-muted-foreground">ID: {course.id}</p>
        </div>
        <div className="flex gap-2">
          {course.status === 'DRAFT' && (
            <Button
              onClick={handleSubmitForReview}
              disabled={isSubmitting}
              variant="default"
              className="bg-green-600"
            >
              <Send className="h-4 w-4 mr-1" /> Gửi duyệt
            </Button>
          )}
          {course.status === 'PENDING_REVIEW' && (
            <Button disabled variant="outline">
              Đang chờ duyệt
            </Button>
          )}
          <Button variant="outline" onClick={() => router.push(`/teacher/courses/${id}/edit`)}>
            <Pencil className="h-4 w-4 mr-1" /> Chỉnh sửa
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-1" /> Xóa
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Trạng thái</CardTitle>
          </CardHeader>
          <CardContent>{getStatusBadge()}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Giá</CardTitle>
          </CardHeader>
          <CardContent>{course.price.toLocaleString('vi-VN')}đ</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Số chương</CardTitle>
          </CardHeader>
          <CardContent>{course.sections.length}</CardContent>
        </Card>
      </div>
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="content">Nội dung</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Mô tả</CardTitle>
            </CardHeader>
            <CardContent>{course.description || 'Chưa có mô tả'}</CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>Chương mục</CardTitle>
            </CardHeader>
            <CardContent>
              {course.sections.length === 0 ? (
                <p className="text-muted-foreground">Chưa có chương nào.</p>
              ) : (
                <div className="space-y-4">
                  {course.sections.map((section) => (
                    <div key={section.id} className="border rounded-lg p-4">
                      <h3 className="font-semibold">{section.title}</h3>
                      <ul className="mt-2 pl-4 space-y-1">
                        {section.lessons.map((lesson) => (
                          <li key={lesson.id} className="text-sm">
                            • {lesson.title} ({lesson.type})
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
              <Button
                className="mt-4"
                variant="outline"
                onClick={() => router.push(`/teacher/courses/${id}/builder`)}
              >
                Quản lý cấu trúc chương
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

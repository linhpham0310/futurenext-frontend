'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/hooks/auth/useAuth';

interface CourseDetail {
  id: string;
  title: string;
  description: string;
  instructor: string;
  status: 'PUBLISHED' | 'DRAFT' | 'PENDING' | 'REJECTED';
  price: number;
  students: number;
  rating: number;
  outcomes?: string[];
  sections?: {
    id: string;
    title: string;
    lessons: { id: string; title: string; type: string }[];
  }[];
}

export default function AdminCourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isAdmin, isLoading: authLoading } = useAuth();

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAdmin) router.push('/forbidden');
  }, [isAdmin, authLoading, router]);

  useEffect(() => {
    if (isAdmin) {
      const fetchCourse = async () => {
        try {
          const response = await apiClient.get(`/admin/courses/${id}`);
          setCourse(response.data);
        } catch (error) {
          toast.error('Không thể tải thông tin khóa học');
        } finally {
          setLoading(false);
        }
      };
      fetchCourse();
    }
  }, [id, isAdmin]);

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc muốn xóa khóa học này?')) return;
    setDeleting(true);
    try {
      await apiClient.delete(`/admin/courses/${id}`);
      toast.success('Xóa khóa học thành công');
      router.push('/admin/courses');
    } catch (error) {
      toast.error('Xóa thất bại');
      setDeleting(false);
    }
  };

  if (authLoading)
    return (
      <div className="p-8 flex justify-center">
        <Spinner />
      </div>
    );
  if (!isAdmin) return null;
  if (loading)
    return (
      <div className="p-8 flex justify-center">
        <Spinner />
      </div>
    );
  if (!course) return <div className="p-8">Không tìm thấy khóa học</div>;

  const getStatusBadge = () => {
    switch (course.status) {
      case 'PUBLISHED':
        return <Badge className="bg-green-100 text-green-800">Đã xuất bản</Badge>;
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800">Chờ duyệt</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800">Từ chối</Badge>;
      default:
        return <Badge variant="secondary">Bản nháp</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{course.title}</h1>
          <p className="text-muted-foreground">ID: {course.id}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/admin/courses/${id}/edit`)}>
            Chỉnh sửa
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Đang xóa...' : 'Xóa'}
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Giảng viên</CardTitle>
          </CardHeader>
          <CardContent>{course.instructor}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Trạng thái</CardTitle>
          </CardHeader>
          <CardContent>{getStatusBadge()}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Học viên</CardTitle>
          </CardHeader>
          <CardContent>{course.students}</CardContent>
        </Card>
      </div>
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="content">Nội dung</TabsTrigger>
          <TabsTrigger value="students">Học viên</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Mô tả</CardTitle>
            </CardHeader>
            <CardContent>{course.description}</CardContent>
          </Card>
          {course.outcomes && course.outcomes.length > 0 && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Kết quả đạt được</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-1">
                  {course.outcomes.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>Nội dung khóa học</CardTitle>
            </CardHeader>
            <CardContent>
              {course.sections && course.sections.length > 0 ? (
                <div className="space-y-4">
                  {course.sections.map((section) => (
                    <div key={section.id} className="border rounded-lg p-4">
                      <h3 className="font-semibold text-lg mb-2">{section.title}</h3>
                      <ul className="space-y-1 pl-4">
                        {section.lessons.map((lesson) => (
                          <li key={lesson.id} className="text-sm">
                            • {lesson.title} ({lesson.type})
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Chưa có nội dung bài giảng.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="students">
          <Card>
            <CardHeader>
              <CardTitle>Danh sách học viên</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Tính năng đang phát triển.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

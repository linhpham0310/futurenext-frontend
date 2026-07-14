'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { teacherApi } from '@/lib/api';
import { useAuth } from '@/hooks/auth/useAuth';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Pencil, Trash2, Send, FolderTree, Star } from 'lucide-react';
import { BackButton } from '@/components/ui/back-button';
import CourseFeedbackPage from './feedback/page';
import CourseAISettingsPage from './ai-settings/page';

interface CourseDetail {
  id: string;
  title: string;
  description: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  price: number;
  thumbnailUrl: string;
  language: string;
  level: string;
  category?: { name: string };
  instructor: { id: string; fullName: string; email: string };
  students: number;
  rating: number;
  sections: {
    id: string;
    title: string;
    orderIndex: number;
    lessons: { id: string; title: string; type: string; orderIndex: number }[];
  }[];
  outcomes: { id: string; title: string; description: string }[];
  reviewLogs: { adminName: string; action: string; reason: string; createdAt: string }[];
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
      teacherApi
        .getCourseDetail(id as string)
        .then((res) => setCourse(res.data))
        .catch(() => toast.error('Không thể tải thông tin khóa học'))
        .finally(() => setLoading(false));
    }
  }, [id, isTeacher]);

  const handleDelete = async () => {
    if (!confirm('Xóa khóa học này?')) return;
    try {
      await teacherApi.deleteCourse(id as string);
      toast.success('Xóa thành công');
      router.push('/teacher/courses');
    } catch (error) {
      toast.error('Xóa thất bại');
    }
  };

  const handleSubmitForReview = async () => {
    if (!confirm('Gửi khóa học này để duyệt?')) return;
    setIsSubmitting(true);
    try {
      await teacherApi.submitCourse(id as string);
      toast.success('Đã gửi yêu cầu duyệt');
      const res = await teacherApi.getCourseDetail(id as string);
      setCourse(res.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gửi thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }
  if (!isTeacher || !course) return null;

  const getStatusBadge = () => {
    switch (course.status) {
      case 'APPROVED':
        return <Badge className="bg-muted text-emerald-600">Đã phê duyệt</Badge>;
      case 'SUBMITTED':
        return <Badge className="bg-muted text-amber-600">Chờ duyệt</Badge>;
      case 'REJECTED':
        return <Badge className="bg-destructive/10 text-destructive">Bị từ chối</Badge>;
      default:
        return <Badge variant="secondary">Bản nháp</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">{course.title}</h1>
          <p className="text-muted-foreground">ID: {course.id}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <BackButton />
          {course.status === 'DRAFT' && (
            <Button
              onClick={handleSubmitForReview}
              disabled={isSubmitting}
              variant="default"
              className="bg-primary hover:bg-primary/90"
            >
              <Send className="h-4 w-4 mr-1" /> Gửi duyệt
            </Button>
          )}
          <Button variant="outline" onClick={() => router.push(`/teacher/courses/${id}/edit`)}>
            <Pencil className="h-4 w-4 mr-1" /> Chỉnh sửa thông tin
          </Button>
          <Button variant="outline" onClick={() => router.push(`/teacher/courses/${id}/builder`)}>
            <FolderTree className="h-4 w-4 mr-1" /> Chỉnh sửa cấu trúc
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-1" /> Xóa
          </Button>
        </div>
      </div>

      {/* Thông tin nhanh */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Trạng thái</CardTitle>
          </CardHeader>
          <CardContent>{getStatusBadge()}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Giá</CardTitle>
          </CardHeader>
          <CardContent>{course.price.toLocaleString('vi-VN')}đ</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Học viên</CardTitle>
          </CardHeader>
          <CardContent>{course.students}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Đánh giá</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            {course.rating.toFixed(1)}
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="content">Nội dung</TabsTrigger>
          <TabsTrigger value="feedback">Phản hồi</TabsTrigger>
          <TabsTrigger value="ai-settings">Cấu hình AI</TabsTrigger>
        </TabsList>

        {/* Tổng quan */}
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Mô tả</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{course.description || 'Chưa có mô tả'}</p>
            </CardContent>
          </Card>
          {course.outcomes.length > 0 && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Kết quả học tập</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-1">
                  {course.outcomes.map((lo) => (
                    <li key={lo.id}>
                      <strong>{lo.title}</strong> – {lo.description}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Nội dung */}
        <TabsContent value="content">
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle>Cấu trúc khóa học</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/teacher/courses/${id}/builder`)}
              >
                <FolderTree className="h-4 w-4 mr-1" /> Chỉnh sửa cấu trúc
              </Button>
            </CardHeader>
            <CardContent>
              {course.sections.length === 0 ? (
                <p className="text-muted-foreground">Chưa có chương mục nào.</p>
              ) : (
                <div className="space-y-4">
                  {course.sections.map((section) => (
                    <div key={section.id} className="border rounded-lg p-4">
                      <h3 className="font-semibold text-lg">{section.title}</h3>
                      <ul className="mt-2 pl-4 space-y-1">
                        {section.lessons.map((lesson) => (
                          <li
                            key={lesson.id}
                            className="text-sm flex justify-between items-center border-b pb-1"
                          >
                            <span>
                              • {lesson.title} ({lesson.type})
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                router.push(`/teacher/courses/${course.id}/lessons/${lesson.id}`)
                              }
                            >
                              <Pencil className="h-3 w-3 mr-1" /> Sửa nội dung
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback">
          <CourseFeedbackPage />
        </TabsContent>

        <TabsContent value="ai-settings">
          <CourseAISettingsPage />
        </TabsContent>
      </Tabs>
    </div>
  );
}

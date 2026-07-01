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
import { Pencil, Trash2, Send } from 'lucide-react';
import CourseFeedbackPage from './feedback/page';
import CourseAISettingsPage from './ai-settings/page';
import { BackButton } from '@/components/ui/back-button';

interface CourseDetail {
  id: string;
  title: string;
  description: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  price: number;
  thumbnailUrl: string;
  sections: {
    id: string;
    title: string;
    lessons: { id: string; title: string; type: string }[];
    loMappings?: string[];
  }[];
}

export default function CourseDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isTeacher, isLoading: authLoading } = useAuth();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [outcomes, setOutcomes] = useState<{ id: string; title: string; description: string }[]>(
    []
  );

  useEffect(() => {
    if (!authLoading && !isTeacher) router.push('/forbidden');
  }, [isTeacher, authLoading, router]);

  useEffect(() => {
    Promise.all([
      teacherApi.getCourseDetail(id as string),
      teacherApi.getLearningOutcomes(id as string), // API mới
    ]).then(([courseRes, outcomesRes]) => {
      setCourse(courseRes.data);
      setOutcomes(outcomesRes.data || []);
    });
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
    if (
      !confirm(
        'Gửi khóa học này để duyệt? Bạn sẽ không thể chỉnh sửa cho đến khi được duyệt hoặc từ chối.'
      )
    )
      return;
    setIsSubmitting(true);
    try {
      await teacherApi.submitCourse(id as string);
      toast.success('Đã gửi yêu cầu duyệt, vui lòng chờ phản hồi từ admin.');
      const res = await teacherApi.getCourseDetail(id as string);
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
      case 'APPROVED':
        return <Badge className="bg-green-100 text-green-800">Đã phê duyệt</Badge>;
      case 'SUBMITTED':
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
          <BackButton />
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
          {course.status === 'SUBMITTED' && (
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
          <TabsTrigger value="feedback">Phản hồi</TabsTrigger>
          <TabsTrigger value="ai-settings">AI Settings</TabsTrigger>
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
              {/* Hiển thị LOs */}
              {outcomes.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-sm">Mục tiêu học tập (LOs):</h4>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {outcomes.map((lo) => (
                      <span
                        key={lo.id}
                        className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                      >
                        {lo.title}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {/* Sections và lessons như cũ, thêm badge LO nếu có mapping */}
              {course.sections.map((section) => (
                <div key={section.id} className="border rounded-lg p-4">
                  <h3 className="font-semibold">{section.title}</h3>
                  {section.loMappings && section.loMappings.length > 0 && (
                    <div className="flex flex-wrap gap-1 my-2">
                      {section.loMappings.map((loId) => {
                        const lo = outcomes.find((o) => o.id === loId);
                        return lo ? (
                          <span
                            key={loId}
                            className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                          >
                            {lo.title}
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                  <ul className="mt-2 pl-4 space-y-1">
                    {section.lessons.map((lesson) => (
                      <li key={lesson.id} className="text-sm">
                        • {lesson.title} ({lesson.type})
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
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

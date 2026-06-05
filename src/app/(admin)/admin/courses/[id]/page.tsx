// src/app/(admin)/admin/courses/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; // (tự thêm nếu chưa có)
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Dữ liệu mẫu
const mockCourse = {
  id: '1',
  title: 'Khóa học React Nâng cao',
  description: 'Học React từ cơ bản đến nâng cao với dự án thực tế.',
  instructor: 'Nguyễn Văn A',
  status: 'PUBLISHED',
  price: 500000,
  students: 320,
  rating: 4.8,
};

export default function AdminCourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<typeof mockCourse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Giả lập fetch API
    setTimeout(() => {
      setCourse(mockCourse);
      setLoading(false);
    }, 500);
  }, [id]);

  if (loading)
    return (
      <div className="p-8 flex justify-center">
        <Spinner />
      </div>
    );
  if (!course) return <div className="p-8">Không tìm thấy khóa học</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Nhóm header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{course.title}</h1>
          <p className="text-muted-foreground">ID: {course.id}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Chỉnh sửa</Button>
          <Button variant="destructive">Xóa</Button>
        </div>
      </div>

      {/* Nhóm thông tin tổng quan */}
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
          <CardContent>
            <Badge variant={course.status === 'PUBLISHED' ? 'default' : 'secondary'}>
              {course.status === 'PUBLISHED' ? 'Đã xuất bản' : 'Nháp'}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Học viên</CardTitle>
          </CardHeader>
          <CardContent>{course.students}</CardContent>
        </Card>
      </div>

      {/* Nhóm Tabs */}
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
        </TabsContent>
        <TabsContent value="content">
          <p>Danh sách bài giảng (placeholder)</p>
        </TabsContent>
        <TabsContent value="students">
          <p>Danh sách học viên (placeholder)</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}

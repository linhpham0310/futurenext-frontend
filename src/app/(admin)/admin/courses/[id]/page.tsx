'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';
import { adminApi } from '@/lib/api';
import { useAuth } from '@/hooks/auth/useAuth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { BackButton } from '@/components/ui/back-button';

interface CourseDetail {
  id: string;
  title: string;
  description: string;
  instructor: { id: string; fullName: string; email: string } | null;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  price: number;
  students: number;
  rating: number;
  outcomes?: { id: string; title: string; description: string }[];
  sections?: {
    id: string;
    title: string;
    orderIndex: number;
    lessons: { id: string; title: string; type: string; mainTopics: string[] }[];
    loMappings?: { loId: string; loTitle: string }[];
  }[];
  reviewLogs?: {
    adminName: string;
    action: 'APPROVE' | 'REJECT';
    reason?: string;
    createdAt: string;
  }[];
}

export default function AdminCourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isAdmin, isLoading: authLoading } = useAuth();

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAdmin) router.push('/forbidden');
  }, [isAdmin, authLoading, router]);

  useEffect(() => {
    if (isAdmin) {
      const fetchCourse = async () => {
        try {
          const response = await adminApi.getCourseDetail(id as string);
          setCourse(response.data);
        } catch {
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
      await adminApi.deleteCourse(id as string);
      toast.success('Xóa khóa học thành công');
      router.push('/admin/courses');
    } catch {
      toast.error('Xóa thất bại');
      setDeleting(false);
    }
  };

  const handleApprove = async () => {
    try {
      await adminApi.approveCourse(id as string);
      toast.success('Khóa học đã được phê duyệt');
      const response = await adminApi.getCourseDetail(id as string);
      setCourse(response.data);
    } catch {
      toast.error('Phê duyệt thất bại');
    }
  };

  const openRejectDialog = () => {
    setRejectReason('');
    setRejectDialogOpen(true);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối');
      return;
    }
    setSubmitting(true);
    try {
      await adminApi.rejectCourse(id as string, rejectReason);
      toast.success('Đã từ chối khóa học');
      setRejectDialogOpen(false);
      const response = await adminApi.getCourseDetail(id as string);
      setCourse(response.data);
    } catch {
      toast.error('Từ chối thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading)
    return (
      <div className="p-8 flex justify-center">
        <Spinner />
      </div>
    );
  if (!isAdmin) return null;
  if (!course) return <div className="p-8">Không tìm thấy khóa học</div>;

  const getStatusBadge = () => {
    switch (course.status) {
      case 'APPROVED':
        return <Badge className="bg-muted text-emerald-600">Đã phê duyệt</Badge>;
      case 'SUBMITTED':
        return <Badge className="bg-muted text-amber-600">Chờ duyệt</Badge>;
      case 'REJECTED':
        return <Badge className="bg-destructive/10 text-destructive">Từ chối</Badge>;
      default:
        return <Badge variant="secondary">Bản nháp</Badge>;
    }
  };

  const isPending = course.status === 'SUBMITTED';

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{course.title}</h1>
          <p className="text-muted-foreground">ID: {course.id}</p>
        </div>
        <div className="flex gap-2">
          {isPending && (
            <>
              <Button
                variant="default"
                className="bg-primary hover:bg-primary/90"
                onClick={handleApprove}
              >
                Phê duyệt
              </Button>
              <Button variant="destructive" onClick={openRejectDialog}>
                Từ chối
              </Button>
            </>
          )}
          <Button variant="outline" onClick={() => router.push(`/admin/courses/${id}/edit`)}>
            Chỉnh sửa
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Đang xóa...' : 'Xóa'}
          </Button>
          <BackButton />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Giảng viên</CardTitle>
          </CardHeader>
          <CardContent>{course.instructor?.fullName || 'Không rõ'}</CardContent>
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
          <TabsTrigger value="curriculum">Chương trình đào tạo</TabsTrigger>
          <TabsTrigger value="logs">Lịch sử duyệt</TabsTrigger>
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
                <CardTitle>Kết quả học tập (LOs)</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-1">
                  {course.outcomes.map((lo) => (
                    <li key={lo.id}>
                      <strong>{lo.title}</strong> - {lo.description}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="curriculum">
          <Card>
            <CardHeader>
              <CardTitle>Chương trình chi tiết</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {course.sections?.map((section) => (
                <div key={section.id} className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg">{section.title}</h3>
                  <div className="flex flex-wrap gap-1 my-2">
                    {section.loMappings?.map((lo) => (
                      <span
                        key={lo.loId}
                        className="bg-muted text-foreground text-xs px-2 py-1 rounded"
                      >
                        {lo.loTitle}
                      </span>
                    ))}
                  </div>
                  <ul className="space-y-1 pl-4">
                    {section.lessons.map((lesson) => (
                      <li key={lesson.id} className="text-sm">
                        • {lesson.title} ({lesson.type}) {lesson.mainTopics?.join(', ')}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Nhật ký phê duyệt</CardTitle>
            </CardHeader>
            <CardContent>
              {course.reviewLogs && course.reviewLogs.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableCell>Người duyệt</TableCell>
                      <TableCell>Hành động</TableCell>
                      <TableCell>Lý do</TableCell>
                      <TableCell>Thời gian</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {course.reviewLogs.map((log) => (
                      <TableRow key={log.createdAt}>
                        <TableCell>{log.adminName}</TableCell>
                        <TableCell>{log.action === 'APPROVE' ? 'Phê duyệt' : 'Từ chối'}</TableCell>
                        <TableCell>{log.reason || '---'}</TableCell>
                        <TableCell>{new Date(log.createdAt).toLocaleString('vi-VN')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground">Chưa có lịch sử duyệt.</p>
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

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Từ chối khóa học</DialogTitle>
            <DialogDescription>Vui lòng nhập lý do từ chối.</DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Lý do từ chối..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleReject} disabled={submitting}>
              {submitting ? 'Đang xử lý...' : 'Xác nhận từ chối'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

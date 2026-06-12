'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SelectFilter } from '@/components/ui/select-filter';
import { Pagination } from '@/components/ui/pagination';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/hooks/auth/useAuth';

interface Course {
  id: string;
  title: string;
  instructor: { id: string; fullName: string; email: string } | string;
  status: 'PENDING' | 'PUBLISHED' | 'REJECTED' | 'DRAFT';
  students: number;
  revenue: number;
  createdAt: string;
}

export default function AdminCoursesPage() {
  const router = useRouter();
  const { isAdmin, isLoading: authLoading } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;
  const [totalPages, setTotalPages] = useState(1);

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAdmin) router.push('/forbidden');
  }, [isAdmin, authLoading, router]);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/admin/courses', {
        params: { q: search, status: statusFilter || undefined, page, limit },
      });
      setCourses(response.data.data);
      setTotalPages(response.data.meta.totalPages);
    } catch {
      toast.error('Không thể tải danh sách khóa học');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => {
    if (isAdmin) fetchCourses();
  }, [isAdmin, fetchCourses]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Bạn có chắc muốn xóa khóa học "${title}"? Hành động không thể hoàn tác.`)) return;
    try {
      await apiClient.delete(`/admin/courses/${id}`);
      toast.success('Xóa khóa học thành công');
      fetchCourses();
    } catch {
      toast.error('Xóa thất bại');
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await apiClient.patch(`/admin/courses/${id}/approve`);
      toast.success('Khóa học đã được xuất bản');
      fetchCourses();
    } catch {
      toast.error('Phê duyệt thất bại');
    }
  };

  const openRejectDialog = (id: string) => {
    setSelectedCourseId(id);
    setRejectReason('');
    setRejectDialogOpen(true);
  };

  const handleReject = async () => {
    if (!selectedCourseId) return;
    if (!rejectReason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối');
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.patch(`/admin/courses/${selectedCourseId}/reject`, { reason: rejectReason });
      toast.success('Đã từ chối khóa học');
      setRejectDialogOpen(false);
      fetchCourses();
    } catch {
      toast.error('Từ chối thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return (
          <span className="text-green-600 bg-green-100 px-2 py-1 rounded-full text-xs">
            Đã xuất bản
          </span>
        );
      case 'PENDING':
        return (
          <span className="text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full text-xs">
            Chờ duyệt
          </span>
        );
      case 'REJECTED':
        return (
          <span className="text-red-600 bg-red-100 px-2 py-1 rounded-full text-xs">Từ chối</span>
        );
      default:
        return (
          <span className="text-gray-600 bg-gray-100 px-2 py-1 rounded-full text-xs">Bản nháp</span>
        );
    }
  };

  if (authLoading)
    return (
      <div className="p-8 flex justify-center">
        <Spinner />
      </div>
    );
  if (!isAdmin) return null;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Quản lý khóa học</h1>
      </div>
      <div className="flex flex-wrap gap-4">
        <Input
          placeholder="Tìm kiếm khóa học..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <SelectFilter
          label="Trạng thái"
          options={[
            { label: 'Tất cả', value: '' },
            { label: 'Chờ duyệt', value: 'PENDING' },
            { label: 'Đã xuất bản', value: 'PUBLISHED' },
            { label: 'Từ chối', value: 'REJECTED' },
            { label: 'Bản nháp', value: 'DRAFT' },
          ]}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        />
      </div>
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-left">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-4 font-medium">Tên khóa học</th>
                <th className="p-4 font-medium">Giảng viên</th>
                <th className="p-4 font-medium">Trạng thái</th>
                <th className="p-4 font-medium">Học viên</th>
                <th className="p-4 font-medium">Doanh thu</th>
                <th className="p-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8">
                    <Spinner />
                  </td>
                </tr>
              ) : courses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8">
                    Không có khóa học nào
                  </td>
                </tr>
              ) : (
                courses.map((course) => (
                  <tr key={course.id} className="border-t hover:bg-muted/50">
                    <td className="p-4 font-medium">{course.title}</td>
                    <td className="p-4">
                      {typeof course.instructor === 'object'
                        ? course.instructor.fullName
                        : course.instructor}
                    </td>
                    <td className="p-4">{getStatusBadge(course.status)}</td>
                    <td className="p-4">{course.students}</td>
                    <td className="p-4">{course.revenue?.toLocaleString('vi-VN')}đ</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/admin/courses/${course.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/admin/courses/${course.id}/edit`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {course.status === 'PENDING' && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleApprove(course.id)}
                            >
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openRejectDialog(course.id)}
                            >
                              <XCircle className="h-4 w-4 text-red-600" />
                            </Button>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(course.id, course.title)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        isLoading={loading}
      />
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Từ chối khóa học</DialogTitle>
            <DialogDescription>
              Vui lòng cung cấp lý do từ chối để giảng viên biết và cải thiện.
            </DialogDescription>
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

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import { SelectFilter } from '@/components/ui/select-filter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
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

interface TeacherProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  expertise: string;
  bio: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
}

export default function AdminTeacherProfilesPage() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [profiles, setProfiles] = useState<TeacherProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<TeacherProfile | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [viewingProfile, setViewingProfile] = useState<TeacherProfile | null>(null);

  useEffect(() => {
    if (!authLoading && !isAdmin) router.push('/forbidden');
  }, [isAdmin, authLoading, router]);

  useEffect(() => {
    if (isAdmin) fetchProfiles();
  }, [search, statusFilter, page, isAdmin]);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/admin/teacher-profiles', {
        params: { q: search || undefined, status: statusFilter || undefined, page, limit },
      });
      setProfiles(response.data.data);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      toast.error('Không thể tải danh sách hồ sơ giáo viên');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (profileId: string) => {
    try {
      await apiClient.patch(`/admin/teacher-profiles/${profileId}/approve`);
      toast.success('Hồ sơ giáo viên đã được duyệt');
      fetchProfiles();
    } catch (error) {
      toast.error('Duyệt thất bại');
    }
  };

  const openRejectDialog = (profile: TeacherProfile) => {
    setSelectedProfile(profile);
    setRejectReason('');
    setRejectDialogOpen(true);
  };

  const handleReject = async () => {
    if (!selectedProfile) return;
    if (!rejectReason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối');
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.patch(`/admin/teacher-profiles/${selectedProfile.id}/reject`, {
        reason: rejectReason,
      });
      toast.success('Đã từ chối hồ sơ');
      setRejectDialogOpen(false);
      fetchProfiles();
    } catch (error) {
      toast.error('Từ chối thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (profileId: string) => {
    if (!confirm('Bạn có chắc muốn xóa hồ sơ này?')) return;
    try {
      await apiClient.delete(`/admin/teacher-profiles/${profileId}`);
      toast.success('Xóa hồ sơ thành công');
      fetchProfiles();
    } catch (error) {
      toast.error('Xóa thất bại');
    }
  };

  const viewDetail = (profile: TeacherProfile) => {
    setViewingProfile(profile);
    setDetailDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="text-green-600 bg-green-100 px-2 py-1 rounded-full text-xs">
            Đã duyệt
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
        return null;
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
        <h1 className="text-2xl font-bold">Duyệt hồ sơ giảng viên</h1>
        <p className="text-muted-foreground">Quản lý và phê duyệt hồ sơ đăng ký giảng viên</p>
      </div>
      <div className="flex flex-wrap gap-4">
        <Input
          placeholder="Tìm theo tên hoặc email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <SelectFilter
          label="Trạng thái"
          options={[
            { label: 'Tất cả', value: '' },
            { label: 'Chờ duyệt', value: 'PENDING' },
            { label: 'Đã duyệt', value: 'APPROVED' },
            { label: 'Từ chối', value: 'REJECTED' },
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
                <th className="p-4 font-medium">Họ tên</th>
                <th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium">Chuyên môn</th>
                <th className="p-4 font-medium">Trạng thái</th>
                <th className="p-4 font-medium">Ngày nộp</th>
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
              ) : profiles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8">
                    Không có hồ sơ nào
                  </td>
                </tr>
              ) : (
                profiles.map((profile) => (
                  <tr key={profile.id} className="border-t hover:bg-muted/50">
                    <td className="p-4 font-medium">{profile.fullName}</td>
                    <td className="p-4">{profile.email}</td>
                    <td className="p-4">{profile.expertise}</td>
                    <td className="p-4">{getStatusBadge(profile.status)}</td>
                    <td className="p-4">
                      {new Date(profile.submittedAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => viewDetail(profile)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {profile.status === 'PENDING' && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleApprove(profile.id)}
                            >
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openRejectDialog(profile)}
                            >
                              <XCircle className="h-4 w-4 text-red-600" />
                            </Button>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(profile.id)}
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
            <DialogTitle>Từ chối hồ sơ giảng viên</DialogTitle>
            <DialogDescription>
              Lý do từ chối sẽ được gửi đến email của giảng viên.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Nhập lý do từ chối..."
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
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết hồ sơ giảng viên</DialogTitle>
          </DialogHeader>
          {viewingProfile && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Họ tên</p>
                  <p className="font-medium">{viewingProfile.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{viewingProfile.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Số điện thoại</p>
                  <p className="font-medium">{viewingProfile.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Chuyên môn</p>
                  <p className="font-medium">{viewingProfile.expertise}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Giới thiệu / Tiểu sử</p>
                <p className="mt-1 whitespace-pre-wrap">{viewingProfile.bio}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setDetailDialogOpen(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

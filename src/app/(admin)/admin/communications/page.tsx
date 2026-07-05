'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pagination } from '@/components/ui/pagination';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { adminApi } from '@/lib/api';
import { useAuth } from '@/hooks/auth/useAuth';

interface Notification {
  id: string;
  title: string;
  content: string;
  type: 'EMAIL' | 'IN_APP';
  audience: 'ALL' | 'STUDENTS' | 'TEACHERS' | 'ADMINS' | 'SPECIFIC';
  targetUserIds?: string[];
  sentAt: string;
  status: 'DRAFT' | 'SENT' | 'FAILED';
  createdBy: string;
}

export default function AdminCommunicationsPage() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    content: '',
    type: 'IN_APP' as 'EMAIL' | 'IN_APP',
    audience: 'ALL' as 'ALL' | 'STUDENTS' | 'TEACHERS' | 'ADMINS' | 'SPECIFIC',
    targetUserIds: [] as string[],
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAdmin) router.push('/forbidden');
  }, [isAdmin, authLoading, router]);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminApi.getNotifications({ page, limit });
      setNotifications(response.data?.data ?? []);
      setTotalPages(response.data?.meta?.totalPages ?? 1);
    } catch {
      toast.error('Không thể tải danh sách thông báo');
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    if (isAdmin) fetchNotifications();
  }, [isAdmin, fetchNotifications]);

  const handleCreate = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error('Vui lòng nhập đầy đủ tiêu đề và nội dung');
      return;
    }
    setSubmitting(true);
    try {
      await adminApi.createNotification(form);
      toast.success('Thông báo đã được gửi');
      setCreateDialogOpen(false);
      setForm({ title: '', content: '', type: 'IN_APP', audience: 'ALL', targetUserIds: [] });
      fetchNotifications();
    } catch {
      toast.error('Gửi thông báo thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const getAudienceLabel = (audience: string) => {
    switch (audience) {
      case 'ALL':
        return 'Tất cả';
      case 'STUDENTS':
        return 'Học viên';
      case 'TEACHERS':
        return 'Giảng viên';
      case 'ADMINS':
        return 'Quản trị viên';
      case 'SPECIFIC':
        return 'Người dùng cụ thể';
      default:
        return audience;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SENT':
        return (
          <span className="text-green-600 bg-green-100 px-2 py-1 rounded-full text-xs">Đã gửi</span>
        );
      case 'DRAFT':
        return (
          <span className="text-gray-600 bg-gray-100 px-2 py-1 rounded-full text-xs">Nháp</span>
        );
      case 'FAILED':
        return (
          <span className="text-red-600 bg-red-100 px-2 py-1 rounded-full text-xs">Thất bại</span>
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Truyền thông</h1>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>Tạo thông báo mới</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Tạo thông báo</DialogTitle>
              <DialogDescription>Gửi thông báo đến người dùng hệ thống.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Tiêu đề</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Tiêu đề thông báo"
                />
              </div>
              <div>
                <Label>Nội dung</Label>
                <Textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Nội dung thông báo"
                  rows={5}
                />
              </div>
              <div>
                <Label>Loại</Label>
                <select
                  className="w-full border rounded p-2"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as 'EMAIL' | 'IN_APP' })}
                >
                  <option value="IN_APP">Trong Web</option>
                  <option value="EMAIL">Email</option>
                </select>
              </div>
              <div>
                <Label>Đối tượng</Label>
                <select
                  className="w-full border rounded p-2"
                  value={form.audience}
                  onChange={(e) => setForm({ ...form, audience: e.target.value as any })}
                >
                  <option value="ALL">Tất cả</option>
                  <option value="STUDENTS">Học viên</option>
                  <option value="TEACHERS">Giảng viên</option>
                  <option value="ADMINS">Quản trị viên</option>
                  <option value="SPECIFIC">Người dùng cụ thể (nhập ID)</option>
                </select>
              </div>
              {form.audience === 'SPECIFIC' && (
                <div>
                  <Label>ID người dùng (cách nhau bằng dấu phẩy)</Label>
                  <Input
                    placeholder="user-id-1, user-id-2"
                    onChange={(e) =>
                      setForm({
                        ...form,
                        targetUserIds: e.target.value
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleCreate} disabled={submitting}>
                {submitting ? 'Đang gửi...' : 'Gửi thông báo'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách thông báo</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : notifications.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Chưa có thông báo nào.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Tiêu đề</TableCell>
                  <TableCell>Loại</TableCell>
                  <TableCell>Đối tượng</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Ngày gửi</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.map((notif) => (
                  <TableRow key={notif.id}>
                    <TableCell className="font-medium">{notif.title}</TableCell>
                    <TableCell>{notif.type === 'EMAIL' ? 'Email' : 'In-app'}</TableCell>
                    <TableCell>{getAudienceLabel(notif.audience)}</TableCell>
                    <TableCell>{getStatusBadge(notif.status)}</TableCell>
                    <TableCell>{new Date(notif.sentAt).toLocaleString('vi-VN')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            isLoading={loading}
          />
        </CardContent>
      </Card>
    </div>
  );
}

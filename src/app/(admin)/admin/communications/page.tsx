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
  description: string;
  userId: string;
  link?: string;
  type?: string;
  createdAt: string;
  readAt?: string;
}

export default function AdminCommunicationsPage() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'IN_APP' as 'IN_APP' | 'EMAIL',
    link: '',
    userId: '', // sẽ gán từ user.id
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
    if (!form.title.trim() || !form.description.trim()) {
      toast.error('Vui lòng nhập đầy đủ tiêu đề và nội dung');
      return;
    }
    if (!user?.id) {
      toast.error('Không tìm thấy thông tin người dùng');
      return;
    }

    setSubmitting(true);
    try {
      await adminApi.createNotification({
        userId: user.id,
        title: form.title,
        description: form.description,
        link: form.link || '/notifications',
        type: form.type,
      });
      toast.success('Thông báo đã được tạo');
      setCreateDialogOpen(false);
      setForm({ title: '', description: '', type: 'IN_APP', link: '', userId: '' });
      fetchNotifications();
    } catch {
      toast.error('Tạo thông báo thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading)
    return (
      <div className="p-8 flex justify-center">
        <Spinner />
      </div>
    );
  if (!isAdmin) return null;

  // Phân trang frontend (nếu backend chưa trả về meta)
  const paginated = notifications.slice((page - 1) * limit, page * limit);

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
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Nội dung thông báo"
                  rows={5}
                />
              </div>
              <div>
                <Label>Loại</Label>
                <select
                  className="w-full border rounded p-2"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as 'IN_APP' | 'EMAIL' })}
                >
                  <option value="IN_APP">Trong Web</option>
                  <option value="EMAIL">Email</option>
                </select>
              </div>
              <div>
                <Label>Đường dẫn (tùy chọn)</Label>
                <Input
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  placeholder="/notifications"
                />
              </div>
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
          <CardTitle>Danh sách thông báo đã gửi</CardTitle>
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
                  <TableCell>Nội dung</TableCell>
                  <TableCell>Loại</TableCell>
                  <TableCell>Người nhận</TableCell>
                  <TableCell>Ngày tạo</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((n) => (
                  <TableRow key={n.id}>
                    <TableCell className="font-medium">{n.title}</TableCell>
                    <TableCell className="truncate max-w-xs">{n.description}</TableCell>
                    <TableCell>{n.type === 'EMAIL' ? 'Email' : 'In-app'}</TableCell>
                    <TableCell>{n.userId}</TableCell>
                    <TableCell>{new Date(n.createdAt).toLocaleString('vi-VN')}</TableCell>
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

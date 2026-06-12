'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import { SelectFilter } from '@/components/ui/select-filter';
import { Pagination } from '@/components/ui/pagination';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/hooks/auth/useAuth';

interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'admin' | 'teacher' | 'student';
  status: 'active' | 'locked' | 'inactive';
  createdAt: string;
}

export default function AdminUsersPage() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editRole, setEditRole] = useState<string>('');
  const [editStatus, setEditStatus] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAdmin) router.push('/forbidden');
  }, [isAdmin, authLoading, router]);

  useEffect(() => {
    if (isAdmin) fetchUsers();
  }, [search, roleFilter, page, isAdmin]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/admin/users', {
        params: { q: search, role: roleFilter || undefined, page, limit },
      });
      setUsers(response.data.data);
      setTotalPages(response.data.meta.totalPages);
    } catch (error) {
      toast.error('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setEditRole(user.role);
    setEditStatus(user.status);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    setSubmitting(true);
    try {
      await apiClient.patch(`/admin/users/${editingUser.id}`, {
        role: editRole,
        status: editStatus,
      });
      toast.success('Cập nhật người dùng thành công');
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      toast.error('Cập nhật thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Xóa người dùng "${name}"? Hành động không thể hoàn tác.`)) return;
    try {
      await apiClient.delete(`/admin/users/${id}`);
      toast.success('Xóa người dùng thành công');
      fetchUsers();
    } catch (error) {
      toast.error('Xóa thất bại');
    }
  };

  const viewDetail = (id: string) => router.push(`/admin/users/${id}`);

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Quản trị viên';
      case 'teacher':
        return 'Giảng viên';
      default:
        return 'Học viên';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="text-green-600 bg-green-100 px-2 py-1 rounded-full text-xs">
            Hoạt động
          </span>
        );
      case 'LOCKED':
        return (
          <span className="text-red-600 bg-red-100 px-2 py-1 rounded-full text-xs">Đã khóa</span>
        );
      default:
        return (
          <span className="text-gray-600 bg-gray-100 px-2 py-1 rounded-full text-xs">
            Không hoạt động
          </span>
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
        <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
        <p className="text-muted-foreground">
          Quản lý tất cả tài khoản (học viên, giảng viên, admin)
        </p>
      </div>

      <div className="flex flex-wrap gap-4">
        <Input
          placeholder="Tìm theo tên hoặc email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <SelectFilter
          label="Vai trò"
          options={[
            { label: 'Tất cả', value: '' },
            { label: 'Học viên', value: 'student' },
            { label: 'Giảng viên', value: 'teacher' },
            { label: 'Quản trị viên', value: 'admin' },
          ]}
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-left">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-4 font-medium">Họ tên</th>
                <th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium">Vai trò</th>
                <th className="p-4 font-medium">Trạng thái</th>
                <th className="p-4 font-medium">Ngày tạo</th>
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
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8">
                    Không có người dùng nào
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-t hover:bg-muted/50">
                    <td className="p-4 font-medium">{user.fullName}</td>
                    <td className="p-4">{user.email}</td>
                    <td className="p-4">{getRoleLabel(user.role)}</td>
                    <td className="p-4">{getStatusBadge(user.status)}</td>
                    <td className="p-4">{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => viewDetail(user.id)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(user)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(user.id, user.fullName)}
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

      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa người dùng</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div>
                <Label>Họ tên</Label>
                <Input value={editingUser.fullName} disabled />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={editingUser.email} disabled />
              </div>
              <div>
                <Label>Vai trò</Label>
                <Select value={editRole} onValueChange={setEditRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Học viên</SelectItem>
                    <SelectItem value="teacher">Giảng viên</SelectItem>
                    <SelectItem value="admin">Quản trị viên</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Trạng thái</Label>
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Hoạt động</SelectItem>
                    <SelectItem value="locked">Đã khóa</SelectItem>
                    <SelectItem value="inactive">Không hoạt động</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              Hủy
            </Button>
            <Button onClick={handleUpdateUser} disabled={submitting}>
              {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

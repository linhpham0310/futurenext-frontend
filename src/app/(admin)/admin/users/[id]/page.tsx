'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'react-hot-toast';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/hooks/auth/useAuth';

export default function UserDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAdmin, isLoading: authLoading } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAdmin) router.push('/forbidden');
  }, [isAdmin, authLoading, router]);

  useEffect(() => {
    if (isAdmin) {
      const fetchUser = async () => {
        try {
          const { data } = await apiClient.get(`/admin/users/${id}`);
          setUser(data);
        } catch {
          toast.error('Không tải được thông tin người dùng');
        } finally {
          setLoading(false);
        }
      };
      fetchUser();
    }
  }, [id, isAdmin]);

  if (authLoading || loading)
    return (
      <div className="p-8 flex justify-center">
        <Spinner />
      </div>
    );
  if (!isAdmin) return null;
  if (!user) return <div className="p-8">Không tìm thấy người dùng</div>;

  const roleLabel: Record<string, string> = {
    admin: 'Quản trị viên',
    teacher: 'Giảng viên',
    student: 'Học viên',
  };
  const statusLabel: Record<string, string> = { active: 'Hoạt động', locked: 'Đã khóa' };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Chi tiết người dùng</h1>
        <Button variant="outline" onClick={() => router.push(`/admin/users/${id}/edit`)}>
          Chỉnh sửa
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Thông tin tài khoản</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>
            <strong>Họ tên:</strong> {user.fullName}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Vai trò:</strong> {roleLabel[user.role]}
          </p>
          <p>
            <strong>Trạng thái:</strong> {statusLabel[user.status]}
          </p>
          <p>
            <strong>Ngày tạo:</strong> {new Date(user.createdAt).toLocaleDateString('vi-VN')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'react-hot-toast';
import { adminApi } from '@/lib/api';
import { useAuth } from '@/hooks/auth/useAuth';
import { BackButton } from '@/components/ui/back-button';

interface AuditLog {
  id: string;
  action: string;
  actor?: { fullName: string };
  createdAt: string;
}

export default function UserDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAdmin, isLoading: authLoading } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAdmin) router.push('/forbidden');
  }, [isAdmin, authLoading, router]);

  useEffect(() => {
    if (isAdmin) {
      const fetchUser = async () => {
        try {
          const { data } = await adminApi.getUserById(id as string);
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

  const fetchAuditLogs = async () => {
    setAuditLoading(true);
    try {
      const response = await adminApi.getUserAuditLogs(id as string);
      setAuditLogs(response.data);
    } catch {
      toast.error('Không tải được lịch sử hoạt động');
    } finally {
      setAuditLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!confirm('Gửi link đặt lại mật khẩu cho người dùng này?')) return;
    try {
      await adminApi.triggerResetPassword(id as string);
      toast.success('Link reset mật khẩu đã được gửi đến email của người dùng');
    } catch {
      toast.error('Gửi link thất bại');
    }
  };

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
  const statusLabel: Record<string, string> = {
    active: 'Hoạt động',
    pending_email_verify: 'Chờ xác thực',
    locked: 'Đã khóa',
    deleted: 'Đã xóa',
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Chi tiết người dùng</h1>
        <div className="flex gap-2">
          <BackButton />
          <Button variant="outline" onClick={handleResetPassword}>
            Gửi link reset mật khẩu
          </Button>
          <Button variant="outline" onClick={() => router.push(`/admin/users/${id}/edit`)}>
            Chỉnh sửa
          </Button>
        </div>
      </div>

      <Tabs
        defaultValue="info"
        onValueChange={(value) => {
          if (value === 'audit') fetchAuditLogs();
        }}
      >
        <TabsList>
          <TabsTrigger value="info">Thông tin</TabsTrigger>
          <TabsTrigger value="audit">Lịch sử hoạt động</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
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
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle>Nhật ký hoạt động</CardTitle>
            </CardHeader>
            <CardContent>
              {auditLoading ? (
                <div className="flex justify-center py-4">
                  <Spinner />
                </div>
              ) : auditLogs.length === 0 ? (
                <p className="text-muted-foreground">Chưa có hoạt động nào.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableCell>Hành động</TableCell>
                      <TableCell>Người thực hiện</TableCell>
                      <TableCell>Thời gian</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>{log.action}</TableCell>
                        <TableCell>{log.actor?.fullName || 'Hệ thống'}</TableCell>
                        <TableCell>{new Date(log.createdAt).toLocaleString('vi-VN')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

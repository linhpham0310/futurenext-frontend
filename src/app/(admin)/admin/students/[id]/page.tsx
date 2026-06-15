'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'react-hot-toast';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/hooks/auth/useAuth';

export default function StudentDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAdmin, isLoading: authLoading } = useAuth();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAdmin) router.push('/forbidden');
  }, [isAdmin, authLoading, router]);

  useEffect(() => {
    if (isAdmin) {
      const fetchStudent = async () => {
        try {
          const { data } = await apiClient.get(`/admin/students/${id}`);
          setStudent(data);
        } catch {
          toast.error('Không tải được thông tin học viên');
        } finally {
          setLoading(false);
        }
      };
      fetchStudent();
    }
  }, [id, isAdmin]);

  if (authLoading || loading)
    return (
      <div className="p-8 flex justify-center">
        <Spinner />
      </div>
    );
  if (!isAdmin) return null;
  if (!student) return <div className="p-8">Không tìm thấy học viên</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Chi tiết học viên</h1>
        <Button variant="outline" onClick={() => router.push(`/admin/students/${id}/edit`)}>
          Chỉnh sửa
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Thông tin cá nhân</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>
            <strong>Họ tên:</strong> {student.fullName}
          </p>
          <p>
            <strong>Email:</strong> {student.email}
          </p>
          <p>
            <strong>Số điện thoại:</strong> {student.phone || 'Chưa cập nhật'}
          </p>
          <p>
            <strong>Trạng thái:</strong> {student.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
          </p>
          <p>
            <strong>Ngày tham gia:</strong> {new Date(student.joinedAt).toLocaleDateString('vi-VN')}
          </p>
          <p>
            <strong>Số khóa học đã đăng ký:</strong> {student.coursesEnrolled}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

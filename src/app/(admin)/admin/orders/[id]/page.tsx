'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BackButton } from '@/components/ui/back-button';
import { adminApi } from '@/lib/api';
import { useAuth } from '@/hooks/auth/useAuth';

interface OrderDetail {
  id: string;
  amount: string | number;
  status: string;
  paymentMethod: string | null;
  paymentId: string | null;
  purchasedAt: string;
  createdAt: string;
  user: { fullName: string; email: string } | null;
  course: {
    id: string;
    title: string;
    thumbnailUrl?: string;
  } | null;
}

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAdmin, isLoading: authLoading } = useAuth();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAdmin) router.push('/forbidden');
  }, [isAdmin, authLoading, router]);

  useEffect(() => {
    if (isAdmin && id) {
      adminApi
        .getOrderDetail(id as string)
        .then(({ data }) => setOrder(data))
        .catch(() => toast.error('Không tải được thông tin đơn hàng'))
        .finally(() => setLoading(false));
    }
  }, [id, isAdmin]);

  const formatCurrency = (amount: string | number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(amount));

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="text-green-600 bg-green-100 px-2 py-1 rounded-full text-xs">
            Hoàn tất
          </span>
        );
      case 'PENDING':
        return (
          <span className="text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full text-xs">
            Chờ xử lý
          </span>
        );
      case 'FAILED':
        return (
          <span className="text-red-600 bg-red-100 px-2 py-1 rounded-full text-xs">Thất bại</span>
        );
      default:
        return (
          <span className="text-gray-500 bg-gray-100 px-2 py-1 rounded-full text-xs">{status}</span>
        );
    }
  };

  if (authLoading || loading) {
    return (
      <div className="p-8 flex justify-center">
        <Spinner />
      </div>
    );
  }
  if (!isAdmin) return null;
  if (!order) return <div className="p-8">Không tìm thấy đơn hàng</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <BackButton />
        <h1 className="text-2xl font-bold">Chi tiết đơn hàng</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin đơn hàng</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>
            <strong>Mã đơn hàng:</strong> {order.id}
          </p>
          <p>
            <strong>Trạng thái:</strong> {getStatusBadge(order.status)}
          </p>
          <p>
            <strong>Số tiền:</strong> {formatCurrency(order.amount)}
          </p>
          <p>
            <strong>Phương thức thanh toán:</strong> {order.paymentMethod || 'Không rõ'}
          </p>
          {order.paymentId && (
            <p>
              <strong>Mã giao dịch:</strong> {order.paymentId}
            </p>
          )}
          <p>
            <strong>Ngày mua:</strong> {new Date(order.purchasedAt).toLocaleString('vi-VN')}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Học viên</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>
            <strong>Họ tên:</strong> {order.user?.fullName || 'Không rõ'}
          </p>
          <p>
            <strong>Email:</strong> {order.user?.email || 'Không rõ'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Khóa học</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {order.course ? (
            <>
              <p>
                <strong>Tên khóa học:</strong> {order.course.title}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/admin/courses/${order.course!.id}`)}
              >
                Xem khóa học
              </Button>
            </>
          ) : (
            <p className="text-muted-foreground">Khóa học đã bị xóa</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth';
import { studentApi } from '@/lib/api';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { BackButton } from '@/components/ui/back-button';
import { BookOpen } from 'lucide-react';

interface OrderDetail {
  id: string;
  amount: string | number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  paymentMethod: string | null;
  paymentId: string | null;
  purchasedAt: string;
  createdAt: string;
  course: {
    id: string;
    title: string;
    description: string | null;
    thumbnailUrl: string | null;
  };
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && id) {
      studentApi
        .getOrderDetail(id as string)
        .then((res) => setOrder(res.data))
        .catch(() => toast.error('Không thể tải chi tiết đơn hàng'))
        .finally(() => setLoading(false));
    }
  }, [id, user]);

  if (authLoading || loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }
  if (!order) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Không tìm thấy đơn hàng.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/orders')}>
          Quay lại lịch sử đơn hàng
        </Button>
      </div>
    );
  }

  const statusMap: Record<string, { label: string; className: string }> = {
    COMPLETED: { label: 'Đã thanh toán', className: 'bg-green-100 text-green-700' },
    PENDING: { label: 'Chờ thanh toán', className: 'bg-yellow-100 text-yellow-700' },
    FAILED: { label: 'Thất bại', className: 'bg-red-100 text-red-700' },
  };
  const statusInfo = statusMap[order.status] || {
    label: order.status,
    className: 'bg-gray-100 text-gray-600',
  };
  const amount = Number(order.amount);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Chi tiết đơn hàng</h1>
        <BackButton />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center text-lg">
            <span>Đơn hàng #{order.id.slice(0, 8)}</span>
            <Badge className={statusInfo.className}>{statusInfo.label}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Ngày mua</p>
              <p className="font-medium">{new Date(order.purchasedAt).toLocaleString('vi-VN')}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Phương thức</p>
              <p className="font-medium">{order.paymentMethod || 'Không rõ'}</p>
            </div>
            {order.paymentId && (
              <div className="col-span-2">
                <p className="text-muted-foreground">Mã giao dịch</p>
                <p className="font-medium">{order.paymentId}</p>
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Khóa học</h3>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 shrink-0 rounded-md bg-muted overflow-hidden flex items-center justify-center">
                {order.course.thumbnailUrl ? (
                  <img
                    src={order.course.thumbnailUrl}
                    alt={order.course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <BookOpen className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="font-medium">{order.course.title}</p>
                {order.course.description && (
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {order.course.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="border-t pt-4 flex justify-between text-lg font-bold">
            <span>Tổng cộng</span>
            <span className="text-blue-700">{amount.toLocaleString('vi-VN')}đ</span>
          </div>

          {order.status === 'COMPLETED' && (
            <Button className="w-full" onClick={() => router.push(`/lx/${order.course.id}`)}>
              Vào học ngay
            </Button>
          )}
          {order.status === 'PENDING' && (
            <Button className="w-full" variant="outline" onClick={() => router.push('/checkout')}>
              Tiếp tục thanh toán
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

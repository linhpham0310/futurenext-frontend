'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import { studentApi } from '@/lib/api';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Package } from 'lucide-react';

interface Order {
  id: string;
  total: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  items: { title: string }[];
}

const statusMap: Record<string, { label: string; className: string }> = {
  COMPLETED: { label: 'Đã thanh toán', className: 'bg-green-100 text-green-700' },
  PENDING: { label: 'Chờ thanh toán', className: 'bg-yellow-100 text-yellow-700' },
  FAILED: { label: 'Thất bại', className: 'bg-red-100 text-red-700' },
};

export default function OrdersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      studentApi
        .getMyOrders()
        .then((res) => setOrders(res.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (authLoading || loading)
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Lịch sử đơn hàng</h1>
      </div>
      {orders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-12 w-12 mx-auto text-slate-300 mb-3" />
          <h2 className="text-xl font-semibold">Chưa có đơn hàng</h2>
          <Link href="/courses" className="mt-4 inline-block">
            <Button className="bg-blue-600">Mua khóa học ngay</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusInfo = statusMap[order.status] || {
              label: order.status,
              className: 'bg-gray-100 text-gray-600',
            };
            return (
              <Link href={`/orders/${order.id}`} key={order.id}>
                <Card className="hover:shadow-md transition cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">Đơn hàng #{order.id.slice(0, 8)}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.items.map((item) => item.title).join(', ')}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{order.total.toLocaleString('vi-VN')}đ</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${statusInfo.className}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

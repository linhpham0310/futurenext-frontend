'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SelectFilter } from '@/components/ui/select-filter';
import { Pagination } from '@/components/ui/pagination';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { Eye } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { useAuth } from '@/hooks/auth/useAuth';

interface Order {
  id: string;
  user: { fullName: string; email: string };
  course: { title: string };
  amount: number;
  currency: string;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELED';
  paymentMethod: 'STRIPE' | 'VNPAY' | 'QR';
  createdAt: string;
}

export default function AdminOrdersPage() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    if (!authLoading && !isAdmin) router.push('/forbidden');
  }, [isAdmin, authLoading, router]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminApi.getOrders({
        q: search,
        status: statusFilter || undefined,
        page,
        limit,
      });
      setOrders(response.data.items);
      setTotalPages(response.data.meta.totalPages);
    } catch {
      toast.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => {
    if (isAdmin) fetchOrders();
  }, [isAdmin, fetchOrders]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="text-green-600 bg-green-100 px-2 py-1 rounded-full text-xs">
            Đã thanh toán
          </span>
        );
      case 'PENDING':
        return (
          <span className="text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full text-xs">
            Chờ thanh toán
          </span>
        );
      case 'FAILED':
        return (
          <span className="text-red-600 bg-red-100 px-2 py-1 rounded-full text-xs">Thất bại</span>
        );
      case 'CANCELED':
        return (
          <span className="text-gray-600 bg-gray-100 px-2 py-1 rounded-full text-xs">Đã hủy</span>
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
      <h1 className="text-2xl font-bold">Quản lý đơn hàng</h1>
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
            { label: 'Chờ thanh toán', value: 'PENDING' },
            { label: 'Đã thanh toán', value: 'PAID' },
            { label: 'Thất bại', value: 'FAILED' },
            { label: 'Đã hủy', value: 'CANCELED' },
          ]}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        />
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>Mã đơn</TableCell>
                <TableCell>Người dùng</TableCell>
                <TableCell>Khóa học</TableCell>
                <TableCell>Số tiền</TableCell>
                <TableCell>Phương thức</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Ngày tạo</TableCell>
                <TableCell className="text-right">Thao tác</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <Spinner />
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Không có đơn hàng
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">{order.id.slice(0, 8)}</TableCell>
                    <TableCell>{order.user.fullName}</TableCell>
                    <TableCell>{order.course.title}</TableCell>
                    <TableCell>{order.amount.toLocaleString('vi-VN')}đ</TableCell>
                    <TableCell>{order.paymentMethod}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>{new Date(order.createdAt).toLocaleString('vi-VN')}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/admin/orders/${order.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        isLoading={loading}
      />
    </div>
  );
}

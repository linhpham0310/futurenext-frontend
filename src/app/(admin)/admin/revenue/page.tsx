'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, CreditCard } from 'lucide-react';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { Spinner } from '@/components/ui/spinner';
import { adminApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth';

interface RevenueStats {
  monthlyRevenue: number;
  totalRevenue: number;
  monthlyTransactions: number;
  growthPercent: number;
}

interface Transaction {
  id: string;
  userName: string;
  amount: number;
  type: 'PURCHASE' | 'REFUND';
  status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'REFUNDED' | 'COMPLETED'; // thêm REFUNDED và COMPLETED
  createdAt: string;
}

export default function AdminRevenuePage() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<RevenueStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txLoading, setTxLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAdmin) router.push('/forbidden');
  }, [isAdmin, authLoading, router]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await adminApi.getRevenueStats();
      setStats(response.data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    setTxLoading(true);
    try {
      // Gọi API với object params
      const response = await adminApi.getTransactions({ limit: 50 });
      setTransactions(response.data.items || []);
    } catch (error) {
      console.error(error);
      // Fallback: nếu lỗi, lấy tất cả và lọc
      try {
        const fallbackRes = await adminApi.getTransactions({ limit: 100 });
        const all = fallbackRes.data.items || [];
        // Chỉ lấy SUCCESS, COMPLETED, REFUNDED
        const filtered = all.filter(
          (tx: any) =>
            tx.status === 'SUCCESS' || tx.status === 'COMPLETED' || tx.status === 'REFUNDED'
        );
        setTransactions(filtered);
      } catch (e) {
        console.error(e);
        setTransactions([]);
      }
    } finally {
      setTxLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchStats();
      fetchTransactions();
    }
  }, [isAdmin, fetchStats, fetchTransactions]);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'SUCCESS':
      case 'COMPLETED':
        return 'Thành công';
      case 'REFUNDED':
        return 'Hoàn tiền';
      case 'PENDING':
        return 'Chờ thanh toán';
      case 'FAILED':
        return 'Thất bại';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
      case 'COMPLETED':
        return 'text-green-600';
      case 'REFUNDED':
        return 'text-blue-600';
      case 'PENDING':
        return 'text-yellow-600';
      case 'FAILED':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  if (authLoading) {
    return (
      <div className="p-8 flex justify-center">
        <Spinner />
      </div>
    );
  }
  if (!isAdmin) return null;

  // Lọc chỉ hiển thị SUCCESS, COMPLETED, REFUNDED để tính doanh thu
  const filteredTransactions = transactions.filter(
    (tx) => tx.status === 'SUCCESS' || tx.status === 'COMPLETED' || tx.status === 'REFUNDED'
  );

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Doanh thu hệ thống</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Doanh thu tháng này</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.monthlyRevenue?.toLocaleString('vi-VN') || '0'}đ
            </div>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> +{stats?.growthPercent || 0}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tổng doanh thu</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalRevenue?.toLocaleString('vi-VN') || '0'}đ
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Giao dịch tháng này</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.monthlyTransactions || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lịch sử giao dịch</CardTitle>
          <p className="text-sm text-muted-foreground">
            Chỉ hiển thị giao dịch <span className="font-medium text-green-600">Thành công</span> và{' '}
            <span className="font-medium text-blue-600">Hoàn tiền</span> (ảnh hưởng đến doanh thu)
          </p>
        </CardHeader>
        <CardContent>
          {txLoading ? (
            <div className="flex justify-center py-4">
              <Spinner />
            </div>
          ) : filteredTransactions.length === 0 ? (
            <p className="text-sm text-muted-foreground">Không có giao dịch nào.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Người dùng</TableCell>
                  <TableCell>Số tiền</TableCell>
                  <TableCell>Loại</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Ngày</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>{tx.userName}</TableCell>
                    <TableCell>{tx.amount.toLocaleString('vi-VN')}đ</TableCell>
                    <TableCell>{tx.type === 'PURCHASE' ? 'Mua khóa học' : 'Hoàn tiền'}</TableCell>
                    <TableCell className={getStatusColor(tx.status)}>
                      {getStatusLabel(tx.status)}
                    </TableCell>
                    <TableCell>{new Date(tx.createdAt).toLocaleString('vi-VN')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

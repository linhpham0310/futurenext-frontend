'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, CreditCard } from 'lucide-react';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { Spinner } from '@/components/ui/spinner';
import { apiClient } from '@/lib/api';
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
  status: 'SUCCESS' | 'FAILED';
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
      const response = await apiClient.get('/revenue/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    setTxLoading(true);
    try {
      const response = await apiClient.get('/revenue/admin/transactions', {
        params: { limit: 20 },
      });
      setTransactions(response.data);
    } catch (error) {
      console.error(error);
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

  if (authLoading)
    return (
      <div className="p-8 flex justify-center">
        <Spinner />
      </div>
    );
  if (!isAdmin) return null;

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
              {stats?.monthlyRevenue?.toLocaleString('vi-VN')}đ
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
              {stats?.totalRevenue?.toLocaleString('vi-VN')}đ
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
        </CardHeader>
        <CardContent>
          {txLoading ? (
            <div className="flex justify-center py-4">
              <Spinner />
            </div>
          ) : transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground">Chưa có giao dịch nào.</p>
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
                {transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>{tx.userName}</TableCell>
                    <TableCell>{tx.amount.toLocaleString('vi-VN')}đ</TableCell>
                    <TableCell>{tx.type === 'PURCHASE' ? 'Mua khóa học' : 'Hoàn tiền'}</TableCell>
                    <TableCell>
                      <span className={tx.status === 'SUCCESS' ? 'text-green-600' : 'text-red-600'}>
                        {tx.status === 'SUCCESS' ? 'Thành công' : 'Thất bại'}
                      </span>
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

'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { Spinner } from '@/components/ui/spinner';
import { teacherApi } from '@/lib/api';
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
  type: string;
  status: string;
  createdAt: string;
}

export default function TeacherRevenuePage() {
  const { isTeacher, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<RevenueStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [txLoading, setTxLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isTeacher) router.push('/forbidden');
  }, [isTeacher, authLoading, router]);

  // XÓA block useEffect .then() cũ ở đây

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const response = await teacherApi.getRevenueStats();
      setStats(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    setTxLoading(true);
    try {
      const response = await teacherApi.getTransactions(20);
      setTransactions(response.data.items);
    } catch (error) {
      console.error(error);
    } finally {
      setTxLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isTeacher) {
      fetchStats();
      fetchTransactions();
    }
  }, [isTeacher, fetchStats, fetchTransactions]);

  if (authLoading || loading)
    return (
      <div className="p-6 flex justify-center">
        <Spinner />
      </div>
    );
  if (!isTeacher) return null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Doanh thu của tôi</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Doanh thu tháng này</CardTitle>
            <DollarSign className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.monthlyRevenue?.toLocaleString('vi-VN')}đ
            </div>
            <p className="text-xs text-green-600">+{stats?.growthPercent || 0}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Tổng doanh thu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalRevenue?.toLocaleString('vi-VN')}đ
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Giao dịch tháng này</CardTitle>
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
            <Spinner />
          ) : transactions.length === 0 ? (
            <p>Chưa có giao dịch.</p>
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
                    <TableCell>{tx.status === 'SUCCESS' ? 'Thành công' : 'Thất bại'}</TableCell>
                    <TableCell>{new Date(tx.createdAt).toLocaleString()}</TableCell>
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

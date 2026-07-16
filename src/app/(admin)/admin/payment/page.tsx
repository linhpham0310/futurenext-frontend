'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination } from '@/components/ui/pagination';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  Clock,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  RefreshCw,
} from 'lucide-react';

// ---------- Types ----------
interface StatCard {
  label: string;
  value: string;
  change?: string;
  changePositive?: boolean;
  icon: React.ReactNode;
}

interface Transaction {
  id: string;
  code: string;
  studentName: string;
  courseTitle: string;
  amount: number;
  paymentMethod: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED' | 'REFUNDED';
  createdAt: string;
}

interface WithdrawalRequest {
  id: string;
  teacherId: string;
  teacherName: string;
  bankName: string;
  accountNumber: string;
  amount: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';
  requestedAt: string;
  courseCount: number;
  studentCount: number;
}

// ---------- Mock Data ----------
const MOCK_STATS: StatCard[] = [
  {
    label: 'Tổng doanh thu tháng này',
    value: '195.000.000đ',
    change: '+16% so với tháng trước',
    changePositive: true,
    icon: <DollarSign className="h-5 w-5 text-blue-500" />,
  },
  {
    label: 'Giao dịch thành công',
    value: '1.020',
    change: '+17% so với tháng trước',
    changePositive: true,
    icon: <CreditCard className="h-5 w-5 text-green-500" />,
  },
  {
    label: 'Chờ thanh toán GV',
    value: '58.500.000đ',
    change: '3 yêu cầu chờ duyệt',
    changePositive: false,
    icon: <Clock className="h-5 w-5 text-yellow-500" />,
  },
  {
    label: 'Doanh thu trung bình / đơn',
    value: '191.000đ',
    change: '-2% so với tháng trước',
    changePositive: false,
    icon: <TrendingUp className="h-5 w-5 text-purple-500" />,
  },
];

const MOCK_MONTHLY = [
  { month: 'T1', revenue: 45 },
  { month: 'T2', revenue: 52 },
  { month: 'T3', revenue: 48 },
  { month: 'T4', revenue: 70 },
  { month: 'T5', revenue: 80 },
  { month: 'T6', revenue: 95 },
  { month: 'T7', revenue: 110 },
  { month: 'T8', revenue: 130 },
  { month: 'T9', revenue: 150 },
  { month: 'T10', revenue: 170 },
  { month: 'T11', revenue: 185 },
  { month: 'T12', revenue: 195 },
];

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    code: 'TXN-001',
    studentName: 'Nguyễn Văn An',
    courseTitle: 'UI/UX Design Fundamentals',
    amount: 4200000,
    paymentMethod: 'Thẻ tín dụng',
    status: 'SUCCESS',
    createdAt: '2024-12-15T10:32:00Z',
  },
  {
    id: '2',
    code: 'TXN-002',
    studentName: 'Trần Thu Hằng',
    courseTitle: 'React & TypeScript Masterclass',
    amount: 5500000,
    paymentMethod: 'Momo',
    status: 'SUCCESS',
    createdAt: '2024-12-15T09:15:00Z',
  },
  {
    id: '3',
    code: 'TXN-003',
    studentName: 'Lê Minh Tuấn',
    courseTitle: 'Python for Data Science',
    amount: 3800000,
    paymentMethod: 'ZaloPay',
    status: 'PENDING',
    createdAt: '2024-12-14T16:45:00Z',
  },
  {
    id: '4',
    code: 'TXN-004',
    studentName: 'Phạm Thị Mai',
    courseTitle: 'Digital Marketing Mastery',
    amount: 2900000,
    paymentMethod: 'VNPay',
    status: 'SUCCESS',
    createdAt: '2024-12-14T14:20:00Z',
  },
  {
    id: '5',
    code: 'TXN-005',
    studentName: 'Hoàng Văn Đức',
    courseTitle: 'Flutter Mobile Development',
    amount: 4800000,
    paymentMethod: 'Thẻ tín dụng',
    status: 'REFUNDED',
    createdAt: '2024-12-13T11:10:00Z',
  },
  {
    id: '6',
    code: 'TXN-006',
    studentName: 'Vũ Thị Linh',
    courseTitle: 'Advanced SQL & Database',
    amount: 3200000,
    paymentMethod: 'Momo',
    status: 'FAILED',
    createdAt: '2024-12-13T08:50:00Z',
  },
];

const MOCK_WITHDRAWALS: WithdrawalRequest[] = [
  {
    id: 'wd1',
    teacherId: 't1',
    teacherName: 'Phạm Minh Hoàng',
    bankName: 'Vietcombank',
    accountNumber: '****4892',
    amount: 18500000,
    status: 'PENDING',
    requestedAt: '2024-12-10T00:00:00Z',
    courseCount: 3,
    studentCount: 892,
  },
  {
    id: 'wd2',
    teacherId: 't2',
    teacherName: 'Lê Văn Bình',
    bankName: 'MB Bank',
    accountNumber: '****2341',
    amount: 24200000,
    status: 'PENDING',
    requestedAt: '2024-12-09T00:00:00Z',
    courseCount: 5,
    studentCount: 1240,
  },
  {
    id: 'wd3',
    teacherId: 't3',
    teacherName: 'Nguyễn Thị Lan',
    bankName: 'Techcombank',
    accountNumber: '****7823',
    amount: 15800000,
    status: 'PROCESSING',
    requestedAt: '2024-12-08T00:00:00Z',
    courseCount: 4,
    studentCount: 720,
  },
];

// ---------- Helpers ----------
const formatCurrency = (amount: number) => amount.toLocaleString('vi-VN') + 'đ';
const formatDate = (dateStr: string) => new Date(dateStr).toLocaleString('vi-VN');

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, { label: string; className: string }> = {
    SUCCESS: { label: 'Thành công', className: 'bg-green-100 text-green-700' },
    PENDING: { label: 'Chờ xử lý', className: 'bg-yellow-100 text-yellow-700' },
    FAILED: { label: 'Thất bại', className: 'bg-red-100 text-red-700' },
    REFUNDED: { label: 'Hoàn tiền', className: 'bg-gray-100 text-gray-600' },
    COMPLETED: { label: 'Hoàn tất', className: 'bg-blue-100 text-blue-700' },
    PROCESSING: { label: 'Đang xử lý', className: 'bg-purple-100 text-purple-700' },
    REJECTED: { label: 'Từ chối', className: 'bg-red-100 text-red-700' },
  };
  const info = map[status] || { label: status, className: 'bg-gray-100 text-gray-600' };
  return <Badge className={info.className}>{info.label}</Badge>;
};

export default function AdminPaymentsPage() {
  const router = useRouter();
  const { isAdmin, isLoading: authLoading } = useAuth();

  // ---- State (all mock) ----
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Stats
  const [stats] = useState<StatCard[]>(MOCK_STATS);
  const [monthlyData] = useState(MOCK_MONTHLY);

  // Transactions
  const [transactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [txLoading] = useState(false);
  const [txPage, setTxPage] = useState(1);
  const [txTotalPages] = useState(1);
  const [txSearch, setTxSearch] = useState('');
  const [txStatus, setTxStatus] = useState('');

  // Withdrawals
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>(MOCK_WITHDRAWALS);
  const [wdLoading] = useState(false);
  const [wdPage, setWdPage] = useState(1);
  const [wdTotalPages] = useState(1);

  // Dialog
  const [wdDialog, setWdDialog] = useState<{ open: boolean; request: WithdrawalRequest | null }>({
    open: false,
    request: null,
  });
  const [rejectReason, setRejectReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // ---- Auth ----
  useEffect(() => {
    if (!authLoading && !isAdmin) router.push('/forbidden');
  }, [isAdmin, authLoading, router]);

  // ---- Handlers ----
  const handleApproveWithdrawal = (requestId: string) => {
    setSubmitting(true);
    setTimeout(() => {
      toast.success('Đã duyệt yêu cầu rút tiền');
      setWdDialog({ open: false, request: null });
      setWithdrawals((prev) =>
        prev.map((w) => (w.id === requestId ? { ...w, status: 'PROCESSING' } : w))
      );
      setSubmitting(false);
    }, 500);
  };

  const handleRejectWithdrawal = (requestId: string) => {
    if (!rejectReason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      toast.success('Đã từ chối yêu cầu rút tiền');
      setWdDialog({ open: false, request: null });
      setRejectReason('');
      setWithdrawals((prev) =>
        prev.map((w) => (w.id === requestId ? { ...w, status: 'REJECTED' } : w))
      );
      setSubmitting(false);
    }, 500);
  };

  const openWithdrawalDialog = (request: WithdrawalRequest) => {
    setWdDialog({ open: true, request });
    setRejectReason('');
  };

  // ---- Loading / Auth ----
  if (authLoading || loading) {
    return (
      <div className="p-8 flex justify-center">
        <Spinner />
      </div>
    );
  }
  if (!isAdmin) return null;

  // Lọc giao dịch (client-side)
  const filteredTransactions = transactions.filter((tx) => {
    const matchStatus = txStatus ? tx.status === txStatus : true;
    const matchSearch = txSearch
      ? tx.code.toLowerCase().includes(txSearch.toLowerCase()) ||
        tx.studentName.toLowerCase().includes(txSearch.toLowerCase()) ||
        tx.courseTitle.toLowerCase().includes(txSearch.toLowerCase())
      : true;
    return matchStatus && matchSearch;
  });

  // ---- Render ----
  const renderStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => (
        <Card key={idx}>
          <CardContent className="p-4 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-slate-50">{stat.icon}</div>
            <div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
              {stat.change && (
                <p
                  className={`text-xs flex items-center gap-1 ${
                    stat.changePositive ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {stat.changePositive ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {stat.change}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderMonthlyChart = () => {
    const max = Math.max(...monthlyData.map((d) => d.revenue), 1);
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Doanh thu theo tháng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between h-40 gap-1">
            {monthlyData.map((d) => {
              const height = (d.revenue / max) * 100;
              return (
                <div key={d.month} className="flex flex-col items-center flex-1">
                  <div
                    className="w-full bg-blue-500 rounded-t-sm transition-all"
                    style={{ height: `${Math.max(height * 0.7, 4)}%` }}
                  />
                  <span className="text-xs text-muted-foreground mt-1">{d.month}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderTransactions = () => (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-base">Giao dịch gần đây</CardTitle>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo mã, học viên, khóa học..."
                value={txSearch}
                onChange={(e) => setTxSearch(e.target.value)}
                className="pl-9 w-52"
              />
            </div>
            <Select value={txStatus} onValueChange={setTxStatus}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Tất cả" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tất cả</SelectItem>
                <SelectItem value="SUCCESS">Thành công</SelectItem>
                <SelectItem value="PENDING">Chờ xử lý</SelectItem>
                <SelectItem value="FAILED">Thất bại</SelectItem>
                <SelectItem value="REFUNDED">Hoàn tiền</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {txLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : filteredTransactions.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Không có giao dịch nào.</p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Mã GD</TableCell>
                  <TableCell>Học viên</TableCell>
                  <TableCell>Khóa học</TableCell>
                  <TableCell>P. thức</TableCell>
                  <TableCell className="text-right">Số tiền</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Thời gian</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="font-mono text-xs">{tx.code}</TableCell>
                    <TableCell>{tx.studentName}</TableCell>
                    <TableCell className="max-w-32 truncate">{tx.courseTitle}</TableCell>
                    <TableCell>{tx.paymentMethod}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(tx.amount)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={tx.status} />
                    </TableCell>
                    <TableCell className="text-xs">{formatDate(tx.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4">
              <Pagination
                currentPage={txPage}
                totalPages={txTotalPages}
                onPageChange={setTxPage}
                isLoading={txLoading}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );

  const renderWithdrawals = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Yêu cầu rút tiền của giảng viên</CardTitle>
      </CardHeader>
      <CardContent>
        {wdLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : withdrawals.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Không có yêu cầu rút tiền nào.</p>
        ) : (
          <>
            <div className="space-y-4">
              {withdrawals.map((wd) => (
                <div
                  key={wd.id}
                  className="border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{wd.teacherName}</span>
                      <Badge variant="outline">
                        {wd.bankName} - {wd.accountNumber}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mt-1">
                      <span>Yêu cầu ngày {formatDate(wd.requestedAt)}</span>
                      <span>Khóa học {wd.courseCount}</span>
                      <span>Học viên {wd.studentCount}</span>
                      <StatusBadge status={wd.status} />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-bold">{formatCurrency(wd.amount)}</span>
                    {wd.status === 'PENDING' && (
                      <Button size="sm" onClick={() => openWithdrawalDialog(wd)}>
                        <Eye className="h-4 w-4 mr-1" /> Duyệt
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Pagination
                currentPage={txPage}
                totalPages={txTotalPages}
                onPageChange={setTxPage}
                isLoading={txLoading}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý Thanh toán</h1>
          <p className="text-muted-foreground">
            Theo dõi giao dịch, doanh thu và thanh toán giảng viên
          </p>
        </div>
        <Button variant="outline" onClick={() => window.location.reload()}>
          <RefreshCw className="h-4 w-4 mr-1" /> Làm mới
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="transactions">Giao dịch</TabsTrigger>
          <TabsTrigger value="withdrawals">Yêu cầu rút tiền</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {renderStats()}
          {renderMonthlyChart()}
          {renderTransactions()}
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          {renderTransactions()}
        </TabsContent>

        <TabsContent value="withdrawals" className="space-y-6">
          {renderWithdrawals()}
        </TabsContent>
      </Tabs>

      {/* Dialog duyệt / từ chối rút tiền */}
      <Dialog
        open={wdDialog.open}
        onOpenChange={(open) => !open && setWdDialog({ open: false, request: null })}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Duyệt yêu cầu rút tiền</DialogTitle>
            <DialogDescription>
              Xem thông tin và xác nhận duyệt hoặc từ chối yêu cầu của giảng viên.
            </DialogDescription>
          </DialogHeader>
          {wdDialog.request && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Giảng viên</p>
                  <p className="font-medium">{wdDialog.request.teacherName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Số tiền</p>
                  <p className="font-medium text-blue-600">
                    {formatCurrency(wdDialog.request.amount)}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Ngân hàng</p>
                  <p className="font-medium">
                    {wdDialog.request.bankName} - {wdDialog.request.accountNumber}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Khóa học</p>
                  <p className="font-medium">{wdDialog.request.courseCount}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Học viên</p>
                  <p className="font-medium">{wdDialog.request.studentCount}</p>
                </div>
              </div>

              <div>
                <Label htmlFor="rejectReason">Lý do từ chối (nếu có)</Label>
                <Textarea
                  id="rejectReason"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Nhập lý do từ chối..."
                  rows={2}
                />
              </div>

              <DialogFooter className="gap-2">
                <Button
                  variant="destructive"
                  onClick={() => handleRejectWithdrawal(wdDialog.request!.id)}
                  disabled={submitting}
                >
                  <XCircle className="h-4 w-4 mr-1" /> Từ chối
                </Button>
                <Button
                  onClick={() => handleApproveWithdrawal(wdDialog.request!.id)}
                  disabled={submitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-1" /> Duyệt
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

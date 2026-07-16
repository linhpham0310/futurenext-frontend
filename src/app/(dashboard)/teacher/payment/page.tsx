'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import { teacherApi } from '@/lib/api';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trash2, Star, Plus, Wallet, Building2, CreditCard } from 'lucide-react';

interface PaymentAccount {
  id: string;
  type: 'BANK' | 'MOMO' | 'ZALOPAY' | 'VNPAY';
  bankName?: string;
  accountNumber: string;
  accountHolder: string;
  isDefault: boolean;
  createdAt: string;
}

export default function PaymentSettingsPage() {
  const { isTeacher, isLoading: authLoading } = useAuth();
  const [accounts, setAccounts] = useState<PaymentAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    type: 'BANK' as PaymentAccount['type'],
    bankName: '',
    accountNumber: '',
    accountHolder: '',
  });

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await teacherApi.getPaymentAccounts();
      setAccounts(res.data);
    } catch {
      toast.error('Không thể tải danh sách tài khoản thanh toán');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isTeacher) fetchAccounts();
  }, [isTeacher]);

  const handleCreate = async () => {
    if (!form.accountNumber.trim() || !form.accountHolder.trim()) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    if (form.type === 'BANK' && !form.bankName.trim()) {
      toast.error('Vui lòng nhập tên ngân hàng');
      return;
    }
    setSubmitting(true);
    try {
      await teacherApi.createPaymentAccount(form);
      toast.success('Thêm tài khoản thanh toán thành công');
      setDialogOpen(false);
      setForm({ type: 'BANK', bankName: '', accountNumber: '', accountHolder: '' });
      fetchAccounts();
    } catch {
      toast.error('Thêm thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa tài khoản này?')) return;
    try {
      await teacherApi.deletePaymentAccount(id);
      toast.success('Xóa thành công');
      fetchAccounts();
    } catch {
      toast.error('Xóa thất bại');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await teacherApi.setDefaultPaymentAccount(id);
      toast.success('Đặt làm mặc định thành công');
      fetchAccounts();
    } catch {
      toast.error('Thất bại');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="p-8 flex justify-center">
        <Spinner />
      </div>
    );
  }
  if (!isTeacher) return null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'BANK':
        return <Building2 className="h-5 w-5 text-blue-500" />;
      case 'MOMO':
      case 'ZALOPAY':
        return <Wallet className="h-5 w-5 text-purple-500" />;
      default:
        return <CreditCard className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'BANK':
        return 'Ngân hàng';
      case 'MOMO':
        return 'Momo';
      case 'ZALOPAY':
        return 'ZaloPay';
      case 'VNPAY':
        return 'VNPay';
      default:
        return type;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Cài đặt thanh toán</h1>
          <p className="text-muted-foreground">Quản lý tài khoản nhận thanh toán</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Thêm tài khoản
        </Button>
      </div>

      {accounts.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <p>Chưa có tài khoản thanh toán nào.</p>
            <p className="text-sm">Thêm tài khoản để nhận thanh toán từ khóa học.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accounts.map((acc) => (
            <Card key={acc.id} className={acc.isDefault ? 'border-blue-500 border-2' : ''}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(acc.type)}
                    <div>
                      <p className="font-medium">
                        {acc.type === 'BANK' ? acc.bankName : getTypeLabel(acc.type)}
                      </p>
                      <p className="text-sm text-muted-foreground">{acc.accountHolder}</p>
                    </div>
                  </div>
                  {acc.isDefault && <Badge variant="default">Mặc định</Badge>}
                </div>
                <p className="text-sm font-mono">{acc.accountNumber}</p>
                <div className="flex gap-2 pt-2">
                  {!acc.isDefault && (
                    <Button size="sm" variant="outline" onClick={() => handleSetDefault(acc.id)}>
                      <Star className="h-3 w-3 mr-1" /> Đặt mặc định
                    </Button>
                  )}
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(acc.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog thêm tài khoản */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm tài khoản thanh toán</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Loại tài khoản</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as any })}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BANK">Ngân hàng</SelectItem>
                  <SelectItem value="MOMO">Momo</SelectItem>
                  <SelectItem value="ZALOPAY">ZaloPay</SelectItem>
                  <SelectItem value="VNPAY">VNPay</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.type === 'BANK' && (
              <div>
                <Label>Tên ngân hàng</Label>
                <Input
                  value={form.bankName}
                  onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                  placeholder="VD: Vietcombank"
                />
              </div>
            )}
            <div>
              <Label>Số tài khoản</Label>
              <Input
                value={form.accountNumber}
                onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                placeholder="Số tài khoản"
              />
            </div>
            <div>
              <Label>Chủ tài khoản</Label>
              <Input
                value={form.accountHolder}
                onChange={(e) => setForm({ ...form, accountHolder: e.target.value })}
                placeholder="Tên chủ tài khoản"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleCreate} disabled={submitting}>
              {submitting ? 'Đang tạo...' : 'Tạo tài khoản'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

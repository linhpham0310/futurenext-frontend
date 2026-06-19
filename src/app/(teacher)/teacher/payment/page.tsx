'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import { apiClient } from '@/lib/api';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function PaymentSettingsPage() {
  const { isTeacher, isLoading: authLoading } = useAuth();
  const [bankAccount, setBankAccount] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isTeacher) {
      apiClient
        .get('/payment')
        .then((res) => {
          setBankAccount(res.data.bankAccount || '');
          setBankName(res.data.bankName || '');
          setAccountHolder(res.data.accountHolder || '');
        })
        .finally(() => setLoading(false));
    }
  }, [isTeacher]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.put('/payment', { bankAccount, bankName, accountHolder });
      toast.success('Cập nhật thông tin thanh toán thành công');
    } catch {
      toast.error('Cập nhật thất bại');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading)
    return (
      <div className="p-8 flex justify-center">
        <Spinner />
      </div>
    );
  if (!isTeacher) return null;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Cài đặt thanh toán</h1>
      <Card>
        <CardHeader>
          <CardTitle>Thông tin nhận thanh toán</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Tên ngân hàng</label>
              <Input value={bankName} onChange={(e) => setBankName(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm mb-1">Số tài khoản</label>
              <Input
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Chủ tài khoản</label>
              <Input
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

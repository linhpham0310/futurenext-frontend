'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/auth/useAuth';
import { studentApi } from '@/lib/api';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { BackButton } from '@/components/ui/back-button';

interface CartSummary {
  items: { courseId: string; title: string; price: number }[];
  total: number;
}

export default function CheckoutPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [cart, setCart] = useState<CartSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'STRIPE' | 'VNPAY' | 'QR'>('STRIPE');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      studentApi
        .getCartSummary()
        .then((res) => setCart(res.data))
        .catch(() => toast.error('Không thể tải thông tin thanh toán'))
        .finally(() => setLoading(false));
    }
  }, [user]);

  const handlePayment = async () => {
    if (!cart || cart.items.length === 0) {
      toast.error('Giỏ hàng trống');
      return;
    }
    setSubmitting(true);
    try {
      const response = await studentApi.createOrder({
        courseIds: cart.items.map((item) => item.courseId),
        paymentMethod,
      });
      if (response.data.paymentUrl) {
        window.location.href = response.data.paymentUrl;
      } else {
        toast.success('Đơn hàng đã được tạo, chờ xác nhận thanh toán');
        router.push('/orders');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Thanh toán thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading)
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  if (!cart || cart.items.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Giỏ hàng trống</h2>
        <Link href="/courses" className="mt-4 inline-block">
          <Button>Quay lại mua sắm</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Thanh toán</h1>
        <BackButton />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Xác nhận đơn hàng</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {cart.items.map((item) => (
            <div key={item.courseId} className="flex justify-between border-b pb-2">
              <span>{item.title}</span>
              <span>{item.price.toLocaleString('vi-VN')}đ</span>
            </div>
          ))}
          <div className="flex justify-between font-bold pt-2">
            <span>Tổng cộng</span>
            <span>{cart.total.toLocaleString('vi-VN')}đ</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Phương thức thanh toán</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as any)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="STRIPE" id="stripe" />
              <Label htmlFor="stripe">Thẻ tín dụng (Stripe)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="VNPAY" id="vnpay" />
              <Label htmlFor="vnpay">VNPay</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="QR" id="qr" />
              <Label htmlFor="qr">Chuyển khoản QR</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Button onClick={handlePayment} disabled={submitting} className="w-full" size="lg">
        {submitting ? 'Đang xử lý...' : `Thanh toán ${cart.total.toLocaleString('vi-VN')}đ`}
      </Button>
    </div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/auth/useAuth';
import { studentApi } from '@/lib/api';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { BackButton } from '@/components/ui/back-button';
import { CreditCard, Wallet, QrCode, ShieldCheck, ShoppingBag, CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

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

  // QR dialog state
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrOrderId, setQrOrderId] = useState<string | null>(null);
  const [qrConfirmed, setQrConfirmed] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (user) {
      Promise.all([
        studentApi.getCartSummary(),
        studentApi.getMyCourses().catch(() => ({ data: [] })),
      ])
        .then(([cartRes, ownedRes]) => {
          const ownedIds = ownedRes.data.map((c: any) => c.id);
          const items = cartRes.data.items.filter((item: any) => !ownedIds.includes(item.courseId));
          setCart({ ...cartRes.data, items });
          if (items.length === 0) {
            toast.info('Giỏ hàng trống hoặc đã sở hữu hết');
          }
        })
        .catch(() => toast.error('Không thể tải thông tin thanh toán'))
        .finally(() => setLoading(false));
    }
  }, [user]);

  // Dọn interval khi rời trang
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const startPollingOrder = (orderId: string) => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const res = await studentApi.getOrderStatus(orderId);
        if (res.data.status === 'COMPLETED') {
          if (pollRef.current) clearInterval(pollRef.current);
          setQrConfirmed(true);
          toast.success('Thanh toán thành công!');
          setTimeout(() => {
            setQrDialogOpen(false);
            router.push('/my-courses');
          }, 1200);
        }
      } catch {
        // im lặng, thử lại lần poll sau
      }
    }, 3000);
  };

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

      if (response.data.success) {
        toast.success(response.data.message || 'Đăng ký thành công!');
        router.push('/my-courses');
        return;
      }

      // Thanh toán QR: hiện dialog + poll trạng thái
      if (paymentMethod === 'QR' && response.data.qrDataUrl) {
        setQrDataUrl(response.data.qrDataUrl);
        setQrOrderId(response.data.orderId);
        setQrConfirmed(false);
        setQrDialogOpen(true);
        startPollingOrder(response.data.orderId);
        return;
      }

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
      <div className="text-center py-16">
        <ShoppingBag className="h-12 w-12 mx-auto text-slate-300 mb-3" />
        <h2 className="text-xl font-semibold">Giỏ hàng trống</h2>
        <p className="text-muted-foreground mt-1">Thêm khóa học vào giỏ trước khi thanh toán.</p>
        <Link href="/courses" className="mt-4 inline-block">
          <Button>Quay lại mua sắm</Button>
        </Link>
      </div>
    );
  }

  const paymentOptions = [
    { value: 'STRIPE', label: 'Thẻ tín dụng / Thẻ ghi nợ', icon: CreditCard },
    { value: 'VNPAY', label: 'VNPay', icon: Wallet },
    { value: 'QR', label: 'Chuyển khoản QR', icon: QrCode },
  ] as const;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Thanh toán</h1>
        <BackButton />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Xác nhận đơn hàng</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {cart.items.map((item) => (
            <div
              key={item.courseId}
              className="flex justify-between items-center border-b pb-3 last:border-0 last:pb-0"
            >
              <span className="font-medium">{item.title}</span>
              <span className="text-blue-600 font-semibold">
                {item.price.toLocaleString('vi-VN')}đ
              </span>
            </div>
          ))}
          <div className="flex justify-between font-bold pt-2 text-lg">
            <span>Tổng cộng</span>
            <span className="text-blue-700">{cart.total.toLocaleString('vi-VN')}đ</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Phương thức thanh toán</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={paymentMethod}
            onValueChange={(v) => setPaymentMethod(v as any)}
            className="space-y-1"
          >
            {paymentOptions.map(({ value, label, icon: Icon }) => (
              <label
                key={value}
                htmlFor={value}
                className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                  paymentMethod === value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <RadioGroupItem value={value} id={value} />
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{label}</span>
              </label>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      <Button onClick={handlePayment} disabled={submitting} className="w-full gap-2" size="lg">
        {submitting ? (
          <>
            <Spinner className="h-4 w-4" />
            Đang xử lý...
          </>
        ) : (
          `Thanh toán ${cart.total.toLocaleString('vi-VN')}đ`
        )}
      </Button>

      <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5" /> Giao dịch được bảo mật
      </p>

      {/* Dialog QR thanh toán */}
      <Dialog
        open={qrDialogOpen}
        onOpenChange={(open) => {
          if (!open && pollRef.current) clearInterval(pollRef.current);
          setQrDialogOpen(open);
        }}
      >
        <DialogContent className="max-w-sm text-center">
          {qrConfirmed ? (
            <div className="py-6 space-y-3">
              <CheckCircle2 className="h-14 w-14 text-green-500 mx-auto" />
              <p className="font-semibold text-lg">Thanh toán thành công!</p>
              <p className="text-sm text-muted-foreground">Đang chuyển đến khóa học của bạn...</p>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Quét mã để thanh toán</DialogTitle>
                <DialogDescription>
                  Mở app ngân hàng và quét mã QR bên dưới để chuyển khoản.
                </DialogDescription>
              </DialogHeader>
              {qrDataUrl && (
                <img
                  src={qrDataUrl}
                  alt="QR thanh toán"
                  className="w-56 h-56 mx-auto my-4 rounded-lg border"
                />
              )}
              <p className="text-2xl font-bold text-blue-700">
                {cart.total.toLocaleString('vi-VN')}đ
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-3">
                <Spinner className="h-4 w-4" />
                Đang chờ xác nhận thanh toán...
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Trang sẽ tự động chuyển tiếp sau khi nhận được thanh toán.
              </p>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

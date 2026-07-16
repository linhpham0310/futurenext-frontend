'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/auth/useAuth';
import { studentApi, usersApi } from '@/lib/api'; // ✅ đã thêm usersApi
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import {
  CreditCard,
  Wallet,
  QrCode,
  ShoppingBag,
  CheckCircle2,
  Tag,
  X,
  Coins,
  ArrowLeft,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface CartSummary {
  items: {
    courseId: string;
    title: string;
    price: number;
    originalPrice?: number;
    instructor?: string;
    duration?: string;
    lessons?: number;
  }[];
  total: number;
}

export default function CheckoutPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [cart, setCart] = useState<CartSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'STRIPE' | 'VNPAY' | 'QR' | 'WALLET'>(
    'STRIPE'
  );
  const [submitting, setSubmitting] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(
    null
  );
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [phone, setPhone] = useState('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [userFullName, setUserFullName] = useState<string>('');
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrOrderId, setQrOrderId] = useState<string | null>(null);
  const [qrConfirmed, setQrConfirmed] = useState(false);
  const [showProcessing, setShowProcessing] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Debug
  console.log('👤 Checkout user:', user);

  // Lấy email và fullName từ user, nếu thiếu thì gọi API profile
  useEffect(() => {
    if (user) {
      if (user.email) {
        setUserEmail(user.email);
      } else {
        usersApi
          .getProfile()
          .then((res) => {
            if (res.data?.email) {
              setUserEmail(res.data.email);
              setUserFullName(res.data.fullName || user.fullName || '');
            }
          })
          .catch(() => console.warn('Không lấy được email từ profile'));
      }
      if (user.fullName) {
        setUserFullName(user.fullName);
      }
    }
  }, [user]);

  // Fetch cart
  const fetchCart = async () => {
    if (!user) return;
    try {
      const [cartRes, ownedRes, ordersRes] = await Promise.all([
        studentApi.getCartSummary(),
        studentApi.getMyCourses().catch(() => ({ data: [] })),
        studentApi.getMyOrders().catch(() => ({ data: [] })),
      ]);
      const ownedIds = ownedRes.data.map((c: any) => c.id);
      const pendingIds = ordersRes.data
        .filter((o: any) => o.status === 'PENDING')
        .flatMap((o: any) => o.courseIds || []);
      const blockedIds = [...ownedIds, ...pendingIds];
      const items = cartRes.data.items.filter((item: any) => !blockedIds.includes(item.courseId));
      setCart({ ...cartRes.data, items });
      if (items.length === 0) {
        toast.info('Giỏ hàng trống hoặc các khóa học đã được sở hữu/đang xử lý');
      }
    } catch {
      toast.error('Không thể tải thông tin thanh toán');
    }
  };

  useEffect(() => {
    if (!user) return;
    setPhone(user?.phone || '');
    const qrParam = searchParams.get('qr');
    const orderIdParam = searchParams.get('orderId');
    if (qrParam && orderIdParam) {
      setQrDataUrl(decodeURIComponent(qrParam));
      setQrOrderId(orderIdParam);
      setQrDialogOpen(true);
      startPollingOrder(orderIdParam);
    }
    setLoading(true);
    fetchCart().finally(() => setLoading(false));
  }, [user, searchParams]);

  // Poll interval cleanup
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
        // im lặng
      }
    }, 3000);
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return toast.error('Vui lòng nhập mã');
    setApplyingCoupon(true);
    try {
      const res = await studentApi.applyCoupon(couponCode.trim());
      setAppliedCoupon({ code: couponCode.trim(), discount: res.data.discount });
      toast.success('Áp dụng mã thành công!');
    } catch {
      toast.error('Mã giảm giá không hợp lệ');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  const handlePayment = async () => {
    if (!cart || cart.items.length === 0) {
      toast.error('Giỏ hàng trống');
      return;
    }
    if (!agreeTerms) {
      toast.error('Vui lòng đồng ý với Điều khoản dịch vụ');
      return;
    }

    setShowProcessing(true);
    setSubmitting(true);

    try {
      const response = await studentApi.createOrder({
        courseIds: cart.items.map((item) => item.courseId),
        paymentMethod: paymentMethod === 'WALLET' ? 'WALLET' : paymentMethod,
        couponCode: appliedCoupon?.code,
        // phone: phone.trim() || undefined, // tạm thời bỏ để build
      });

      if (response.data.success) {
        toast.success(response.data.message || 'Đăng ký thành công!');
        router.push('/my-courses');
        return;
      }

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
      console.error('❌ Checkout error:', error);
      const msg = error?.response?.data?.message || error?.message || 'Thanh toán thất bại';

      // Xử lý lỗi khóa học đã sở hữu / đang chờ
      if (msg.includes('đã sở hữu') || msg.includes('đang chờ xử lý')) {
        let courseNames: string[] = [];
        const match = msg.match(/cho:\s*(.+)/);
        if (match) {
          const raw = match[1].trim();
          courseNames = raw.split(/[,，、\s+và\s+]+/).filter(Boolean);
          if (courseNames.length === 1 && courseNames[0].includes(',')) {
            courseNames = courseNames[0]
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean);
          }
        }

        if (courseNames.length > 0) {
          const removedItems = cart.items.filter((item) => courseNames.includes(item.title));
          if (removedItems.length > 0) {
            setCart((prev) => ({
              ...prev!,
              items: prev!.items.filter((item) => !courseNames.includes(item.title)),
            }));
            for (const item of removedItems) {
              try {
                await studentApi.removeFromCart(item.courseId);
              } catch (e) {}
            }
            await fetchCart();
            toast.error(
              `Đã loại bỏ ${removedItems.length} khóa học đã được sở hữu hoặc đang chờ xử lý. Vui lòng thử lại.`
            );
            setTimeout(() => router.push('/cart'), 1000);
          } else {
            toast.error(msg);
          }
        } else {
          toast.error(msg);
          await fetchCart();
          setTimeout(() => router.push('/cart'), 1000);
        }
      } else {
        toast.error(msg);
      }
    } finally {
      setSubmitting(false);
      setShowProcessing(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

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

  const subtotal = cart.items.reduce((sum, item) => sum + item.price, 0);
  const discount = appliedCoupon?.discount || 0;
  const total = Math.max(0, subtotal - discount);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Hoàn tất đơn hàng</h1>
        </div>
        <Link
          href="/cart"
          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
        >
          <ArrowLeft className="h-3 w-3" /> Quay lại giỏ hàng
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thông tin người mua</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-medium">Họ và tên</label>
                <Input
                  value={userFullName || user?.fullName || 'Chưa có tên'}
                  disabled
                  className="bg-gray-50 text-gray-900 font-medium"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Tên đăng nhập, không thể thay đổi
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Email *</label>
                <Input
                  value={userEmail || user?.email || 'Chưa có email'}
                  disabled
                  className="bg-gray-50 text-gray-900 font-medium"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Email đăng nhập, không thể thay đổi
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Số điện thoại</label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Nhập số điện thoại (tùy chọn)"
                  className="text-gray-900"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Dùng để liên hệ khi cần thiết (tùy chọn)
                </p>
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
                {[
                  { value: 'STRIPE', label: 'Thẻ tín dụng / Ghi nợ', icon: CreditCard },
                  { value: 'VNPAY', label: 'VNPay', icon: Wallet },
                  { value: 'QR', label: 'Chuyển khoản QR', icon: QrCode },
                  { value: 'WALLET', label: 'Số dư ví', icon: Coins },
                ].map(({ value, label, icon: Icon }) => (
                  <label
                    key={value}
                    className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition ${
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

          <div className="flex items-start gap-2">
            <Checkbox
              id="terms"
              checked={agreeTerms}
              onCheckedChange={(checked) => setAgreeTerms(!!checked)}
            />
            <label htmlFor="terms" className="text-sm text-muted-foreground">
              Tôi đồng ý với{' '}
              <a href="/terms" className="text-blue-600 underline">
                Điều khoản dịch vụ
              </a>{' '}
              và{' '}
              <a href="/refund" className="text-blue-600 underline">
                Chính sách hoàn tiền
              </a>
            </label>
          </div>

          <Button
            onClick={handlePayment}
            disabled={submitting || !agreeTerms}
            className="w-full gap-2"
            size="lg"
          >
            {submitting ? (
              <>
                <Spinner className="h-4 w-4" />
                Đang xử lý...
              </>
            ) : (
              `Xác nhận thanh toán - ${total.toLocaleString('vi-VN')}đ`
            )}
          </Button>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Đơn hàng của bạn</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.items.map((item) => (
                <div key={item.courseId} className="border-b pb-3 last:border-0">
                  <p className="font-medium">{item.title}</p>
                  {item.instructor && (
                    <p className="text-sm text-muted-foreground">{item.instructor}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {item.duration && <span>⏱ {item.duration}</span>}
                    {item.lessons && <span>📚 {item.lessons} bài học</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-bold">{item.price.toLocaleString('vi-VN')}đ</span>
                    {item.originalPrice && item.originalPrice > item.price && (
                      <span className="text-xs line-through text-muted-foreground">
                        {item.originalPrice.toLocaleString('vi-VN')}đ
                      </span>
                    )}
                  </div>
                </div>
              ))}

              <div className="flex items-center gap-2 pt-2 border-t">
                <Tag className="h-4 w-4 text-muted-foreground shrink-0" />
                <Input
                  placeholder="Nhập mã (ABA010)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  disabled={!!appliedCoupon}
                  className="flex-1"
                />
                {appliedCoupon ? (
                  <Button variant="ghost" size="sm" onClick={removeCoupon}>
                    <X className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={applyCoupon}
                    disabled={applyingCoupon || !couponCode.trim()}
                    size="sm"
                  >
                    {applyingCoupon ? <Spinner className="h-4 w-4" /> : 'Áp dụng'}
                  </Button>
                )}
              </div>
              {appliedCoupon && (
                <Badge variant="secondary" className="text-green-600 bg-green-50">
                  Giảm {appliedCoupon.discount.toLocaleString('vi-VN')}đ
                </Badge>
              )}

              <div className="space-y-1 text-sm pt-2 border-t">
                <div className="flex justify-between">
                  <span>Tạm tính ({cart.items.length} khóa học)</span>
                  <span>{subtotal.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Thuế VAT</span>
                  <span>Đã bao gồm</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá</span>
                    <span>-{discount.toLocaleString('vi-VN')}đ</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Tổng cộng</span>
                  <span className="text-blue-700">{total.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <p>✅ Hoàn tiền trong 30 ngày nếu không hài lòng</p>
                <p>✅ Truy cập trọn đời trên mọi thiết bị</p>
                <p>✅ Chứng chỉ hoàn thành khóa học</p>
                <p>✅ Hỗ trợ từ giảng viên qua Q&A</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

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
              <p className="text-2xl font-bold text-blue-700">{total.toLocaleString('vi-VN')}đ</p>
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

      <Dialog open={showProcessing} onOpenChange={setShowProcessing}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Đang xử lý đơn hàng</DialogTitle>
            <DialogDescription>Vui lòng chờ trong giây lát...</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-6 space-y-4">
            <Spinner className="h-12 w-12 text-blue-600" />
            <p className="text-sm text-muted-foreground">
              Đang tạo đơn hàng và chuyển đến cổng thanh toán
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

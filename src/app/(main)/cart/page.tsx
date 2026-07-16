'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth';
import { studentApi } from '@/lib/api';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Trash2, ShoppingBag, ArrowRight, CreditCard, Wallet, QrCode, Tag, X } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { BackButton } from '@/components/ui/back-button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface CartItem {
  courseId: string;
  title: string;
  price: number;
  originalPrice?: number;
  instructor?: string;
  duration?: string;
  lessons?: number;
  thumbnail?: string;
}

export default function CartPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'STRIPE' | 'VNPAY' | 'QR'>('STRIPE');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(
    null
  );
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  // Fetch cart
  useEffect(() => {
    if (!user) return;
    const fetchCart = async () => {
      setLoading(true);
      try {
        // Lấy giỏ hàng và loại bỏ khóa học đã sở hữu hoặc đang chờ
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
        const cartItems = cartRes.data.items || [];
        const filtered = cartItems.filter((item: any) => !blockedIds.includes(item.courseId));
        if (filtered.length < cartItems.length) {
          toast.info('Một số khóa học đã được sở hữu hoặc đang xử lý, đã loại bỏ khỏi giỏ');
        }
        setItems(filtered);
      } catch {
        toast.error('Không thể tải giỏ hàng');
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [user]);

  // Xóa item
  const removeItem = async (courseId: string) => {
    setRemovingId(courseId);
    try {
      await studentApi.removeFromCart(courseId);
      setItems((prev) => prev.filter((item) => item.courseId !== courseId));
      toast.success('Đã xóa khỏi giỏ hàng');
    } catch {
      toast.error('Xóa thất bại');
    } finally {
      setRemovingId(null);
    }
  };

  // Áp dụng mã giảm giá
  const applyCoupon = async () => {
    if (!couponCode.trim()) return toast.error('Vui lòng nhập mã');
    setApplyingCoupon(true);
    try {
      const res = await studentApi.applyCoupon(couponCode.trim());
      setAppliedCoupon({ code: couponCode.trim(), discount: res.data.discount });
      toast.success(`Áp dụng mã giảm giá thành công!`);
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

  // Tính tổng
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const discount = appliedCoupon?.discount || 0;
  const total = Math.max(0, subtotal - discount);

  // Thanh toán
  const handleCheckout = async () => {
    if (items.length === 0) return;
    if (submitting) return;

    setSubmitting(true);
    try {
      const courseIds = items.map((item) => item.courseId);
      const response = await studentApi.createOrder({
        courseIds,
        paymentMethod,
        couponCode: appliedCoupon?.code,
      });

      if (response.data.success) {
        toast.success(response.data.message || 'Đăng ký thành công!');
        setItems([]);
        router.push('/my-courses');
        return;
      }

      if (response.data.paymentUrl) {
        window.location.href = response.data.paymentUrl;
      } else if (response.data.qrDataUrl) {
        // Nếu có QR, chuyển sang checkout với data
        router.push(
          `/checkout?qr=${encodeURIComponent(response.data.qrDataUrl)}&orderId=${response.data.orderId}`
        );
      } else {
        toast.success('Đơn hàng đã được tạo thành công!');
        setItems([]);
        router.push('/orders');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Thanh toán thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16 border-2 border-dashed border-slate-200 rounded-xl">
        <ShoppingBag className="h-12 w-12 mx-auto text-slate-300 mb-3" />
        <h2 className="text-xl font-semibold">Giỏ hàng trống</h2>
        <p className="text-muted-foreground mt-1">Hãy thêm khóa học vào giỏ hàng để thanh toán.</p>
        <Link href="/courses" className="mt-4 inline-block">
          <Button>Khám phá khóa học</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Giỏ hàng của bạn</h1>
          <p className="text-sm text-muted-foreground">{items.length} khóa học trong giỏ</p>
        </div>
        <BackButton />
      </div>

      {/* Danh sách sản phẩm */}
      <div className="space-y-3">
        {items.map((item) => {
          const hasDiscount = item.originalPrice && item.originalPrice > item.price;
          return (
            <Card key={item.courseId} className="overflow-hidden">
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold truncate">{item.title}</h3>
                      {item.instructor && (
                        <p className="text-sm text-muted-foreground">Bởi {item.instructor}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
                        {item.duration && <span>⏱ {item.duration}</span>}
                        {item.lessons && <span>📚 {item.lessons} bài học</span>}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.courseId)}
                      disabled={submitting || removingId === item.courseId}
                      className="shrink-0"
                    >
                      {removingId === item.courseId ? (
                        <Spinner className="h-4 w-4" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-red-500" />
                      )}
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="font-bold text-blue-600">
                      {item.price.toLocaleString('vi-VN')}đ
                    </span>
                    {hasDiscount && (
                      <span className="text-xs line-through text-muted-foreground">
                        {item.originalPrice?.toLocaleString('vi-VN')}đ
                      </span>
                    )}
                    {hasDiscount && (
                      <Badge variant="destructive" className="text-xs">
                        -{Math.round((1 - item.price / item.originalPrice!) * 100)}%
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Mã giảm giá */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-slate-50 rounded-lg border">
        <div className="flex-1 w-full flex items-center gap-2">
          <Tag className="h-4 w-4 text-muted-foreground shrink-0" />
          <Input
            placeholder="Nhập mã giảm giá"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            disabled={!!appliedCoupon}
            className="max-w-xs"
          />
          {appliedCoupon ? (
            <Button variant="ghost" size="sm" onClick={removeCoupon}>
              <X className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={applyCoupon} disabled={applyingCoupon || !couponCode.trim()} size="sm">
              {applyingCoupon ? <Spinner className="h-4 w-4" /> : 'Áp dụng'}
            </Button>
          )}
        </div>
        {appliedCoupon && (
          <Badge variant="secondary" className="text-green-600 bg-green-50">
            Giảm {appliedCoupon.discount.toLocaleString('vi-VN')}đ
          </Badge>
        )}
      </div>

      {/* Tóm tắt đơn hàng và thanh toán */}
      <Card className="border-blue-100 bg-blue-50/40">
        <CardContent className="p-4 space-y-4">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Tạm tính ({items.length} khóa học)</span>
              <span>{subtotal.toLocaleString('vi-VN')}đ</span>
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

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <Select
                value={paymentMethod}
                onValueChange={(v) => setPaymentMethod(v as any)}
                disabled={submitting}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Phương thức" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STRIPE">Thẻ tín dụng</SelectItem>
                  <SelectItem value="VNPAY">VNPay</SelectItem>
                  <SelectItem value="QR">Chuyển khoản QR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleCheckout}
              disabled={submitting}
              className="gap-2 min-w-[200px]"
              size="lg"
            >
              {submitting ? (
                <>
                  <Spinner className="h-4 w-4" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  Thanh toán {total.toLocaleString('vi-VN')}đ <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground flex flex-wrap gap-3">
            <span>🔒 Thanh toán an toàn</span>
            <span>💰 Hoàn tiền trong 30 ngày</span>
            <span>📚 Truy cập trọn đời</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

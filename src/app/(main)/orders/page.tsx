'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import { studentApi } from '@/lib/api';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Package, Search, Star, BookOpen, TrendingUp, CheckCircle, Eye } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface OrderItem {
  id?: string;
  courseId: string;
  title: string;
  price: number;
  originalPrice?: number;
  isReviewed?: boolean;
}

interface Order {
  id: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELED';
  total: number;
  createdAt: string;
  items: OrderItem[];
  paymentMethod: string;
  orderCode: string;
  isReviewed?: boolean;
}

const statusMap: Record<string, { label: string; className: string }> = {
  COMPLETED: { label: 'Thành công', className: 'bg-green-100 text-green-700' },
  PENDING: { label: 'Chờ thanh toán', className: 'bg-yellow-100 text-yellow-700' },
  FAILED: { label: 'Thất bại', className: 'bg-red-100 text-red-700' },
  CANCELED: { label: 'Đã hủy', className: 'bg-gray-100 text-gray-600' },
};

export default function OrdersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);

  // Stats
  const [totalCourses, setTotalCourses] = useState(0);
  const [completedOrders, setCompletedOrders] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);

  // Review dialog
  const [reviewDialog, setReviewDialog] = useState<{
    open: boolean;
    orderId: string;
    courseId: string;
  }>({
    open: false,
    orderId: '',
    courseId: '',
  });
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (user) {
      studentApi
        .getMyOrders()
        .then((res) => {
          const data = res.data;
          console.log('📦 Orders data:', data);

          const normalized = data.map((order: any) => ({
            ...order,
            items: (order.items || []).map((item: any) => ({
              ...item,
              price: Number(item.price) || 0,
              originalPrice: item.originalPrice ? Number(item.originalPrice) : undefined,
              courseId: item.courseId || item.id,
              id: item.id || item.courseId,
            })),
            total: Number(order.total) || 0,
          }));
          setOrders(normalized);

          const completed = normalized.filter((o: any) => o.status === 'COMPLETED');
          const totalCoursesCount = completed.reduce(
            (acc: number, o: any) => acc + (o.items?.length || 0),
            0
          );
          const totalSpentAmount = completed.reduce(
            (acc: number, o: any) => acc + Number(o.total || 0),
            0
          );
          setTotalCourses(totalCoursesCount);
          setCompletedOrders(completed.length);
          setTotalSpent(totalSpentAmount);
        })
        .catch((err) => {
          console.error('❌ Lỗi fetch orders:', err);
          toast.error('Không thể tải lịch sử đơn hàng');
        })
        .finally(() => setLoading(false));
    }
  }, [user]);

  useEffect(() => {
    if (!search.trim()) {
      setFilteredOrders(orders);
    } else {
      const q = search.toLowerCase();
      setFilteredOrders(
        orders.filter(
          (o) =>
            o.orderCode?.toLowerCase().includes(q) ||
            o.items.some((item) => item.title.toLowerCase().includes(q))
        )
      );
    }
  }, [search, orders]);

  const handleReview = async () => {
    if (!reviewDialog.open) return;
    if (!rating) return toast.error('Vui lòng chọn số sao');
    setSubmittingReview(true);
    try {
      await studentApi.submitReview(reviewDialog.orderId, reviewDialog.courseId, rating, comment);
      toast.success('Cảm ơn bạn đã đánh giá!');
      setOrders((prev) =>
        prev.map((order) =>
          order.id === reviewDialog.orderId
            ? {
                ...order,
                items: order.items.map((item) =>
                  item.courseId === reviewDialog.courseId ? { ...item, isReviewed: true } : item
                ),
              }
            : order
        )
      );
      setReviewDialog({ open: false, orderId: '', courseId: '' });
      setRating(5);
      setComment('');
    } catch {
      toast.error('Gửi đánh giá thất bại');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Lịch sử mua hàng</h1>
        <p className="text-sm text-muted-foreground">
          Xem lại tất cả các đơn hàng và truy cập khóa học đã mua
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">{totalCourses}</p>
              <p className="text-sm text-muted-foreground">Khóa học đã mua</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{completedOrders}</p>
              <p className="text-sm text-muted-foreground">Đơn thành công</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-yellow-500" />
            <div>
              <p className="text-2xl font-bold">{totalSpent.toLocaleString('vi-VN')}đ</p>
              <p className="text-sm text-muted-foreground">Tổng đã chi</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo mã đơn hoặc tên khóa học..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-xl">
          <Package className="h-12 w-12 mx-auto text-slate-300 mb-3" />
          <h2 className="text-xl font-semibold">Chưa có đơn hàng</h2>
          <Link href="/courses" className="mt-4 inline-block">
            <Button>Mua khóa học ngay</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const statusInfo = statusMap[order.status] || {
              label: order.status,
              className: 'bg-gray-100 text-gray-600',
            };
            return (
              <Card key={order.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div>
                      <p className="font-semibold text-sm">
                        {order.orderCode || `ORD-${order.id.slice(0, 8)}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleString('vi-VN')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={statusInfo.className}>{statusInfo.label}</Badge>
                      <span className="font-bold">
                        {(order.total || 0).toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  </div>

                  {order.items.map((item) => {
                    const price = Number(item.price) || 0;
                    const originalPrice = item.originalPrice
                      ? Number(item.originalPrice)
                      : undefined;
                    const itemKey = item.id || item.courseId || `${order.id}-${item.title}`;

                    return (
                      <div
                        key={itemKey}
                        className="border-t pt-3 mt-3 first:border-0 first:pt-0 first:mt-0"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex-1">
                            <p className="font-medium">{item.title}</p>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span>
                                {price.toLocaleString('vi-VN')}đ
                                {originalPrice && originalPrice > price && (
                                  <>
                                    {' '}
                                    <span className="line-through text-xs">
                                      {originalPrice.toLocaleString('vi-VN')}đ
                                    </span>
                                  </>
                                )}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {order.status === 'COMPLETED' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => router.push(`/lx/${item.courseId}`)}
                                  variant="default"
                                >
                                  Học ngay
                                </Button>
                                {!item.isReviewed && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      setReviewDialog({
                                        open: true,
                                        orderId: order.id,
                                        courseId: item.courseId,
                                      })
                                    }
                                    className="gap-1"
                                  >
                                    <Star className="h-3 w-3" /> Đánh giá
                                  </Button>
                                )}
                              </>
                            )}
                            {order.status === 'PENDING' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => router.push('/checkout')}
                              >
                                Tiếp tục thanh toán
                              </Button>
                            )}
                            <Link href={`/orders/${order.id}`}>
                              <Button size="sm" variant="outline" className="gap-1">
                                <Eye className="h-3 w-3" /> Chi tiết
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialog đánh giá */}
      <Dialog
        open={reviewDialog.open}
        onOpenChange={(open) =>
          !open && setReviewDialog({ open: false, orderId: '', courseId: '' })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đánh giá khóa học</DialogTitle>
            <DialogDescription>Chia sẻ trải nghiệm của bạn về khóa học này.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Số sao</Label>
              <RadioGroup
                value={String(rating)}
                onValueChange={(v) => setRating(Number(v))}
                className="flex gap-1 mt-1"
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <label
                    key={star}
                    className={`p-2 rounded-md cursor-pointer transition ${
                      rating === star ? 'bg-yellow-100 border-yellow-300' : 'hover:bg-slate-50'
                    }`}
                  >
                    <RadioGroupItem value={String(star)} className="sr-only" />
                    <Star
                      className={`h-6 w-6 ${
                        star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  </label>
                ))}
              </RadioGroup>
            </div>
            <div>
              <Label>Bình luận</Label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Chia sẻ cảm nhận của bạn..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReviewDialog({ open: false, orderId: '', courseId: '' })}
            >
              Hủy
            </Button>
            <Button onClick={handleReview} disabled={submittingReview}>
              {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

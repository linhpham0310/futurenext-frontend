'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth';
import { studentApi } from '@/lib/api';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { BackButton } from '@/components/ui/back-button';

interface CartItem {
  courseId: string;
  title: string;
  price: number;
  thumbnail?: string;
}

export default function CartPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      studentApi
        .getCart()
        .then((res) => setItems(res.data))
        .catch(() => toast.error('Không thể tải giỏ hàng'))
        .finally(() => setLoading(false));
    }
  }, [user]);

  const removeItem = async (courseId: string) => {
    try {
      await studentApi.removeFromCart(courseId);
      setItems((prev) => prev.filter((item) => item.courseId !== courseId));
      toast.success('Đã xóa khỏi giỏ hàng');
    } catch {
      toast.error('Xóa thất bại');
    }
  };

  const total = items.reduce((sum, item) => sum + item.price, 0);

  const handleCheckout = () => {
    if (items.length === 0) return;
    router.push('/checkout');
  };

  if (authLoading || loading)
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Giỏ hàng</h1>
        <BackButton />
      </div>
      {items.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingBag className="h-12 w-12 mx-auto text-slate-300 mb-3" />
          <h2 className="text-xl font-semibold">Giỏ hàng trống</h2>
          <p className="text-muted-foreground">Hãy thêm khóa học vào giỏ hàng để thanh toán.</p>
          <Link href="/courses" className="mt-4 inline-block">
            <Button className="bg-blue-600">Khám phá khóa học</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {items.map((item) => (
              <Card key={item.courseId}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {item.price.toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeItem(item.courseId)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Tổng cộng</p>
                <p className="text-2xl font-bold">{total.toLocaleString('vi-VN')}đ</p>
              </div>
              <Button onClick={handleCheckout} className="gap-2">
                Tiến hành thanh toán <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

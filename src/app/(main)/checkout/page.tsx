// src/app/(main)/checkout/page.tsx
'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function CheckoutPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Thanh toán</h1>
      <Card>
        <CardHeader>
          <CardTitle>Giỏ hàng</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Chưa có khóa học nào trong giỏ hàng.</p>
          <Button className="mt-4" disabled>
            Thanh toán
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

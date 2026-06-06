// src/app/(admin)/admin/revenue/page.tsx
'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, CreditCard } from 'lucide-react';
import { StatCard } from '@/components/shared/stat-card';

export default function AdminRevenuePage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Doanh thu hệ thống</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Doanh thu tháng này" value="345.000.000đ" icon={DollarSign} description="+12%" />
        <StatCard title="Tổng doanh thu" value="2.1 tỷ" icon={CreditCard} />
        <StatCard title="Giao dịch tháng này" value="156" icon={DollarSign} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Lịch sử giao dịch</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Chưa có dữ liệu.</p>
        </CardContent>
      </Card>
    </div>
  );
}

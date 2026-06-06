// src/app/(teacher)/teacher/revenue/page.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, CreditCard } from 'lucide-react';
import { StatCard } from '@/components/shared/stat-card';

export default function TeacherRevenuePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Doanh thu</h1>
        <p className="text-muted-foreground">Theo dõi thu nhập từ các khóa học của bạn.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Doanh thu tháng này" value="12.500.000đ" icon={DollarSign} description="+8% so với tháng trước" />
        <StatCard title="Tổng doanh thu" value="245.000.000đ" icon={CreditCard} />
        <StatCard title="Giao dịch tháng này" value="48" icon={DollarSign} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lịch sử giao dịch</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Chưa có giao dịch nào.</p>
        </CardContent>
      </Card>
    </div>
  );
}

// src/app/(admin)/admin/dashboard/page.tsx
'use client';

import { useAuth } from '@/hooks/auth/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, DollarSign, Clock } from 'lucide-react';
import { StatCard } from '@/components/shared/stat-card';
import { PageLoading } from '@/components/shared/page-loading';

export default function AdminDashboardPage() {
  const { user, isLoading, isAdmin } = useAuth();

  if (isLoading) return <PageLoading />;
  if (!isAdmin) return null;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bảng điều khiển Admin</h1>
        <p className="text-muted-foreground">Chào {user?.fullName}, đây là tổng quan hệ thống.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Tổng người dùng" value="1,234" icon={Users} description="+20% từ tháng trước" />
        <StatCard title="Khóa học" value="42" icon={BookOpen} description="5 chờ duyệt" />
        <StatCard title="Doanh thu tháng" value="125M" icon={DollarSign} description="+12% so với tháng trước" />
        <StatCard title="Yêu cầu đang chờ" value="18" icon={Clock} description="12 hồ sơ giáo viên" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hoạt động gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Chưa có hoạt động nào.</p>
        </CardContent>
      </Card>
    </div>
  );
}

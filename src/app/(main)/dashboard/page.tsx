// src/app/(main)/dashboard/page.tsx
'use client';

import { useAuth } from '@/hooks/auth/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Clock, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { StatCard } from '@/components/shared/stat-card';

export default function StudentDashboardPage() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.role !== 'STUDENT') {
      router.replace(user?.role === 'ADMIN' ? '/admin/dashboard' : '/teacher/dashboard');
    }
  }, [isLoading, isAuthenticated, user, router]);

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Chào mừng, {user?.fullName || 'Học viên'}</h1>
        <p className="text-muted-foreground">Tiếp tục hành trình học tập của bạn.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Khóa học đang học" value="0" icon={BookOpen} />
        <StatCard title="Giờ học tuần này" value="0h" icon={Clock} />
        <StatCard title="Điểm trung bình" value="N/A" icon={TrendingUp} />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Tiếp tục học</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Khóa học mẫu</CardTitle>
              <CardDescription>Tiến độ 0%</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '0%' }}></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

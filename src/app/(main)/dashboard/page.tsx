// src/app/(main)/dashboard/page.tsx
'use client';

import { useAuth } from '@/hooks/auth/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { BookOpen, Clock, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

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
      {/* Nhóm 1: Chào mừng + thống kê */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Chào mừng, {user?.fullName || 'Học viên'}</h1>
        <p className="text-muted-foreground">Tiếp tục hành trình học tập của bạn.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Khóa học đang học</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Giờ học tuần này</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0h</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Điểm trung bình</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">N/A</div>
          </CardContent>
        </Card>
      </div>

      {/* Nhóm 2: Khóa học đang học (placeholder) */}
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

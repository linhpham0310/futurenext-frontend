// src/app/(teacher)/teacher/dashboard/page.tsx
'use client';

import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, DollarSign, Award } from 'lucide-react';
import { useAuth } from '@/hooks/auth/useAuth';

export default function TeacherDashboardPage() {
  const { isTeacher, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="h-10 w-10" />
      </div>
    );
  }

  if (!isTeacher) return null;

  const stats = [
    { title: 'Khóa học', value: '0', icon: BookOpen, color: 'bg-blue-100 text-blue-700' },
    { title: 'Học viên', value: '0', icon: Users, color: 'bg-green-100 text-green-700' },
    { title: 'Doanh thu', value: '0đ', icon: DollarSign, color: 'bg-yellow-100 text-yellow-700' },
    { title: 'Chứng chỉ', value: '0', icon: Award, color: 'bg-purple-100 text-purple-700' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Bảng điều khiển giảng viên</h1>
        <p className="text-slate-500 mt-1">
          Chào mừng {user?.fullName}, bạn đã đăng nhập với vai trò giảng viên.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">{stat.title}</CardTitle>
              <div className={`p-2 rounded-full ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quản lý khóa học</CardTitle>
          <CardDescription>
            Tại đây bạn có thể tạo và quản lý các khóa học của mình.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500">
            Tính năng quản lý khóa học sẽ được phát triển trong các sprint tiếp theo.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

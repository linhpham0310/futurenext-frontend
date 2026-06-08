'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, DollarSign, Award } from 'lucide-react';
import { useAuth } from '@/hooks/auth/useAuth';
import { apiClient } from '@/lib/api';
import { Spinner } from '@/components/ui/spinner';

interface DashboardStats {
  totalCourses: number;
  totalStudents: number;
  totalRevenue: number;
  totalCertificates: number;
}

export default function TeacherDashboardPage() {
  const { user, isTeacher } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
    totalCertificates: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isTeacher) {
      apiClient
        .get('/teacher/dashboard/stats')
        .then((res) => setStats(res.data))
        .finally(() => setLoading(false));
    }
  }, [isTeacher]);

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  if (!isTeacher) return null;

  const statItems = [
    {
      title: 'Khóa học',
      value: stats.totalCourses,
      icon: BookOpen,
      color: 'bg-blue-100 text-blue-700',
    },
    {
      title: 'Học viên',
      value: stats.totalStudents,
      icon: Users,
      color: 'bg-green-100 text-green-700',
    },
    {
      title: 'Doanh thu',
      value: `${stats.totalRevenue.toLocaleString()}đ`,
      icon: DollarSign,
      color: 'bg-yellow-100 text-yellow-700',
    },
    {
      title: 'Chứng chỉ',
      value: stats.totalCertificates,
      icon: Award,
      color: 'bg-purple-100 text-purple-700',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bảng điều khiển giảng viên</h1>
        <p className="text-muted-foreground">
          Chào mừng {user?.fullName}, hãy quản lý khóa học của bạn.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statItems.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
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
    </div>
  );
}

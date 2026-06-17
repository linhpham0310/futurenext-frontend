'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, DollarSign, Clock, Activity } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface DashboardStats {
  totalUsers: number;
  totalCourses: number;
  monthlyRevenue: number;
  pendingCourses: number;
  pendingTeacherProfiles: number;
  userGrowthPercent: number;
  revenueGrowthPercent: number;
}
interface RecentActivity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
}

export default function AdminDashboardPage() {
  const { user, isLoading, isAdmin } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAdmin) router.push('/forbidden');
  }, [isAdmin, isLoading, router]);

  const fetchStats = async () => {
    try {
      const response = await apiClient.get('/dashboard/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const response = await apiClient.get('/dashboard/admin/activities/recent', {
        params: { limit: 10 },
      });
      // Đảm bảo response.data là mảng
      setActivities(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setActivities([]);
    } finally {
      setActivitiesLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchStats();
      fetchRecentActivities();
    }
  }, [isAdmin]);

  const formatRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return `${diffDays} ngày trước`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'USER_REGISTER':
        return '👤';
      case 'COURSE_CREATED':
        return '📘';
      case 'PAYMENT_SUCCESS':
        return '💰';
      case 'COURSE_UPDATED':
        return '✏️';
      default:
        return '📌';
    }
  };

  if (isLoading || statsLoading) {
    return (
      <div className="p-8 flex justify-center">
        <Spinner />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bảng điều khiển Admin</h1>
        <p className="text-muted-foreground">Chào {user?.fullName}, đây là tổng quan hệ thống.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tổng người dùng</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers?.toLocaleString() ?? 0}</div>
            <p className="text-xs text-green-600">
              +{stats?.userGrowthPercent ?? 0}% từ tháng trước
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Khóa học</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalCourses ?? 0}</div>
            <p className="text-xs text-muted-foreground">{stats?.pendingCourses ?? 0} chờ duyệt</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Doanh thu tháng</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats?.monthlyRevenue ?? 0).toLocaleString('vi-VN')}đ
            </div>
            <p className="text-xs text-green-600">
              +{stats?.revenueGrowthPercent ?? 0}% so với tháng trước
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Yêu cầu đang chờ</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingTeacherProfiles ?? 0}</div>
            <p className="text-xs text-muted-foreground">hồ sơ giáo viên</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" /> Hoạt động gần đây
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activitiesLoading ? (
            <div className="flex justify-center py-4">
              <Spinner />
            </div>
          ) : activities.length === 0 ? (
            <p className="text-sm text-muted-foreground">Chưa có hoạt động nào.</p>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 border-b pb-3 last:border-0"
                >
                  <div className="text-2xl">{getActivityIcon(activity.type)}</div>
                  <div className="flex-1">
                    <p className="text-sm">{activity.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatRelativeTime(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

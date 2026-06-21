'use client';

import { useEffect, useState } from 'react';
import { studentApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import Link from 'next/link';
import { BookOpen, Clock, Users, Award, BellRing, FileQuestion } from 'lucide-react';

interface DashboardStats {
  totalEnrolledCourses: number;
  completedLessons: number;
  totalLessons: number;
  totalCertificates: number;
  unreadNotifications: number;
  pendingExams: number;
}

interface RecentCourse {
  id: string;
  title: string;
  progress: number;
  lastAccessedAt: string;
}

export default function StudentDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentCourses, setRecentCourses] = useState<RecentCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [statsRes, coursesRes] = await Promise.all([
          studentApi.getStudentStats(),
          studentApi.getStudentRecentCourses({ limit: 3 }),
        ]);
        setStats(statsRes.data);
        setRecentCourses(coursesRes.data);
      } catch (error) {
        console.error('Lỗi tải dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );

  const statItems = [
    {
      title: 'Khóa học đã đăng ký',
      value: stats?.totalEnrolledCourses || 0,
      icon: BookOpen,
      color: 'bg-blue-100 text-blue-700',
      href: '/my-courses',
    },
    {
      title: 'Tiến độ trung bình',
      value: stats ? `${Math.round((stats.completedLessons / stats.totalLessons) * 100)}%` : '0%',
      icon: Clock,
      color: 'bg-green-100 text-green-700',
      href: '/my-courses',
    },
    {
      title: 'Chứng chỉ đã đạt',
      value: stats?.totalCertificates || 0,
      icon: Award,
      color: 'bg-purple-100 text-purple-700',
      href: '/certificates',
    },
    {
      title: 'Thông báo chưa đọc',
      value: stats?.unreadNotifications || 0,
      icon: BellRing,
      color: 'bg-yellow-100 text-yellow-700',
      href: '/notifications',
    },
    {
      title: 'Bài thi chưa làm',
      value: stats?.pendingExams || 0,
      icon: FileQuestion,
      color: 'bg-red-100 text-red-700',
      href: '/exams',
    },
  ];

  const quickActions = [
    {
      label: 'Tiếp tục học',
      href: recentCourses[0]?.id ? `/lx/${recentCourses[0].id}` : '/my-courses',
      icon: BookOpen,
    },
    { label: 'Khám phá khóa học', href: '/courses', icon: Users },
    { label: 'Xem thông báo', href: '/notifications', icon: BellRing },
    { label: 'Làm bài kiểm tra', href: '/exams', icon: FileQuestion },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bảng điều khiển</h1>
        <p className="text-muted-foreground">
          Chào mừng bạn quay trở lại! Hãy tiếp tục hành trình học tập.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statItems.map((stat) => (
          <Link href={stat.href} key={stat.title}>
            <Card className="hover:shadow-md transition cursor-pointer">
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
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hành động nhanh</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {quickActions.map((action) => (
            <Link key={action.label} href={action.href}>
              <Button variant="outline" className="gap-2">
                <action.icon className="h-4 w-4" />
                {action.label}
              </Button>
            </Link>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tiếp tục học</CardTitle>
        </CardHeader>
        <CardContent>
          {recentCourses.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Bạn chưa đăng ký khóa học nào.{' '}
              <Link href="/courses" className="text-blue-600">
                Khám phá ngay
              </Link>
            </p>
          ) : (
            <div className="space-y-4">
              {recentCourses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between border-b pb-3 last:border-0"
                >
                  <div>
                    <h3 className="font-semibold">{course.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{course.progress}%</span>
                    </div>
                  </div>
                  <Link href={`/lx/${course.id}`}>
                    <Button size="sm">Học tiếp</Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

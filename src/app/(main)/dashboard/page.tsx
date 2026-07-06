'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/auth/useAuth';
import { studentApi, teacherProfilesApi, courseApi } from '@/lib/api';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BookOpen, Clock, Award, BellRing, FileQuestion, Star, BookMarked } from 'lucide-react';
import { toast } from 'sonner';

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

interface FeaturedInstructor {
  id: string;
  fullName: string;
  avatarUrl?: string;
  bio?: string;
  rating: number;
  students: number;
}

interface FeaturedCourse {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnailUrl?: string;
  instructor: { fullName: string };
  rating: number;
  reviewsCount: number;
  duration: string;
  lessonsCount: number;
  level: string;
}

export default function StudentDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentCourses, setRecentCourses] = useState<RecentCourse[]>([]);
  const [instructors, setInstructors] = useState<FeaturedInstructor[]>([]);
  const [featuredCourses, setFeaturedCourses] = useState<FeaturedCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [statsRes, coursesRes, teachersRes, featuredRes] = await Promise.all([
          studentApi.getStudentStats(),
          studentApi.getStudentRecentCourses({ limit: 3 }),
          teacherProfilesApi.getFeaturedTeachers(4),
          courseApi.getPublicCourses({ limit: 4, page: 1 }),
        ]);

        setStats(statsRes.data);
        setRecentCourses(coursesRes.data || []);

        // Giảng viên nổi bật
        setInstructors(teachersRes.data?.data || []);

        // Khóa học nổi bật
        const coursesData = featuredRes.data?.data || [];
        setFeaturedCourses(
          coursesData.map((c: any) => ({
            id: c.id,
            title: c.title,
            description: c.description,
            price: c.price,
            thumbnailUrl: c.thumbnailUrl,
            instructor: c.instructor || { fullName: 'Giảng viên' },
            rating: c.rating || 0,
            reviewsCount: c.reviewsCount || 0,
            duration: c.duration || '20 giờ',
            lessonsCount: c.lessonsCount || 0,
            level: c.level || 'Trung cấp',
          }))
        );
      } catch (error) {
        console.error('Lỗi tải dashboard:', error);
        toast.error('Không thể tải dữ liệu dashboard');
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
      value: stats?.totalLessons
        ? `${Math.round((stats.completedLessons / stats.totalLessons) * 100)}%`
        : '0%',
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
  ];

  const quickActions = [
    {
      label: 'Tiếp tục học',
      href: recentCourses[0]?.id ? `/lx/${recentCourses[0].id}` : '/my-courses',
      icon: BookOpen,
    },
    { label: 'Khám phá khóa học', href: '/courses', icon: BookMarked },
    { label: 'Xem thông báo', href: '/notifications', icon: BellRing },
    { label: 'Làm bài kiểm tra', href: '/exams', icon: FileQuestion },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Bảng điều khiển</h1>
        <p className="text-muted-foreground">
          Chào mừng {user?.fullName}! Hãy tiếp tục hành trình học tập của bạn.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* Quick Actions */}
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

      {/* Giảng viên nổi bật */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Giảng viên nổi bật</h2>
          <Link href="/teachers" className="text-sm text-blue-600 hover:underline">
            Xem tất cả
          </Link>
        </div>
        {instructors.length === 0 ? (
          <p className="text-muted-foreground">Chưa có giảng viên nổi bật.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {instructors.map((instructor) => (
              <Card key={instructor.id} className="hover:shadow-lg transition">
                <CardContent className="p-4 text-center">
                  <Avatar className="w-16 h-16 mx-auto mb-2">
                    <AvatarImage src={instructor.avatarUrl || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-lg">
                      {instructor.fullName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-sm">{instructor.fullName}</h3>
                  <p className="text-xs text-muted-foreground">{instructor.bio}</p>
                  <div className="flex items-center justify-center gap-1 mt-1 text-yellow-500 text-sm">
                    <Star className="h-3 w-3 fill-current" />
                    <span>{instructor.rating}</span>
                    <span className="text-xs text-muted-foreground ml-1">
                      ({instructor.students} học viên)
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Khóa học nổi bật */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Khóa học nổi bật</h2>
          <Link href="/courses" className="text-sm text-blue-600 hover:underline">
            Xem tất cả
          </Link>
        </div>
        {featuredCourses.length === 0 ? (
          <p className="text-muted-foreground">Chưa có khóa học nổi bật.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredCourses.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition overflow-hidden">
                <div className="aspect-video bg-muted relative">
                  {course.thumbnailUrl ? (
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <BookOpen className="h-8 w-8" />
                    </div>
                  )}
                </div>
                <CardContent className="p-3 space-y-1">
                  <h3 className="font-semibold text-sm line-clamp-1">{course.title}</h3>
                  <p className="text-xs text-muted-foreground">{course.instructor.fullName}</p>
                  <div className="flex items-center gap-1 text-xs text-yellow-500">
                    <Star className="h-3 w-3 fill-current" />
                    <span>{course.rating.toFixed(1)}</span>
                    <span className="text-muted-foreground">({course.reviewsCount || 0})</span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="font-bold text-sm text-blue-600">
                      {course.price.toLocaleString('vi-VN')}đ
                    </span>
                    <Link href={`/courses/${course.id}`}>
                      <Button size="sm" variant="outline" className="h-7 text-xs">
                        Xem
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Recent Courses */}
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

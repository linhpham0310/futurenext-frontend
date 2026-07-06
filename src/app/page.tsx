'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Bot,
  Sparkles,
  FileCheck,
  GraduationCap,
  Users,
  BookOpen,
  Award,
  Smile,
  Gamepad2,
  Palette,
  Brain,
  Code,
  Clock,
  Star,
} from 'lucide-react';
import { useAuth } from '@/hooks/auth/useAuth';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { courseApi, teacherProfilesApi } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface FeaturedInstructor {
  id: string;
  fullName: string;
  avatarUrl?: string;
  bio?: string;
  expertise?: string[];
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

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const [instructors, setInstructors] = useState<FeaturedInstructor[]>([]);
  const [courses, setCourses] = useState<FeaturedCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Lấy danh sách giảng viên nổi bật từ API
        const [teachersRes, coursesRes] = await Promise.all([
          teacherProfilesApi.getFeaturedTeachers(8),
          courseApi.getPublicCourses({ limit: 6, page: 1 }),
        ]);

        setInstructors(teachersRes.data.data || []);
        // Xử lý khóa học
        const coursesData = coursesRes.data?.data || [];
        const featuredCourses: FeaturedCourse[] = coursesData.map((c: any) => ({
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
        }));
        setCourses(featuredCourses);
      } catch (error) {
        console.error('Error fetching featured data:', error);
        toast.error('Không thể tải dữ liệu trang chủ');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const features = [
    { icon: Bot, title: 'Chatbot AI', desc: 'Trợ lý ảo giải đáp mọi thắc mắc 24/7' },
    { icon: Sparkles, title: 'Cá nhân hóa', desc: 'Lộ trình học tập phù hợp với năng lực' },
    { icon: FileCheck, title: 'Chấm bài AI', desc: 'Nhận phản hồi tức thì và chi tiết' },
    { icon: GraduationCap, title: 'Tạo nội dung', desc: 'AI hỗ trợ giảng viên tạo bài giảng' },
  ];

  const categories = [
    {
      name: 'Game Design',
      icon: Gamepad2,
      slug: 'game-design',
      courses: '80+ khóa học',
      color: 'bg-purple-100 text-purple-600',
    },
    {
      name: 'Thiết kế sáng tạo',
      icon: Palette,
      slug: 'creative-design',
      courses: '95+ khóa học',
      color: 'bg-pink-100 text-pink-600',
    },
    {
      name: 'AI & ML',
      icon: Brain,
      slug: 'ai-ml',
      courses: '65+ khóa học',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      name: 'Lập trình Web',
      icon: Code,
      slug: 'web-development',
      courses: '120+ khóa học',
      color: 'bg-green-100 text-green-600',
    },
  ];

  const stats = [
    { value: '10,000+', label: 'Học viên', icon: Users },
    { value: '5,000+', label: 'Video bài giảng', icon: BookOpen },
    { value: '8,500+', label: 'Chứng chỉ đã cấp', icon: Award },
    { value: '95%', label: 'Tỷ lệ hài lòng', icon: Smile },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-700 bg-clip-text text-transparent leading-tight py-2">
            Nền tảng đào tạo công nghệ hàng đầu
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Học lập trình, thiết kế game, và công nghệ sáng tạo với sự hỗ trợ của AI. Cá nhân hóa lộ
            trình học tập, chatbot thông minh, và chấm bài tự động.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href={isAuthenticated ? '/dashboard' : '/sign-in'}>
              <Button
                size="lg"
                className="h-14 px-8 text-lg font-semibold bg-blue-600 hover:bg-blue-700"
              >
                Bắt đầu học ngay
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">TÍNH NĂNG AI ĐỘC ĐÁO</h2>
            <p className="text-gray-600">Công nghệ trí tuệ nhân tạo hỗ trợ học tập hiệu quả</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <Card key={i} className="border-0 shadow-lg hover:shadow-xl transition">
                <CardHeader className="text-center">
                  <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <f.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle>{f.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-gray-600">{f.desc}</CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Giảng viên nổi bật */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">Những giảng viên nổi tiếng</h2>
            <p className="text-gray-600">Học từ các chuyên gia hàng đầu trong lĩnh vực</p>
          </div>
          {loading ? (
            <p className="text-center text-muted-foreground">Đang tải giảng viên...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {instructors.map((instructor) => (
                <Card key={instructor.id} className="hover:shadow-lg transition">
                  <CardContent className="p-6 text-center">
                    <Avatar className="w-24 h-24 mx-auto mb-4">
                      <AvatarImage src={instructor.avatarUrl || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-2xl">
                        {instructor.fullName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-bold text-lg">{instructor.fullName}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{instructor.bio}</p>
                    <div className="flex items-center justify-center gap-1 text-yellow-500">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="font-semibold">{instructor.rating.toFixed(1)}</span>
                      <span className="text-xs text-muted-foreground ml-1">
                        ({instructor.students} học viên)
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Khóa học nổi bật */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">Các khóa học nổi bật</h2>
            <p className="text-gray-600">Những khóa học được yêu thích nhất hiện nay</p>
          </div>
          {loading ? (
            <p className="text-center text-muted-foreground">Đang tải khóa học...</p>
          ) : courses.length === 0 ? (
            <p className="text-center text-muted-foreground">Chưa có khóa học nổi bật</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <Card key={course.id} className="hover:shadow-xl transition overflow-hidden">
                  <div className="aspect-video bg-muted relative">
                    {course.thumbnailUrl ? (
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <BookOpen className="h-12 w-12" />
                      </div>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg line-clamp-1">{course.title}</CardTitle>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <span>{course.instructor.fullName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="flex items-center text-yellow-500">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="ml-1 font-medium">{course.rating.toFixed(1)}</span>
                      </div>
                      <span className="text-muted-foreground">
                        ({course.reviewsCount || 0} lượt đánh giá)
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {course.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" /> {course.lessonsCount} bài giảng
                      </span>
                      <Badge variant="outline">{course.level}</Badge>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="font-bold text-blue-600">
                        {course.price.toLocaleString('vi-VN')}đ
                      </span>
                      <Link href={`/courses/${course.id}`}>
                        <Button size="sm" variant="outline">
                          Xem chi tiết
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          <div className="text-center mt-8">
            <Link href="/courses">
              <Button variant="outline" size="lg">
                Xem tất cả khóa học
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">Chủ đề khóa học</h2>
            <p className="text-gray-600">Chọn lĩnh vực bạn muốn khám phá</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat, i) => (
              <Link href={`/courses?category=${cat.slug}`} key={i} className="block">
                <Card className="hover:shadow-lg transition cursor-pointer group">
                  <CardContent className="p-6 text-center">
                    <div
                      className={`w-16 h-16 mx-auto rounded-full ${cat.color} flex items-center justify-center mb-3 group-hover:scale-105 transition`}
                    >
                      <cat.icon className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-lg mb-1">{cat.name}</h3>
                    <p className="text-sm text-gray-500">{cat.courses}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((s, i) => (
              <div key={i}>
                <s.icon className="w-8 h-8 mx-auto mb-2 opacity-80" />
                <div className="text-3xl md:text-4xl font-bold mb-1">{s.value}</div>
                <div className="text-sm opacity-90">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-3xl font-bold mb-4">Sẵn sàng bắt đầu hành trình học tập?</h2>
          <p className="text-gray-600 mb-8">
            Tham gia cùng hàng nghìn học viên đang học tập với AI
          </p>
          <Link href="/sign-up">
            <Button
              size="lg"
              className="h-14 px-8 text-lg font-semibold bg-blue-600 hover:bg-blue-700"
            >
              Đăng ký miễn phí ngay
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

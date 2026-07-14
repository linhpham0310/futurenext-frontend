'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Bot,
  Sparkles,
  FileCheck,
  GraduationCap,
  Brain,
  Code,
  Gamepad2,
  Palette,
  Star,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@/hooks/auth/useAuth';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { courseApi, teacherProfilesApi } from '@/lib/api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CourseCard, FeaturedCourse } from '@/components/shared/course-card';

interface FeaturedInstructor {
  id: string;
  fullName: string;
  avatarUrl?: string;
  bio?: string;
  expertise?: string[];
  rating: number;
  students: number;
}

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const [instructors, setInstructors] = useState<FeaturedInstructor[]>([]);
  const [courses, setCourses] = useState<FeaturedCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teachersRes, coursesRes] = await Promise.all([
          teacherProfilesApi.getFeaturedTeachers(4),
          courseApi.getPublicCourses({ limit: 4, page: 1 }),
        ]);

        setInstructors(teachersRes.data.data || []);
        
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
          level: c.level || 'Cơ bản',
        }));
        setCourses(featuredCourses);
      } catch (error) {
        console.error('Error fetching featured data:', error);
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
      name: 'Lập trình Web',
      icon: Code,
      slug: 'web-development',
      courses: '120+ khóa học',
    },
    {
      name: 'Trí tuệ nhân tạo (AI)',
      icon: Brain,
      slug: 'ai-ml',
      courses: '65+ khóa học',
    },
    {
      name: 'Thiết kế & UI/UX',
      icon: Palette,
      slug: 'creative-design',
      courses: '95+ khóa học',
    },
    {
      name: 'Lập trình Game',
      icon: Gamepad2,
      slug: 'game-design',
      courses: '80+ khóa học',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans selection:bg-primary/20">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 md:pt-36 md:pb-40 overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1]">
              Kiến tạo tương lai với <br className="hidden md:inline" />
              <span className="text-muted-foreground">công nghệ hàng đầu</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
              Học tập cùng chuyên gia, thực hành dự án thực tế và nhận phản hồi tức thì từ trí tuệ nhân tạo.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Link href={isAuthenticated ? '/dashboard' : '/sign-up'}>
                <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-base font-semibold rounded-full">
                  Bắt đầu học ngay
                </Button>
              </Link>
              <Link href="/courses">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-base font-semibold rounded-full group">
                  Khám phá khóa học
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Minimal abstract background elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      </section>

      {/* Categories */}
      <section className="py-24 border-t border-border/40">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div className="space-y-2">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Danh mục nổi bật</h2>
              <p className="text-lg text-muted-foreground">Bắt đầu hành trình học tập của bạn theo chuyên ngành</p>
            </div>
            <Link href="/courses" className="text-primary hover:text-primary/80 font-medium flex items-center transition-colors">
              Xem tất cả <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat, i) => (
              <Link href={`/courses?category=${cat.slug}`} key={i} className="group block outline-none">
                <Card className="h-full border-border/50 bg-transparent hover:bg-muted/30 transition-colors shadow-none rounded-xl">
                  <CardContent className="p-8 flex flex-col items-start gap-6">
                    <div className="p-3 bg-foreground text-background rounded-xl">
                      <cat.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-foreground mb-1 group-hover:underline decoration-2 underline-offset-4">{cat.name}</h3>
                      <p className="text-sm text-muted-foreground font-medium">{cat.courses}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-24 border-t border-border/40">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div className="space-y-2">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Khóa học mới nhất</h2>
              <p className="text-lg text-muted-foreground">Được cập nhật với các công nghệ và xu hướng mới nhất</p>
            </div>
            <Link href="/courses" className="text-primary hover:text-primary/80 font-medium flex items-center transition-colors">
              Khám phá thêm <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
               {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="h-[400px] animate-pulse bg-muted rounded-xl"></div>
               ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-border rounded-xl">
              <p className="text-lg text-muted-foreground">Đang cập nhật khóa học</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* AI Features */}
      <section className="py-32 border-t border-border/40 bg-foreground text-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Sức mạnh của AI</h2>
            <p className="text-xl text-muted-foreground/80 font-medium leading-relaxed">
              Trải nghiệm môi trường học tập thông minh, vượt giới hạn của giáo dục truyền thống.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {features.map((f, i) => (
              <div key={i} className="flex flex-col items-center text-center space-y-5">
                <div className="w-16 h-16 rounded-full bg-background/10 flex items-center justify-center">
                  <f.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold tracking-tight">{f.title}</h3>
                <p className="text-muted-foreground/70 leading-relaxed max-w-xs">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Instructors */}
      <section className="py-24 border-t border-border/40">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Giảng viên hàng đầu</h2>
            <p className="text-lg text-muted-foreground font-medium">
              Đồng hành cùng bạn là những chuyên gia công nghệ có chứng chỉ quốc tế.
            </p>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
              {instructors.map((instructor) => (
                <div key={instructor.id} className="flex flex-col items-center text-center group">
                  <Avatar className="w-32 h-32 mb-6 transition-transform duration-300 group-hover:-translate-y-2">
                    <AvatarImage src={instructor.avatarUrl || undefined} className="object-cover" />
                    <AvatarFallback className="bg-muted text-foreground text-3xl font-medium">
                      {instructor.fullName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-xl text-foreground tracking-tight">{instructor.fullName}</h3>
                  <p className="text-sm text-muted-foreground font-medium mt-1 mb-3">{instructor.bio || 'Chuyên gia công nghệ'}</p>
                  
                  <div className="flex items-center gap-1 text-foreground font-semibold">
                    <Star className="h-4 w-4 fill-foreground" />
                    <span>{instructor.rating.toFixed(1)}</span>
                    <span className="text-muted-foreground font-normal text-sm ml-1">
                      ({instructor.students.toLocaleString()} học viên)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-border/40">
        <div className="container mx-auto px-4 md:px-6">
          <div className="bg-muted rounded-xl p-10 md:p-16 text-center max-w-5xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Sẵn sàng để bắt đầu?</h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto font-medium">
              Gia nhập ngay hôm nay để trải nghiệm hệ sinh thái học tập tối ưu nhất.
            </p>
            <Link href="/sign-up">
              <Button size="lg" className="h-14 px-10 text-lg font-semibold rounded-full w-full sm:w-auto">
                Tạo tài khoản miễn phí
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}


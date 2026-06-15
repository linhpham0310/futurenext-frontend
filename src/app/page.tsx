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
} from 'lucide-react';
import { useAuth } from '@/hooks/auth/useAuth';

export default function HomePage() {
  const { isAuthenticated } = useAuth();

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

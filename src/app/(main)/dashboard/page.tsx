// src/app/(main)/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { usersApi, courseApi, lxApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  BookOpen,
  Flame,
  Sparkles,
  MessageSquare,
  Send,
  Brain,
  Award,
  TrendingUp,
  Bell,
  Lightbulb,
} from 'lucide-react';
import { useAuth } from '@/hooks/auth/useAuth';

interface Course {
  id: string;
  title: string;
  instructor?: { fullName: string };
  progress?: number;
}

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const coursesResponse = await courseApi.getMyCourses();
        const coursesData = Array.isArray(coursesResponse.data) ? coursesResponse.data : [];
        setEnrolledCourses(coursesData);
      } catch (error) {
        console.error('Failed to load dashboard', error);
        toast.error('Không thể tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const handleAskAI = async () => {
    if (!aiQuestion.trim()) return;
    setAiLoading(true);
    try {
      await lxApi.testAiLog({
        lessonId: 'dashboard-demo',
        interactionType: 'CHAT',
        prompt: aiQuestion,
        response: 'Đang xử lý...',
      });
      setAiAnswer(
        'Cảm ơn bạn! Hiện tại tôi đang học hỏi thêm. Bạn có thể tham khảo các khóa học gợi ý bên dưới, hoặc đặt câu hỏi cụ thể hơn về lập trình nhé!'
      );
      toast.success('AI đã nhận câu hỏi');
    } catch (error) {
      toast.error('Lỗi khi gửi câu hỏi');
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const hasCourses = enrolledCourses.length > 0;
  const stats = [
    { label: 'Khóa học', value: enrolledCourses.length, icon: BookOpen, color: 'text-blue-500' },
    { label: 'Đã hoàn thành', value: 0, icon: Award, color: 'text-green-500' },
    { label: 'Huy hiệu', value: 0, icon: Sparkles, color: 'text-amber-500' },
    { label: 'Ngày học liên tiếp', value: 0, icon: Flame, color: 'text-orange-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Chào, {user?.fullName?.split(' ')[0] || 'Học viên'}!
        </h1>
        <p className="text-muted-foreground text-sm">Tiếp tục hành trình học tập của bạn.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color} opacity-80`} />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Khóa học của bạn
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!hasCourses ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">Bạn chưa đăng ký khóa học nào.</p>
                  <Link href="/courses">
                    <Button className="bg-primary text-primary-foreground">
                      Khám phá khóa học
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {enrolledCourses.slice(0, 3).map((course) => (
                    <div key={course.id} className="p-4 bg-muted rounded-xl">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold">{course.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {course.instructor?.fullName || 'Giảng viên'}
                          </p>
                        </div>
                        <Link href={`/lx/${course.id}`}>
                          <Button size="sm" className="bg-primary text-primary-foreground">
                            Học tiếp
                          </Button>
                        </Link>
                      </div>
                      <Progress value={course.progress || 0} className="h-2" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Hoạt động gần đây
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Chưa có hoạt động nào trong 7 ngày qua.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-primary/5 to-cyan-500/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Trợ lý AI
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Hỏi tôi bất kỳ điều gì về khóa học, lộ trình học tập, hoặc kiến thức lập trình.
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="VD: Làm thế nào để học React hiệu quả?"
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
                  disabled={aiLoading}
                  className="flex-1"
                />
                <Button
                  onClick={handleAskAI}
                  disabled={aiLoading}
                  className="bg-primary text-primary-foreground"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              {aiAnswer && (
                <div className="mt-3 p-3 bg-background rounded-lg border border-primary/20">
                  <div className="flex gap-2">
                    <Sparkles className="h-4 w-4 text-primary mt-0.5" />
                    <p className="text-sm text-foreground">{aiAnswer}</p>
                  </div>
                </div>
              )}
              {aiLoading && (
                <div className="flex justify-center py-2">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              <Button
                variant="outline"
                className="w-full justify-center gap-2 text-primary border-primary/30"
              >
                <MessageSquare className="h-4 w-4" />
                Trò chuyện với AI (Demo)
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Thông báo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">Chào mừng bạn đến với FutureNext.ai!</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Hãy khám phá các khóa học miễn phí.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                Mẹo học tập
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Học mỗi ngày 15 phút để duy trì streak và cải thiện kỹ năng nhanh nhất.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

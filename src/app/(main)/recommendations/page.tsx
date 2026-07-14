'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import { studentApi } from '@/lib/api';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BackButton } from '@/components/ui/back-button';
import { Sparkles, Brain, Zap, TrendingUp, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnail?: string;
  reason: string;
  matchScore: number;
  category: string;
}

export default function RecommendationsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchRecommendations = async (forceRefresh = false) => {
    setLoading(true);
    try {
      const res = await studentApi.getRecommendations({ refresh: forceRefresh });
      setRecommendations(res.data);
    } catch {
      toast.error('Không thể tải gợi ý');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchRecommendations(false);
    }
  }, [user]);

  const handleRefresh = async () => {
    setIsGenerating(true);
    try {
      await studentApi.refreshRecommendations();
      toast.success('AI đang phân tích lại sở thích của bạn...');
      await fetchRecommendations(true);
    } catch {
      toast.error('Không thể làm mới gợi ý');
    } finally {
      setIsGenerating(false);
    }
  };

  if (authLoading || loading)
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-yellow-500" />
            Gợi ý khóa học
          </h1>
          <p className="text-muted-foreground">
            AI phân tích sở thích và gợi ý khóa học phù hợp với bạn
          </p>
        </div>
        <div className="flex gap-2">
          <BackButton />
          <Button variant="outline" onClick={handleRefresh} disabled={isGenerating}>
            {isGenerating ? (
              <Spinner className="h-4 w-4 mr-2" />
            ) : (
              <TrendingUp className="h-4 w-4 mr-2" />
            )}
            {isGenerating ? 'Đang phân tích...' : 'Làm mới gợi ý'}
          </Button>
        </div>
      </div>

      {recommendations.length === 0 ? (
        <div className="text-center py-12">
          <Brain className="h-12 w-12 mx-auto text-muted-foreground/60 mb-3" />
          <h2 className="text-xl font-semibold">Chưa có gợi ý</h2>
          <p className="text-muted-foreground">
            Hãy đăng ký một số khóa học để AI có thể phân tích và gợi ý cho bạn.
          </p>
          <Link href="/courses" className="mt-4 inline-block">
            <Button className="bg-primary">Khám phá khóa học</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow relative">
              <div className="absolute top-3 right-3 bg-primary text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> {course.matchScore}%
              </div>
              <CardHeader>
                <CardTitle className="text-lg line-clamp-1">{course.title}</CardTitle>
                <p className="text-xs text-muted-foreground">{course.category}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                <p className="text-sm bg-muted/50 text-amber-600 p-2 rounded-lg border border-border flex items-start gap-2">
                  <Zap className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{course.reason}</span>
                </p>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-foreground">
                    {course.price.toLocaleString('vi-VN')}đ
                  </span>
                  <Link href={`/courses/${course.id}`}>
                    <Button size="sm">Xem chi tiết</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

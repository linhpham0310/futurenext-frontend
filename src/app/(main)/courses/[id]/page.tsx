'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Clock, Users, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { courseApi } from '@/lib/api';
import { toast } from 'sonner';

interface CourseDetail {
  id: string;
  title: string;
  description: string;
  duration: string;
  students: number;
  rating: number;
  price: number;
  outcomes: string[];
  isEnrolled?: boolean;
}

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await courseApi.getPublicCourseDetail(id);
        setCourse(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await courseApi.enrollCourse(id);
      toast.success('Đăng ký thành công!');
      router.push(`/learning/${id}`);
    } catch (error) {
      toast.error('Đăng ký thất bại, vui lòng thử lại');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center p-8">
        <Spinner />
      </div>
    );
  if (!course) return <div className="p-8">Khóa học không tồn tại.</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          <h1 className="text-3xl font-bold">{course.title}</h1>
          <p className="text-muted-foreground">{course.description}</p>
          <div className="flex gap-4 flex-wrap">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" /> {course.duration}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" /> {course.students} học viên
            </span>
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500" /> {course.rating}
            </span>
          </div>
        </div>
        <Card className="h-fit">
          <CardContent className="p-6 space-y-4">
            <div className="text-3xl font-bold">{course.price.toLocaleString('vi-VN')}đ</div>
            <Button
              className="w-full"
              size="lg"
              onClick={handleEnroll}
              disabled={enrolling || course.isEnrolled}
            >
              {course.isEnrolled ? 'Đã đăng ký' : enrolling ? 'Đang xử lý...' : 'Đăng ký ngay'}
            </Button>
            <p className="text-xs text-muted-foreground text-center">30 ngày hoàn tiền</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Bạn sẽ học được</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {course.outcomes.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <Badge variant="secondary">✓</Badge> {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

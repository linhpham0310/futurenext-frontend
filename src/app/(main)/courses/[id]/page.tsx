// src/app/(main)/courses/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Clock, Users, Star, Badge } from 'lucide-react';

const mockDetail = {
  id: '1',
  title: 'React & TypeScript Masterclass',
  description: 'Học cách xây dựng ứng dụng web hiện đại với React và TypeScript.',
  instructor: { name: 'Nguyễn Văn A', avatar: '' },
  duration: '24 giờ',
  students: 1250,
  rating: 4.7,
  price: 699000,
  outcomes: ['Hiểu sâu về React Hooks', 'Thành thạo TypeScript', 'Xây dựng dự án thực tế'],
};

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<typeof mockDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setCourse(mockDetail);
      setLoading(false);
    }, 500);
  }, [id]);

  if (loading)
    return (
      <div className="flex justify-center p-8">
        <Spinner />
      </div>
    );
  if (!course) return <div className="p-8">Khóa học không tồn tại.</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Nhóm Banner */}
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
            <Button className="w-full" size="lg">
              Đăng ký ngay
            </Button>
            <p className="text-xs text-muted-foreground text-center">30 ngày hoàn tiền</p>
          </CardContent>
        </Card>
      </div>

      {/* Nhóm Kết quả đạt được */}
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

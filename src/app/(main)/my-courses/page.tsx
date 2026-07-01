'use client';

import { useEffect, useState } from 'react';
import { studentApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { BackButton } from '@/components/ui/back-button';

interface MyCourse {
  id: string;
  title: string;
  description: string;
  progress: number;
}

export default function MyCoursesPage() {
  const [courses, setCourses] = useState<MyCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        const res = await studentApi.getMyCourses();
        setCourses(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyCourses();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );

  if (courses.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-12 w-12 mx-auto text-slate-300 mb-3" />
        <h2 className="text-xl font-semibold">Bạn chưa đăng ký khóa học nào</h2>
        <Link href="/courses" className="mt-4 inline-block">
          <Button className="bg-blue-600">Khám phá khóa học</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Khóa học của tôi</h1>
        <BackButton />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card key={course.id}>
            <CardHeader>
              <CardTitle>{course.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm line-clamp-2">{course.description}</p>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-sm">Tiến độ: {course.progress}%</span>
                <Link href={`/lx/${course.id}`}>
                  <Button size="sm">Học tiếp</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

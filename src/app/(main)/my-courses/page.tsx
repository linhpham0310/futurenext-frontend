// src/app/(main)/my-courses/page.tsx
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const mockEnrolled = [
  { id: '1', title: 'React Masterclass', progress: 45, instructor: 'Nguyễn Văn A' },
  { id: '2', title: 'Node.js Advanced', progress: 80, instructor: 'Trần Thị B' },
];

export default function MyCoursesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Khóa học của tôi</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockEnrolled.map((course) => (
          <Card key={course.id}>
            <CardHeader>
              <CardTitle className="text-lg">{course.title}</CardTitle>
              <CardDescription>{course.instructor}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${course.progress}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground">{course.progress}% hoàn thành</p>
              <Link href={`/lx/${course.id}`}>
                <Button size="sm" className="w-full">
                  Tiếp tục học
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

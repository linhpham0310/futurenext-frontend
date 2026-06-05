// src/app/(main)/courses/page.tsx
'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { SelectFilter } from '@/components/ui/select-filter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Search } from 'lucide-react';

const mockCourses = Array.from({ length: 12 }, (_, i) => ({
  id: `${i + 1}`,
  title: `Khóa học ${i + 1}`,
  description: 'Mô tả ngắn gọn về khóa học.',
  price: i % 3 === 0 ? 0 : 500000,
  thumbnail: 'https://placehold.co/300x180',
  level: ['Cơ bản', 'Trung bình', 'Nâng cao'][i % 3],
}));

export default function CourseCatalogPage() {
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('');

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Nhóm tiêu đề */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Khám phá khóa học</h1>
        <p className="text-muted-foreground">
          Nâng cao kỹ năng của bạn với các khóa học chất lượng.
        </p>
      </div>

      {/* Nhóm bộ lọc */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm khóa học..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <SelectFilter
          options={[
            { label: 'Tất cả cấp độ', value: '' },
            { label: 'Cơ bản', value: 'basic' },
            { label: 'Trung bình', value: 'intermediate' },
            { label: 'Nâng cao', value: 'advanced' },
          ]}
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="w-full sm:w-40"
        />
      </div>

      {/* Nhóm danh sách khóa học */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockCourses.map((course) => (
          <Link key={course.id} href={`/courses/${course.id}`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-40 object-cover rounded-t-xl"
              />
              <CardHeader>
                <CardTitle className="text-lg">{course.title}</CardTitle>
                <CardDescription>{course.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className="text-sm px-2 py-1 bg-blue-100 text-blue-700 rounded">
                    {course.level}
                  </span>
                  <span className="font-bold">
                    {course.price === 0 ? 'Miễn phí' : course.price.toLocaleString('vi-VN') + 'đ'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

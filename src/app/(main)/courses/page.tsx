'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { SelectFilter } from '@/components/ui/select-filter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { courseApi } from '@/lib/api';
import Image from 'next/image';

// Định nghĩa interface cho khóa học
interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnail?: string;
  level: string;
}

export default function CourseCatalogPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const res = await courseApi.getPublicCourses({ page, limit: 12 });
        const items = res.data?.items || res.data || [];
        const total = res.data?.meta?.totalPages || res.data?.totalPages || 1;
        setCourses(items);
        setTotalPages(total);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
        setCourses([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [page, search, level]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Khám phá khóa học</h1>
        <p className="text-muted-foreground">
          Nâng cao kỹ năng của bạn với các khóa học chất lượng.
        </p>
      </div>

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

      {courses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Không tìm thấy khóa học nào.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Link key={course.id} href={`/courses/${course.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full border-border">
                  <Image
                    src={course.thumbnail || '/placeholder-course.jpg'}
                    alt={course.title}
                    width={300}
                    height={180}
                    className="w-full h-40 object-cover rounded-t-xl"
                  />
                  <CardHeader>
                    <CardTitle className="text-lg text-foreground">{course.title}</CardTitle>
                    <CardDescription>{course.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <span className="text-sm px-2 py-1 bg-primary/10 text-primary rounded">
                        {course.level || 'Cơ bản'}
                      </span>
                      <span className="font-bold text-foreground">
                        {course.price === 0
                          ? 'Miễn phí'
                          : course.price.toLocaleString('vi-VN') + 'đ'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Trước
              </Button>
              <span className="py-1 px-3 text-sm text-muted-foreground">
                Trang {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Sau
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

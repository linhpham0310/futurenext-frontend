'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/hooks/auth/useAuth';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface FavoriteCourse {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnail?: string;
}

export default function FavoritesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      apiClient
        .get('/student/favorites')
        .then((res) => setFavorites(res.data))
        .catch(() => toast.error('Không thể tải danh sách yêu thích'))
        .finally(() => setLoading(false));
    }
  }, [user]);

  const removeFavorite = async (courseId: string) => {
    try {
      await apiClient.delete(`/student/favorites/${courseId}`);
      setFavorites((prev) => prev.filter((c) => c.id !== courseId));
      toast.success('Đã xóa khỏi danh sách yêu thích');
    } catch {
      toast.error('Xóa thất bại');
    }
  };

  if (authLoading || loading)
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );

  if (favorites.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="h-12 w-12 mx-auto text-slate-300 mb-3" />
        <h2 className="text-xl font-semibold">Chưa có khóa học yêu thích</h2>
        <Link href="/courses" className="mt-4 inline-block">
          <Button className="bg-blue-600">Khám phá khóa học</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Khóa học yêu thích</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favorites.map((course) => (
          <Card key={course.id}>
            <CardHeader>
              <CardTitle>{course.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm line-clamp-2">{course.description}</p>
              <div className="flex justify-between items-center mt-4">
                <span className="font-bold text-blue-600">
                  {course.price.toLocaleString('vi-VN')}đ
                </span>
                <div className="flex gap-2">
                  <Link href={`/courses/${course.id}`}>
                    <Button variant="outline" size="sm">
                      Xem chi tiết
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={() => removeFavorite(course.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

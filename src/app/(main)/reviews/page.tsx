'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/hooks/auth/useAuth';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Link from 'next/link';

interface Review {
  id: string;
  courseId: string;
  courseTitle: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function MyReviewsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      apiClient
        .get('/student/reviews')
        .then((res) => setReviews(res.data))
        .catch(() => toast.error('Không thể tải đánh giá'))
        .finally(() => setLoading(false));
    }
  }, [user]);

  const deleteReview = async (reviewId: string) => {
    if (!confirm('Bạn có chắc muốn xóa đánh giá này?')) return;
    try {
      await apiClient.delete(`/student/reviews/${reviewId}`);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      toast.success('Xóa đánh giá thành công');
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

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <Star className="h-12 w-12 mx-auto text-slate-300 mb-3" />
        <h2 className="text-xl font-semibold">Bạn chưa có đánh giá nào</h2>
        <Link href="/courses" className="mt-4 inline-block">
          <Button className="bg-blue-600">Đánh giá khóa học ngay</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Đánh giá của tôi</h1>
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <Link
                    href={`/courses/${review.courseId}`}
                    className="font-semibold hover:text-blue-600"
                  >
                    {review.courseTitle}
                  </Link>
                  <div className="flex items-center gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <p className="mt-2 text-sm text-gray-700">{review.comment}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/courses/${review.courseId}/review/edit`}>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={() => deleteReview(review.id)}>
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

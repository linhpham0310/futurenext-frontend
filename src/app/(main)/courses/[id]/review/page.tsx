'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth';
import { studentApi } from '@/lib/api';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import { BackButton } from '@/components/ui/back-button';

export default function CreateReviewPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để đánh giá');
      return;
    }
    if (rating === 0) {
      toast.error('Vui lòng chọn số sao');
      return;
    }

    setSubmitting(true);
    try {
      await studentApi.createReview(id as string, {
        rating,
        comment: comment.trim() || undefined, // comment là tùy chọn
      });
      toast.success('Cảm ơn bạn đã đánh giá!');
      router.push(`/courses/${id}`);
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || 'Đánh giá thất bại';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Đánh giá khóa học</h1>
        <BackButton />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Đánh giá của bạn</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="focus:outline-none"
              >
                <Star
                  className={`h-8 w-8 ${
                    star <= (hoverRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-muted-foreground/60'
                  }`}
                />
              </button>
            ))}
            <span className="ml-2 text-sm font-medium">
              {rating > 0 ? `${rating} sao` : 'Chọn số sao'}
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Nhận xét <span className="text-muted-foreground">(không bắt buộc)</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="Chia sẻ trải nghiệm của bạn về khóa học..."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <Button onClick={handleSubmit} disabled={submitting} className="w-full">
            {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Clock, BookOpen } from 'lucide-react';

export interface FeaturedCourse {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnailUrl?: string;
  instructor: { fullName: string };
  rating: number;
  reviewsCount: number;
  duration: string;
  lessonsCount: number;
  level: string;
}

interface CourseCardProps {
  course: FeaturedCourse;
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden hover:shadow-lg transition-all duration-300 border border-border group bg-card">
      <Link href={`/courses/${course.id}`} className="block relative aspect-video bg-muted overflow-hidden">
        {course.thumbnailUrl ? (
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-slate-100 dark:bg-slate-800">
            <BookOpen className="h-10 w-10 opacity-50" />
          </div>
        )}
      </Link>
      <div className="flex flex-col flex-grow p-4">
        <Link href={`/courses/${course.id}`}>
          <h3 className="font-semibold text-base leading-tight line-clamp-2 hover:text-primary transition-colors mb-1 text-foreground">
            {course.title}
          </h3>
        </Link>
        <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
          {course.instructor.fullName}
        </p>
        <div className="flex items-center gap-1.5 mb-2">
          <span className="font-bold text-sm text-amber-600 dark:text-amber-500">
            {course.rating.toFixed(1)}
          </span>
          <div className="flex items-center text-amber-500">
            <Star className="h-3.5 w-3.5 fill-current" />
          </div>
          <span className="text-xs text-muted-foreground">
            ({course.reviewsCount.toLocaleString()})
          </span>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> {course.duration}
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" /> {course.lessonsCount} bài giảng
          </span>
        </div>
        <div className="mt-auto pt-3 flex items-center justify-between border-t border-border">
          <span className="font-bold text-lg text-foreground">
            {course.price > 0 ? `${course.price.toLocaleString('vi-VN')}đ` : 'Miễn phí'}
          </span>
        </div>
      </div>
    </Card>
  );
}

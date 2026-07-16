'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { teacherProfilesApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Star, Users } from 'lucide-react';
import { BackButton } from '@/components/ui/back-button';

interface Teacher {
  id: string;
  fullName: string;
  avatarUrl?: string;
  bio?: string;
  rating: number;
  students: number;
  expertise?: string[];
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await teacherProfilesApi.getFeaturedTeachers(20);
        setTeachers(res.data?.data || []);
      } catch (error) {
        console.error('Lỗi tải danh sách giảng viên:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tất cả giảng viên</h1>
        <BackButton />
      </div>
      {teachers.length === 0 ? (
        <p className="text-muted-foreground">Chưa có giảng viên nào.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {teachers.map((teacher) => (
            <Card key={teacher.id} className="hover:shadow-lg transition">
              <CardContent className="p-6 text-center">
                <Avatar className="w-20 h-20 mx-auto mb-3">
                  <AvatarImage src={teacher.avatarUrl || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-xl">
                    {teacher.fullName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-semibold">{teacher.fullName}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{teacher.bio}</p>
                <div className="flex items-center justify-center gap-4 mt-2 text-sm">
                  <span className="flex items-center gap-1 text-yellow-500">
                    <Star className="h-4 w-4 fill-current" />
                    {teacher.rating}
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    {teacher.students}
                  </span>
                </div>
                {teacher.expertise && teacher.expertise.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-1 mt-2">
                    {teacher.expertise.slice(0, 3).map((exp) => (
                      <span key={exp} className="bg-slate-100 text-xs px-2 py-1 rounded-full">
                        {exp}
                      </span>
                    ))}
                  </div>
                )}
                <Link href={`/teachers/${teacher.id}`} className="mt-4 inline-block">
                  <Button variant="outline" size="sm">
                    Xem hồ sơ
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

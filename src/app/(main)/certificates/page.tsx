'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import { studentApi } from '@/lib/api';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Award } from 'lucide-react';
import Link from 'next/link';
import { BackButton } from '@/components/ui/back-button';

interface Certificate {
  id: string;
  courseTitle: string;
  issuedAt: string;
  certificateUrl: string;
}

export default function StudentCertificatesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      studentApi
        .getCertificates()
        .then((res) => setCertificates(res.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (authLoading || loading)
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Chứng chỉ của tôi</h1>
      </div>
      {certificates.length === 0 ? (
        <div className="text-center py-12">
          <Award className="h-12 w-12 mx-auto text-slate-300 mb-3" />
          <h2 className="text-xl font-semibold">Chưa có chứng chỉ nào</h2>
          <p className="text-muted-foreground">Hoàn thành khóa học để nhận chứng chỉ.</p>
          <Link href="/courses" className="mt-4 inline-block">
            <Button className="bg-blue-600">Khám phá khóa học</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certificates.map((cert) => (
            <Card key={cert.id}>
              <CardHeader>
                <CardTitle className="text-lg">{cert.courseTitle}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Cấp ngày: {new Date(cert.issuedAt).toLocaleDateString('vi-VN')}
                </p>
                <a href={cert.certificateUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="w-full">
                    <Download className="h-4 w-4 mr-2" /> Tải chứng chỉ
                  </Button>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

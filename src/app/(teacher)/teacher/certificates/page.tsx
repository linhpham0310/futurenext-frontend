'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import { apiClient, teacherApi } from '@/lib/api';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Download } from 'lucide-react';

interface Certificate {
  id: string;
  studentName: string;
  courseTitle: string;
  issuedAt: string;
  certificateUrl: string;
}

export default function TeacherCertificatesPage() {
  const { isTeacher, isLoading: authLoading } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isTeacher) {
      teacherApi
        .getCertificates()
        .then((res) => setCertificates(res.data))
        .catch(() => toast.error('Không thể tải danh sách chứng chỉ'))
        .finally(() => setLoading(false));
    }
  }, [isTeacher]);

  if (authLoading || loading)
    return (
      <div className="p-8 flex justify-center">
        <Spinner />
      </div>
    );
  if (!isTeacher) return null;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Chứng chỉ đã cấp</h1>
      <Card>
        <CardHeader>
          <CardTitle>Danh sách chứng chỉ</CardTitle>
        </CardHeader>
        <CardContent>
          {certificates.length === 0 ? (
            <p className="text-muted-foreground">Chưa có chứng chỉ nào được cấp.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Học viên</TableCell>
                  <TableCell>Khóa học</TableCell>
                  <TableCell>Ngày cấp</TableCell>
                  <TableCell>Chứng chỉ</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {certificates.map((cert) => (
                  <TableRow key={cert.id}>
                    <TableCell>{cert.studentName}</TableCell>
                    <TableCell>{cert.courseTitle}</TableCell>
                    <TableCell>{new Date(cert.issuedAt).toLocaleDateString('vi-VN')}</TableCell>
                    <TableCell>
                      <a href={cert.certificateUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4 mr-1" /> Tải
                        </Button>
                      </a>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

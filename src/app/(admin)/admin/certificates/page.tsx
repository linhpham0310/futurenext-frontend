'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { adminApi } from '@/lib/api';
import { useAuth } from '@/hooks/auth/useAuth';
import { Download, Trash2, CheckCircle, XCircle } from 'lucide-react';

interface Certificate {
  id: string;
  studentName: string;
  studentEmail: string;
  courseTitle: string;
  issuedAt: string;
  certificateUrl: string;
  isValid: boolean;
}

export default function AdminCertificatesPage() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAdmin) router.push('/forbidden');
  }, [isAdmin, authLoading, router]);

  const fetchCertificates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getCertificates();
      setCertificates(res.data);
    } catch {
      toast.error('Không thể tải danh sách chứng chỉ');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) fetchCertificates();
  }, [isAdmin, fetchCertificates]);

  const handleRevoke = async (id: string, studentName: string) => {
    if (!confirm(`Thu hồi chứng chỉ của "${studentName}"?`)) return;
    try {
      await adminApi.revokeCertificate(id);
      setCertificates(certificates.map((c) => (c.id === id ? { ...c, isValid: false } : c)));
      toast.success('Thu hồi thành công');
    } catch {
      toast.error('Thu hồi thất bại');
    }
  };

  if (authLoading)
    return (
      <div className="p-8 flex justify-center">
        <Spinner />
      </div>
    );
  if (!isAdmin) return null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quản lý chứng chỉ</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Danh sách chứng chỉ ({certificates.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : certificates.length === 0 ? (
            <p className="text-center text-muted-foreground">Chưa có chứng chỉ nào.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Học viên</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Khóa học</TableCell>
                  <TableCell>Ngày cấp</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell className="text-right">Thao tác</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {certificates.map((cert) => (
                  <TableRow key={cert.id}>
                    <TableCell className="font-medium">{cert.studentName}</TableCell>
                    <TableCell>{cert.studentEmail}</TableCell>
                    <TableCell>{cert.courseTitle}</TableCell>
                    <TableCell>{new Date(cert.issuedAt).toLocaleDateString('vi-VN')}</TableCell>
                    <TableCell>
                      {cert.isValid ? (
                        <span className="text-green-600 flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" /> Hợp lệ
                        </span>
                      ) : (
                        <span className="text-red-600 flex items-center gap-1">
                          <XCircle className="h-4 w-4" /> Đã thu hồi
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <a href={cert.certificateUrl} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </a>
                        {cert.isValid && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRevoke(cert.id, cert.studentName)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
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

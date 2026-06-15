'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import { apiClient } from '@/lib/api';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { FileSpreadsheet, FileText } from 'lucide-react';

export default function TeacherReportsPage() {
  const { isTeacher, isLoading: authLoading } = useAuth();
  const [exporting, setExporting] = useState(false);

  const exportReport = async (type: 'revenue' | 'students') => {
    setExporting(true);
    try {
      const response = await apiClient.get(`/teacher/reports/${type}/export`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_report.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Xuất báo cáo thành công');
    } catch {
      toast.error('Xuất thất bại');
    } finally {
      setExporting(false);
    }
  };

  if (authLoading)
    return (
      <div className="p-8 flex justify-center">
        <Spinner />
      </div>
    );
  if (!isTeacher) return null;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Báo cáo</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Doanh thu</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => exportReport('revenue')} disabled={exporting} className="w-full">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              {exporting ? 'Đang xuất...' : 'Xuất báo cáo doanh thu (Excel)'}
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Học viên</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => exportReport('students')}
              disabled={exporting}
              className="w-full"
            >
              <FileText className="h-4 w-4 mr-2" />
              {exporting ? 'Đang xuất...' : 'Xuất danh sách học viên (Excel)'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

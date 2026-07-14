'use client';

import { useState } from 'react';
import { studentApi } from '@/lib/api';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Award, CheckCircle, XCircle, Shield } from 'lucide-react';

interface VerifiedCertificate {
  id: string;
  studentName: string;
  courseTitle: string;
  issuedAt: string;
  isValid: boolean;
}

export default function VerifyCertificatePage() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifiedCertificate | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    if (!code.trim()) {
      toast.error('Vui lòng nhập mã chứng chỉ');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await studentApi.verifyCertificate(code.trim());
      setResult(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Mã chứng chỉ không hợp lệ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <Award className="h-16 w-16 mx-auto text-foreground mb-4" />
        <h1 className="text-3xl font-bold">Xác thực chứng chỉ</h1>
        <p className="text-muted-foreground mt-2">Nhập mã chứng chỉ để kiểm tra tính hợp lệ</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-foreground" />
            Nhập mã chứng chỉ
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="VD: CERT-ABC123XYZ"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
              className="flex-1 font-mono"
            />
            <Button onClick={handleVerify} disabled={loading}>
              {loading ? <Spinner className="h-4 w-4" /> : 'Xác thực'}
            </Button>
          </div>

          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-destructive">Không hợp lệ</p>
                <p className="text-sm text-destructive">{error}</p>
              </div>
            </div>
          )}

          {result && result.isValid && (
            <div className="p-4 bg-muted/50 border border-border rounded-lg flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-emerald-600">Chứng chỉ hợp lệ</p>
                <p className="text-sm text-emerald-600">
                  <strong>{result.studentName}</strong> đã hoàn thành khóa học{' '}
                  <strong>"{result.courseTitle}"</strong>
                </p>
                <p className="text-xs text-green-500 mt-1">
                  Cấp ngày: {new Date(result.issuedAt).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

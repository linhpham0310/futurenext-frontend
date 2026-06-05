// src/app/(teacher)/teacher/settings/page.tsx
'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TeacherSettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Cài đặt giảng viên</h1>
      <Card>
        <CardHeader>
          <CardTitle>Thông tin cá nhân</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Tính năng đang phát triển.</p>
        </CardContent>
      </Card>
    </div>
  );
}

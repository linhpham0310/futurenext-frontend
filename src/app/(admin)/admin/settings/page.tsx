// src/app/(admin)/admin/settings/page.tsx
'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminSettingsPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Thiết lập hệ thống</h1>
      <Card>
        <CardHeader>
          <CardTitle>Cấu hình chung</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Tính năng đang phát triển.</p>
        </CardContent>
      </Card>
    </div>
  );
}

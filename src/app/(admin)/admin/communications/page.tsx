// src/app/(admin)/admin/communications/page.tsx
'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminCommunicationsPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Truyền thông</h1>
      <Card>
        <CardHeader>
          <CardTitle>Quản lý thông báo</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Tính năng đang phát triển.</p>
        </CardContent>
      </Card>
    </div>
  );
}

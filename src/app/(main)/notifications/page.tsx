'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import { commonApi } from '@/lib/api';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, CheckCircle, Circle } from 'lucide-react';
import { toast } from 'sonner';
import { BackButton } from '@/components/ui/back-button';

interface Notification {
  id: string;
  title: string;
  description: string;
  link: string;
  isRead: boolean;
  createdAt: string;
}

export default function StudentNotificationsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      commonApi
        .getNotifications({ limit: 50 })
        .then((res) => setNotifications(res.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [user]);

  const markAsRead = async (id: string) => {
    try {
      await commonApi.markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch {
      toast.error('Không thể đánh dấu đã đọc');
    }
  };

  const markAllAsRead = async () => {
    try {
      await commonApi.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success('Đã đánh dấu tất cả là đã đọc');
    } catch {
      toast.error('Không thể thực hiện');
    }
  };

  if (authLoading || loading)
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Thông báo</h1>
        <div className="flex gap-2">
          {notifications.some((n) => !n.isRead) && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              Đánh dấu tất cả đã đọc
            </Button>
          )}
        </div>
      </div>
      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="h-12 w-12 mx-auto text-slate-300 mb-3" />
          <h2 className="text-xl font-semibold">Chưa có thông báo</h2>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <Card
              key={notif.id}
              className={`cursor-pointer hover:shadow-md transition ${!notif.isRead ? 'border-blue-200 bg-blue-50/50' : ''}`}
              onClick={() => markAsRead(notif.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {notif.isRead ? (
                    <Circle className="h-4 w-4 text-gray-300 mt-1 shrink-0" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-blue-500 mt-1 shrink-0" />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold">{notif.title}</h3>
                    <p className="text-sm text-muted-foreground">{notif.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(notif.createdAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

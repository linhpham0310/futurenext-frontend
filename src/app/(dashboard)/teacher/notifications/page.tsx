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
  link?: string;
  isRead: boolean;
  createdAt: string;
}

// Dữ liệu mẫu khi không có API
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: '🎉 Chào mừng bạn đến với FutureNext.ai',
    description: 'Hãy bắt đầu hành trình giảng dạy của bạn.',
    link: '/teacher/courses',
    isRead: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: '📚 Học viên mới đăng ký khóa học của bạn',
    description: 'Nguyễn Văn A vừa đăng ký khóa học "UI/UX Design Fundamentals".',
    link: '/teacher/courses',
    isRead: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '3',
    title: '💰 Doanh thu tháng này đã đạt 10 triệu',
    description: 'Chúc mừng bạn đã đạt mốc doanh thu 10 triệu trong tháng này!',
    link: '/teacher/revenue',
    isRead: false,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

export default function TeacherNotificationsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [useMock, setUseMock] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchNotifications = async () => {
      setLoading(true);
      try {
        if (typeof commonApi.getNotifications !== 'function') {
          console.warn('commonApi.getNotifications is not available, using mock');
          setNotifications(MOCK_NOTIFICATIONS);
          setUseMock(true);
          setLoading(false);
          return;
        }

        const res = await commonApi.getNotifications({ limit: 50 });
        console.log('📦 Notifications response:', res);

        let data = res?.data;
        if (!data) {
          setNotifications(MOCK_NOTIFICATIONS);
          setUseMock(true);
          setLoading(false);
          return;
        }

        if (data.data && Array.isArray(data.data)) {
          data = data.data;
        } else if (data.items && Array.isArray(data.items)) {
          data = data.items;
        }

        if (Array.isArray(data) && data.length > 0) {
          setNotifications(data);
          setUseMock(false);
        } else {
          setNotifications(MOCK_NOTIFICATIONS);
          setUseMock(true);
        }
      } catch (error) {
        console.error('❌ Lỗi fetch notifications:', error);
        setNotifications(MOCK_NOTIFICATIONS);
        setUseMock(true);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user]);

  const markAsRead = async (id: string) => {
    if (useMock) {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      return;
    }

    try {
      if (typeof commonApi.markNotificationRead === 'function') {
        await commonApi.markNotificationRead(id);
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      } else {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      }
    } catch {
      toast.error('Không thể đánh dấu đã đọc');
    }
  };

  const markAllAsRead = async () => {
    if (useMock) {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success('Đã đánh dấu tất cả là đã đọc');
      return;
    }

    try {
      if (typeof commonApi.markAllNotificationsRead === 'function') {
        await commonApi.markAllNotificationsRead();
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        toast.success('Đã đánh dấu tất cả là đã đọc');
      } else {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        toast.success('Đã đánh dấu tất cả là đã đọc');
      }
    } catch {
      toast.error('Không thể thực hiện');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Thông báo</h1>
        <div className="flex gap-2">
          {Array.isArray(notifications) && notifications.some((n) => !n.isRead) && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              Đánh dấu tất cả đã đọc
            </Button>
          )}
          <BackButton />
        </div>
      </div>

      {!Array.isArray(notifications) || notifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="h-12 w-12 mx-auto text-slate-300 mb-3" />
          <h2 className="text-xl font-semibold">Chưa có thông báo</h2>
          <p className="text-sm text-muted-foreground">
            Khi có thông báo mới, chúng sẽ xuất hiện ở đây.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <Card
              key={notif.id}
              className={`cursor-pointer hover:shadow-md transition ${
                !notif.isRead ? 'border-blue-200 bg-blue-50/50' : ''
              }`}
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
                    {notif.link && (
                      <a
                        href={notif.link}
                        className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Xem chi tiết
                      </a>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {useMock && (
            <p className="text-xs text-amber-500 text-center mt-2">
              💡 Dữ liệu mẫu. Thông báo thực tế sẽ hiển thị khi có dữ liệu từ server.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

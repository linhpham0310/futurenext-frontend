// src/components/layout/teacher-header.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Bell, Search, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/hooks/auth/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { commonApi } from '@/lib/api';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ThemeToggle } from './theme-toggle';
import { TeacherMenu } from './teacher-menu';

interface Notification {
  id: string;
  title: string;
  description: string;
  link: string;
  isRead: boolean;
  createdAt: string;
}

interface SearchResult {
  id: string;
  label: string;
  type: 'user' | 'course';
  link: string;
}

function formatDistanceToNow(date: Date): string {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ngày trước`;
  return date.toLocaleDateString('vi-VN');
}

export const TeacherHeader = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setNotifLoading(true);
      const [notifRes, countRes] = await Promise.all([
        commonApi.getNotifications({ limit: 20 }),
        commonApi.getUnreadCount(),
      ]);
      setNotifications(notifRes.data);
      setUnreadCount(countRes.data.count);
    } catch (error) {
      console.error(error);
    } finally {
      setNotifLoading(false);
    }
  }, []);

  const markAsRead = async (id: string, link: string) => {
    try {
      await commonApi.markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
      router.push(link);
      setNotifOpen(false);
    } catch (error) {
      toast.error('Không thể đánh dấu đã đọc');
    }
  };

  const markAllAsRead = async () => {
    try {
      await commonApi.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('Đã đánh dấu tất cả thông báo là đã đọc');
    } catch (error) {
      toast.error('Không thể thực hiện');
    }
  };

  const handleSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    try {
      const res = await commonApi.search(q);
      const courses = res.data?.items ?? res.data ?? [];
      setSearchResults(
        courses.map((c: any) => ({
          id: c.id,
          label: c.title,
          type: 'course',
          link: `/teacher/courses/${c.id}`,
        }))
      );
    } catch (error) {
      console.error(error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      handleSearch(searchQuery);
    }, 500);
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [searchQuery, handleSearch]);

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/teacher/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Logo */}
      <Link href="/teacher/dashboard" className="flex items-center shrink-0">
        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-700 bg-clip-text text-transparent">
          FutureNext.ai
        </span>
      </Link>

      {/* Search */}
      <div className="relative w-96">
        <form onSubmit={onSearchSubmit}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Tìm kiếm khóa học, học viên..."
            className="pl-9 bg-slate-50 border-slate-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
        {(searchQuery.trim() !== '' || searchLoading) && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-md shadow-lg border z-50 max-h-80 overflow-auto">
            {searchLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
              </div>
            ) : searchResults.length === 0 ? (
              <div className="px-4 py-3 text-sm text-slate-500">Không tìm thấy kết quả</div>
            ) : (
              searchResults.map((item) => (
                <div
                  key={item.id}
                  className="px-4 py-2 hover:bg-slate-50 cursor-pointer flex items-center justify-between"
                  onClick={() => {
                    router.push(item.link);
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                >
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-slate-400">
                      {item.type === 'user' ? 'Học viên' : 'Khóa học'}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-4">
        {/* Notifications Dropdown */}
        <DropdownMenu open={notifOpen} onOpenChange={setNotifOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-slate-600" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex justify-between items-center">
              <span>Thông báo</span>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-auto py-1"
                  onClick={markAllAsRead}
                >
                  Đánh dấu tất cả đã đọc
                </Button>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <ScrollArea className="h-[300px]">
              {notifLoading && notifications.length === 0 ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-6 text-sm text-slate-500">
                  Không có thông báo nào
                </div>
              ) : (
                notifications.map((notif) => (
                  <DropdownMenuItem
                    key={notif.id}
                    className={cn(
                      'flex flex-col items-start p-3 cursor-pointer',
                      !notif.isRead && 'bg-blue-50'
                    )}
                    onClick={() => markAsRead(notif.id, notif.link)}
                  >
                    <div className="font-medium text-sm">{notif.title}</div>
                    <div className="text-xs text-slate-500 mt-1">{notif.description}</div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      {formatDistanceToNow(new Date(notif.createdAt))}
                    </div>
                  </DropdownMenuItem>
                ))
              )}
            </ScrollArea>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="justify-center text-blue-600"
              onClick={() => router.push('/teacher/notifications')}
            >
              Xem tất cả
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <ThemeToggle />

        {/* TeacherMenu (avatar dropdown) */}
        <TeacherMenu />
      </div>
    </header>
  );
};

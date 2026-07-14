// src/components/layout/admin-header.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { commonApi } from '@/lib/api';
import { ScrollArea } from '../ui/scroll-area';
import { ThemeToggle } from './theme-toggle';

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

export const AdminHeader = () => {
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

  // Lấy thông báo và số lượng chưa đọc
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

  // Đánh dấu một thông báo đã đọc
  const markAsRead = async (id: string, link: string) => {
    try {
      await commonApi.markNotificationRead(id);
      // Cập nhật local state
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
      router.push(link);
      setNotifOpen(false);
    } catch (error) {
      toast.error('Không thể đánh dấu đã đọc');
    }
  };

  // Đánh dấu tất cả đã đọc
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

  // Tìm kiếm (gợi ý)
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
          link: `/admin/courses/${c.id}`,
        }))
      );
    } catch (error) {
      console.error(error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // Debounce tìm kiếm
  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      handleSearch(searchQuery);
    }, 500);
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [searchQuery, handleSearch]);

  // Nhấn Enter để đi đến trang kết quả tìm kiếm tổng hợp
  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/admin/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  // Load thông báo lần đầu
  useEffect(() => {
    fetchNotifications();
    // Có thể dùng WebSocket hoặc polling để cập nhật realtime, tạm thời polling 30s
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2);
  };

  return (
    <header className="h-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Search with suggestions */}
      <div className="relative w-96 hidden md:block">
        <form onSubmit={onSearchSubmit}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm khóa học, người dùng..."
            className="pl-9 bg-muted/50 border-border focus-visible:ring-primary rounded-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
        {/* Dropdown kết quả gợi ý */}
        {(searchQuery.trim() !== '' || searchLoading) && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-card rounded-md shadow-lg border border-border z-50 max-h-80 overflow-auto">
            {searchLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : searchResults.length === 0 ? (
              <div className="px-4 py-3 text-sm text-muted-foreground">Không tìm thấy kết quả</div>
            ) : (
              searchResults.map((item) => (
                <div
                  key={item.id}
                  className="px-4 py-2 hover:bg-muted cursor-pointer flex items-center justify-between transition-colors"
                  onClick={() => {
                    router.push(item.link);
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.type === 'user' ? 'Người dùng' : 'Khóa học'}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Notifications Dropdown */}
        <DropdownMenu open={notifOpen} onOpenChange={setNotifOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-foreground hover:bg-muted hover:text-primary transition-colors">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-destructive rounded-full text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
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
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-6 text-sm text-muted-foreground">
                  Không có thông báo nào
                </div>
              ) : (
                notifications.map((notif) => (
                  <DropdownMenuItem
                    key={notif.id}
                    className={cn(
                      'flex flex-col items-start p-3 cursor-pointer transition-colors',
                      !notif.isRead ? 'bg-primary/5' : ''
                    )}
                    onClick={() => markAsRead(notif.id, notif.link)}
                  >
                    <div className="font-medium text-sm text-foreground">{notif.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">{notif.description}</div>
                    <div className="text-[10px] text-muted-foreground/70 mt-1">
                      {formatDistanceToNow(new Date(notif.createdAt))}
                    </div>
                  </DropdownMenuItem>
                ))
              )}
            </ScrollArea>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="justify-center text-primary font-medium cursor-pointer"
              onClick={() => router.push('/notifications')}
            >
              Xem tất cả
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <ThemeToggle />

        {/* User info */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-foreground">
              Chào {user?.fullName?.split(' ').pop() || 'Admin'}
            </p>
            <p className="text-xs text-muted-foreground">Quản trị viên</p>
          </div>
          <Avatar className="h-9 w-9 border border-border">
            <AvatarImage src={user?.avatarUrl || undefined} />
            <AvatarFallback className="bg-muted text-foreground text-sm font-medium">
              {getInitials(user?.fullName || '')}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};

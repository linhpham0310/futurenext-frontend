// src/app/(main)/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { usersApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/auth/useAuth';

export default function SettingsPage() {
  const { user, setUser } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [updatedAt, setUpdatedAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await usersApi.getProfile();
        setFullName(profile.fullName || '');
        setUpdatedAt(profile.updatedAt || new Date().toISOString());
        setPhone((profile as { phone?: string }).phone || '');
        setBio((profile as { bio?: string }).bio || '');
      } catch (error) {
        console.error('Failed to load profile', error);
        toast.error('Không thể tải thông tin');
      } finally {
        setFetchLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      // Chỉ gửi các trường API cho phép: fullName, avatarUrl, updatedAt
      const updated = await usersApi.updateProfile({
        fullName,
        updatedAt,
      });
      setUser(updated);
      // Cập nhật lại updatedAt mới từ response
      setUpdatedAt(updated.updatedAt || new Date().toISOString());
      toast.success('Cập nhật họ tên thành công');
    } catch (error) {
      toast.error('Cập nhật thất bại');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Cài đặt</h1>
      <Tabs defaultValue="profile">
        <TabsList className="flex flex-col h-fit w-48 bg-white border rounded-xl p-2">
          <TabsTrigger value="profile" className="w-full flex justify-start">
            Hồ sơ
          </TabsTrigger>

          <TabsTrigger value="security" className="w-full flex justify-start">
            Bảo mật
          </TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cá nhân</CardTitle>
              <CardDescription>Cập nhật thông tin của bạn</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Họ và tên</label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input value={user?.email || ''} disabled className="bg-muted" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Số điện thoại</label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0912 345 678"
                  disabled
                />
                <p className="text-xs text-muted-foreground mt-1">Tính năng đang phát triển</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Giới thiệu</label>
                <textarea
                  className="w-full border rounded-md p-2 bg-background"
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Giới thiệu ngắn về bản thân..."
                  disabled
                />
                <p className="text-xs text-muted-foreground mt-1">Tính năng đang phát triển</p>
              </div>
              <Button onClick={handleUpdateProfile} disabled={loading} className="bg-primary">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Lưu thay đổi
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="security">
          <Card>
            <CardContent className="p-6 text-muted-foreground">
              Chức năng đổi mật khẩu sẽ được cập nhật sau.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import { Edit2, Save, X } from 'lucide-react';
import { TeacherProfileForm } from '@/components/features/profile/teacher-profile-form';
import { usersApi } from '@/lib/api';
import { useAuth } from '@/hooks/auth/useAuth';

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    bio: '',
  });

  const loadProfile = async () => {
    try {
      const response = await usersApi.getProfile();
      const profileData = response.data;
      setProfile(profileData);
      setFormData({
        fullName: profileData.fullName || '',
        phone: profileData.phone || '',
        bio: profileData.bio || '',
      });
    } catch (error) {
      toast.error('Không thể tải thông tin hồ sơ');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProfile();
  }, []); // không còn lỗi

  const handleSave = async () => {
    try {
      await usersApi.updateProfile(formData as any);
      setUser({ ...user, ...formData });
      setProfile({ ...profile, ...formData });
      setIsEditing(false);
      toast.success('Cập nhật hồ sơ thành công');
    } catch (error) {
      toast.error('Cập nhật thất bại');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Hồ sơ của tôi</h1>
        </div>
        <p className="text-slate-500 mt-1">Quản lý thông tin cá nhân và tài khoản</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Avatar & Stats */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 text-center">
              <Avatar className="w-24 h-24 mx-auto mb-4">
                <AvatarImage src={profile?.avatarUrl} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-xl">
                  {getInitials(profile?.fullName || user?.fullName || 'User')}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold text-slate-900">
                {profile?.fullName || user?.fullName}
              </h2>
              <p className="text-slate-500 text-sm">{user?.email}</p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Profile Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Thông tin cá nhân</CardTitle>
                <CardDescription>Cập nhật thông tin cơ bản của bạn</CardDescription>
              </div>
              {!isEditing ? (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Chỉnh sửa
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                    <X className="h-4 w-4 mr-2" />
                    Hủy
                  </Button>
                  <Button size="sm" onClick={handleSave}>
                    <Save className="h-4 w-4 mr-2" />
                    Lưu
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Họ và tên</Label>
                  {isEditing ? (
                    <Input
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 text-slate-700">{profile?.fullName || user?.fullName}</p>
                  )}
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="mt-1 text-slate-500">{user?.email}</p>
                  <p className="text-xs text-slate-400">Không thể thay đổi email</p>
                </div>
                <div>
                  <Label>Số điện thoại</Label>
                  {isEditing ? (
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Chưa cập nhật"
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 text-slate-700">{profile?.phone || 'Chưa cập nhật'}</p>
                  )}
                </div>
                <div>
                  <Label>Ngày tham gia</Label>
                  <p className="mt-1 text-slate-700">
                    {profile?.createdAt
                      ? new Date(profile.createdAt).toLocaleDateString('vi-VN')
                      : 'Đang cập nhật'}
                  </p>
                </div>
              </div>
              <div>
                <Label>Giới thiệu</Label>
                {isEditing ? (
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Giới thiệu ngắn về bản thân..."
                    className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                ) : (
                  <p className="mt-1 text-slate-700">{profile?.bio || 'Chưa có giới thiệu'}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <TeacherProfileForm existingProfile={profile?.teacherProfile} onSuccess={loadProfile} />
        </div>
      </div>
    </div>
  );
}

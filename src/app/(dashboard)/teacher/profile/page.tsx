'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import { Edit2, Save, X, Upload, Award, Users, BookOpen } from 'lucide-react';
import { usersApi, teacherApi } from '@/lib/api';
import { useAuth } from '@/hooks/auth/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { TeacherProfileForm } from '@/components/features/profile/teacher-profile-form';

export default function TeacherProfilePage() {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [teacherProfile, setTeacherProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    bio: '',
    avatarUrl: '',
  });

  const loadProfile = async () => {
    try {
      const [userRes, teacherRes] = await Promise.all([
        usersApi.getProfile(),
        teacherApi.getProfile().catch(() => null),
      ]);
      const userData = userRes.data;
      setProfile(userData);
      setFormData({
        fullName: userData.fullName || '',
        phone: userData.phone || '',
        bio: userData.bio || '',
        avatarUrl: userData.avatarUrl || '',
      });
      if (teacherRes?.data?.data) {
        setTeacherProfile(teacherRes.data.data);
      }
    } catch (error) {
      toast.error('Không thể tải thông tin hồ sơ');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ảnh không được vượt quá 2MB');
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Chỉ hỗ trợ định dạng JPG, PNG, WebP');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await usersApi.uploadAvatar(formData); // gọi POST /users/me/avatar
      const publicUrl = response.data.avatarUrl;

      setFormData((prev) => ({ ...prev, avatarUrl: publicUrl }));
      setProfile((prev: any) => ({ ...prev, avatarUrl: publicUrl }));
      setUser({ ...user, avatarUrl: publicUrl });

      toast.success('Cập nhật ảnh đại diện thành công!');
    } catch (error: any) {
      console.error('Upload avatar error:', error);
      toast.error(error?.response?.data?.message || 'Không thể tải ảnh lên');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    try {
      await usersApi.updateProfile({
        fullName: formData.fullName,
        phone: formData.phone,
        avatarUrl: formData.avatarUrl,
      } as any);
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
      <div>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Hồ sơ giảng viên</h1>
          <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
            Giảng viên
          </span>
        </div>
        <p className="text-slate-500 mt-1">Quản lý thông tin cá nhân và hồ sơ giảng dạy</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Avatar & Stats */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="relative inline-block">
                <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-blue-100">
                  <AvatarImage src={formData.avatarUrl || profile?.avatarUrl || ''} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-xl">
                    {getInitials(formData.fullName || user?.fullName || 'User')}
                  </AvatarFallback>
                </Avatar>
                {/* Nút upload avatar - GIỐNG Y HỆT STUDENT PROFILE */}
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 p-1.5 bg-blue-600 rounded-full text-white cursor-pointer hover:bg-blue-700 transition shadow-md"
                >
                  <Upload className="h-4 w-4" />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleAvatarUpload}
                    disabled={isUploading}
                  />
                </label>
              </div>
              {isUploading && <p className="text-xs text-blue-600 mt-1">Đang tải ảnh...</p>}
              <h2 className="text-xl font-bold text-slate-900">
                {formData.fullName || user?.fullName}
              </h2>
              <p className="text-slate-500 text-sm">{user?.email}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="h-5 w-5 text-blue-500" /> Thống kê giảng dạy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-500 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" /> Khóa học
                </span>
                <span className="font-semibold">{teacherProfile?.totalCourses || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 flex items-center gap-2">
                  <Users className="h-4 w-4" /> Học viên
                </span>
                <span className="font-semibold">{teacherProfile?.totalStudents || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 flex items-center gap-2">
                  <Award className="h-4 w-4" /> Chứng chỉ
                </span>
                <span className="font-semibold">{teacherProfile?.totalCertificates || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Profile Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Thông tin cá nhân</CardTitle>
                <CardDescription>Cập nhật thông tin cơ bản của bạn</CardDescription>
              </div>
              {!isEditing ? (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit2 className="h-4 w-4 mr-2" /> Chỉnh sửa
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                    <X className="h-4 w-4 mr-2" /> Hủy
                  </Button>
                  <Button size="sm" onClick={handleSave}>
                    <Save className="h-4 w-4 mr-2" /> Lưu
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
                    <p className="mt-1 text-slate-700">{formData.fullName || user?.fullName}</p>
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
                    <p className="mt-1 text-slate-700">{formData.phone || 'Chưa cập nhật'}</p>
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
                  <p className="mt-1 text-slate-700">{formData.bio || 'Chưa có giới thiệu'}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <TeacherProfileForm existingProfile={teacherProfile} onSuccess={loadProfile} />
        </div>
      </div>
    </div>
  );
}

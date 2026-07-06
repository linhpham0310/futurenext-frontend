'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import { usersApi } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera } from 'lucide-react';

interface AvatarUploadProps {
  avatarUrl?: string | null;
  onUploadSuccess?: (newUrl: string) => void;
}

export function AvatarUpload({ avatarUrl, onUploadSuccess }: AvatarUploadProps) {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type & size (tùy chọn)
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ảnh không được vượt quá 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await usersApi.uploadAvatar(formData);
      const newAvatarUrl = response.data.avatarUrl;

      toast.success('Cập nhật ảnh đại diện thành công');
      onUploadSuccess?.(newAvatarUrl);
    } catch (error) {
      console.error('Upload avatar error:', error);
      toast.error('Không thể tải ảnh lên, vui lòng thử lại');
    } finally {
      setIsUploading(false);
      // Reset input để có thể chọn lại cùng file
      e.target.value = '';
    }
  };

  return (
    <div className="relative inline-block">
      <Avatar className="w-24 h-24 border-2 border-primary/20">
        <AvatarImage src={avatarUrl || ''} alt="Avatar" />
        <AvatarFallback className="bg-primary/10 text-primary">
          {user?.fullName?.charAt(0) || 'U'}
        </AvatarFallback>
      </Avatar>
      <label
        htmlFor="avatar-upload"
        className="absolute -bottom-1 -right-1 p-1.5 bg-primary rounded-full text-white cursor-pointer hover:bg-primary/80 transition-colors"
      >
        <Camera className="w-4 h-4" />
        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </label>
      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

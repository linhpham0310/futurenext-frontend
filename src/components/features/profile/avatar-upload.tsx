'use client';

import { useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/auth/useAuth';
import { supabase } from '@/lib/supabaseClient';

interface AvatarUploadProps {
  currentAvatarUrl?: string | null;
  onUploadSuccess: (url: string) => void;
  size?: 'sm' | 'md' | 'lg';
}

export function AvatarUpload({
  currentAvatarUrl,
  onUploadSuccess,
  size = 'lg',
}: AvatarUploadProps) {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-24 h-24',
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
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
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar-${user?.id}-${Date.now()}.${fileExt}`;
      // QUAN TRỌNG: path phải có thư mục user_id
      const filePath = `avatars/${user?.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);

      onUploadSuccess(urlData.publicUrl);
      toast.success('Cập nhật ảnh đại diện thành công!');
    } catch (error: any) {
      console.error('Upload avatar error:', error);
      toast.error(error?.message || 'Không thể tải ảnh lên');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="relative inline-block">
      <Avatar className={`${sizeClasses[size]} border-4 border-blue-100`}>
        <AvatarImage src={currentAvatarUrl || ''} />
        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-xl">
          {getInitials(user?.fullName || 'User')}
        </AvatarFallback>
      </Avatar>

      <label
        htmlFor="avatar-upload"
        className="absolute bottom-0 right-0 p-1.5 bg-blue-600 rounded-full text-white cursor-pointer hover:bg-blue-700 transition shadow-md"
      >
        {isUploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        <input
          id="avatar-upload"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </label>
    </div>
  );
}

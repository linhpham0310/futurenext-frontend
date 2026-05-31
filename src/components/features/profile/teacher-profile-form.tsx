// src/components/features/profile/teacher-profile-form.tsx
'use client';

import React, { useState } from 'react';
import { useTeacherProfile } from '@/hooks/profile/use-teacher-profile';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

interface TeacherProfileFormProps {
  existingProfile?: {
    bio: string;
    expertise?: string[];
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
  } | null;
  onSuccess?: () => void;
}

export function TeacherProfileForm({ existingProfile, onSuccess }: TeacherProfileFormProps) {
  const { submitProfile, updateProfile, isLoading, error } = useTeacherProfile();

  const [bio, setBio] = useState(existingProfile?.bio || '');
  const [expertiseInput, setExpertiseInput] = useState(
    existingProfile?.expertise?.join(', ') || ''
  );
  const [successMsg, setSuccessMsg] = useState('');
  const [localError, setLocalError] = useState('');

  const status = existingProfile?.status;
  const isReadOnly = status === 'APPROVED' || status === 'REJECTED';
  const isUpdating = !!existingProfile;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setLocalError('');

    if (!bio.trim()) {
      setLocalError('Vui lòng nhập tiểu sử');
      return;
    }

    const expertiseArray = expertiseInput
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    const payload = { bio: bio.trim(), expertise: expertiseArray };

    try {
      if (isUpdating) {
        await updateProfile(payload);
        setSuccessMsg('Cập nhật hồ sơ thành công!');
      } else {
        await submitProfile(payload);
        setSuccessMsg('Nộp hồ sơ thành công! Vui lòng chờ phê duyệt.');
      }
      if (onSuccess) onSuccess();
    } catch {}
  };

  const getStatusInfo = () => {
    switch (status) {
      case 'PENDING':
        return { text: 'Đang chờ duyệt', className: 'bg-yellow-100 text-yellow-800' };
      case 'APPROVED':
        return { text: 'Đã được duyệt', className: 'bg-green-100 text-green-800' };
      case 'REJECTED':
        return { text: 'Đã bị từ chối', className: 'bg-red-100 text-red-800' };
      default:
        return null;
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="border-t pt-6 mt-4">
      <h2 className="text-xl font-semibold mb-4">Đăng ký trở thành Giảng viên</h2>

      {statusInfo && (
        <div className={`mb-4 p-3 rounded-md text-sm font-medium ${statusInfo.className}`}>
          Trạng thái hồ sơ: {statusInfo.text}
          {status === 'APPROVED' && ' (Hồ sơ đã được duyệt, bạn không thể chỉnh sửa nữa)'}
          {status === 'REJECTED' && ' (Hồ sơ của bạn đã bị từ chối)'}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="bio" className="mb-1 block">
            Tiểu sử <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="bio"
            required
            disabled={isReadOnly || isLoading}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            placeholder="Giới thiệu về kinh nghiệm giảng dạy và làm việc của bạn..."
            maxLength={2000}
          />
          <p className="text-xs text-gray-500 mt-1">{bio.length}/2000 ký tự</p>
        </div>

        <div>
          <Label htmlFor="expertise" className="mb-1 block">
            Chuyên môn
          </Label>
          <Input
            id="expertise"
            type="text"
            disabled={isReadOnly || isLoading}
            value={expertiseInput}
            onChange={(e) => setExpertiseInput(e.target.value)}
            placeholder="VD: JavaScript, NextJS, Python (ngăn cách bằng dấu phẩy)"
          />
          <p className="text-xs text-gray-500 mt-1">Nhập các kỹ năng cách nhau bằng dấu phẩy</p>
        </div>

        {(localError || error) && (
          <Alert variant="destructive">
            <AlertDescription>{localError || error}</AlertDescription>
          </Alert>
        )}

        {successMsg && (
          <Alert className="bg-green-50 text-green-800 border-green-200">
            <AlertDescription>{successMsg}</AlertDescription>
          </Alert>
        )}

        {!isReadOnly && (
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Đang xử lý...' : isUpdating ? 'Cập nhật hồ sơ' : 'Nộp hồ sơ'}
          </Button>
        )}
      </form>
    </div>
  );
}

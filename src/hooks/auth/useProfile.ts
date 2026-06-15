// src/hooks/useProfile.ts (phiên bản đã sửa)
import { useState, useEffect, useCallback } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateProfileSchema, UpdateProfileFormData } from '@/lib/schemas/user.schema';
import { usersApi } from '@/lib/api';
import { AuthUser } from '@/types/auth.api';
import { useAuth } from './useAuth';

export function useProfile() {
  const { user: userFromAuth, setUser: setUserInAuth } = useAuth();
  const [profileData, setProfileData] = useState<AuthUser | null>(userFromAuth);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const form = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      fullName: userFromAuth?.fullName || '',
      avatarUrl: userFromAuth?.avatarUrl || '',
      phone: userFromAuth?.phone || '',
    },
  });

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const response = await usersApi.getProfile();
      setProfileData(response.data);
      setUserInAuth(response.data);
      form.reset({
        fullName: response.data.fullName,
        avatarUrl: response.data.avatarUrl || '',
        phone: response.data.phone || '',
      });
    } catch (error: unknown) {
      const err = error as { message?: string };
      setFetchError(err.message || 'Không thể tải hồ sơ.');
    } finally {
      setIsLoading(false);
    }
  }, [setUserInAuth, form]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const onUpdateSubmit: SubmitHandler<UpdateProfileFormData> = async (data) => {
    setUpdateError(null);
    setUpdateSuccess(false);
    setIsUpdating(true);
    try {
      const { data: updatedUserData } = await usersApi.updateProfile(data);
      setUpdateSuccess(true);
      setProfileData(updatedUserData);
      setUserInAuth(updatedUserData);
      form.reset({
        fullName: updatedUserData.fullName,
        avatarUrl: updatedUserData.avatarUrl || '',
        phone: updatedUserData.phone || '',
      });
    } catch (error: unknown) {
      const err = error as { statusCode?: number; message?: string };
      if (err?.statusCode === 409) {
        setUpdateError('Dữ liệu đã được thay đổi bởi phiên khác. Vui lòng tải lại trang.');
        setTimeout(() => fetchProfile(), 2000);
      } else {
        setUpdateError(err.message || 'Đã xảy ra lỗi khi cập nhật hồ sơ.');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    form,
    onSubmit: onUpdateSubmit,
    profileData,
    isLoading,
    fetchError,
    isUpdating,
    updateError,
    updateSuccess,
    refetchProfile: fetchProfile,
  };
}

/**
 * @file Custom hook for managing user profile data fetching and updates.
 * Implements optimistic lock logic by handling 409 Conflict errors.
 * [LLD Ref: UC06.1, UC06.2, UC06.4]
 */
import { useState, useEffect, useCallback } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateProfileSchema, UpdateProfileFormData } from '@/lib/schemas/user.schema';
import { usersApi } from '@/lib/api';
import { useAuth } from '@/hooks/auth/useAuth'; // (S1-FE-05) Để cập nhật user state
import { AuthUser } from '@/types/auth.api';

/**
 * Custom hook to manage fetching and updating the user's profile.
 */
export function useProfile() {
  const { user: userFromAuth, setUser: setUserInAuth } = useAuth(); // Lấy user từ global state

  // State cho dữ liệu profile (nguồn chính)
  const [profileData, setProfileData] = useState<AuthUser | null>(userFromAuth);
  // State cho việc fetch dữ liệu
  const [isLoading, setIsLoading] = useState(true); // Loading khi fetch
  const [fetchError, setFetchError] = useState<string | null>(null);
  // State cho việc submit form
  const [isUpdating, setIsUpdating] = useState(false); // Loading khi update
  const [updateError, setUpdateError] = useState<string | null>(null); // Lỗi API khi update
  const [updateSuccess, setUpdateSuccess] = useState(false); // Trạng thái update thành công

  // Initialize react-hook-form
  const form = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      fullName: userFromAuth?.fullName || '',
      avatarUrl: userFromAuth?.avatarUrl || '',
      updatedAt: userFromAuth?.updatedAt || new Date().toISOString(), // Khởi tạo tạm
    },
  });

  /**
   * (Nghiệp vụ) Hàm fetch dữ liệu profile từ API (GET /me/profile)
   */
  const fetchProfile = useCallback(async () => {
    console.log('[useProfile] Fetching profile...');
    setIsLoading(true);
    setFetchError(null);
    try {
      const response = await usersApi.getProfile();
      setProfileData(response.data); // Cập nhật state profile
      setUserInAuth(response.data); // Cập nhật global auth store
      // Cập nhật giá trị default của form sau khi fetch thành công
      form.reset({
        fullName: response.data.fullName,
        avatarUrl: response.data.avatarUrl || '',
        updatedAt: response.data.updatedAt, // QUAN TRỌNG: Lưu timestamp mới nhất
      });
      console.log('[useProfile] Profile fetched:', response.data);
    } catch (error: unknown) {
      console.error('[useProfile] Fetch failed:', error);
      const err = error as { message?: string };

      setFetchError(err.message || 'Không thể tải hồ sơ.');
      // Nếu lỗi 401 (interceptor thất bại), hook useAuth (S1-FE-06) sẽ tự động xử lý logout
    } finally {
      setIsLoading(false);
    }
  }, [setUserInAuth, form]); // Thêm form vào dependencies

  // Tự động fetch profile khi component mount
  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      if (isMounted) {
        await fetchProfile();
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [fetchProfile]); // Chỉ chạy 1 lần

  /**
   * (Nghiệp vụ) Xử lý submit form cập nhật profile (PUT /me/profile)
   * Tích hợp Optimistic Lock.
   */
  const onUpdateSubmit: SubmitHandler<UpdateProfileFormData> = async (data) => {
    setUpdateError(null);
    setUpdateSuccess(false);
    setIsUpdating(true);
    console.debug('Attempting profile update with data:', data);

    try {
      // 1. Gọi API update
      // `data` đã bao gồm `updatedAt` từ form.reset()
      const formData = form.getValues();

      const { data: updatedUserData } = await usersApi.updateProfile(formData);
      // 2. Cập nhật thành công
      console.log('Profile update API Success:', updatedUserData);
      setUpdateSuccess(true);
      setProfileData(updatedUserData); // Cập nhật state profile local
      setUserInAuth(updatedUserData); // Cập nhật global state
      // Reset form với dữ liệu MỚI NHẤT (đặc biệt là updatedAt mới)
      form.reset({
        fullName: updatedUserData.fullName,
        avatarUrl: updatedUserData.avatarUrl || '',
        updatedAt: updatedUserData.updatedAt, // QUAN TRỌNG: Cập nhật timestamp mới
      });
    } catch (error: unknown) {
      console.error('Profile update API Failed:', error);
      const err = error as { statusCode?: number; message?: string };

      // 3. Xử lý lỗi
      if (err?.statusCode === 409) {
        // Lỗi Optimistic Lock [cite: 3716-3720]
        setUpdateError(
          'Dữ liệu đã được thay đổi bởi một phiên khác. Vui lòng tải lại trang và thử lại.'
        );

        // Tự động fetch lại dữ liệu mới nhất để user thử lại
        setTimeout(() => fetchProfile(), 2000);
      } else if (err?.statusCode === 400) {
        // Lỗi validation từ server
        // (Hiếm khi xảy ra nếu Zod đã validate đúng)
        setUpdateError(err.message || 'Dữ liệu gửi lên không hợp lệ.');
      } else {
        // Lỗi chung (500, mạng...)
        setUpdateError(err.message || 'Đã xảy ra lỗi khi cập nhật hồ sơ.');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    form, // form object
    onSubmit: onUpdateSubmit, // hàm submit
    profileData, // Dữ liệu profile (đã fetch)
    isLoading, // Trạng thái fetch ban đầu
    fetchError, // Lỗi fetch ban đầu
    isUpdating, // Trạng thái đang submit (loading)
    updateError, // Lỗi khi submit
    updateSuccess, // Thành công khi submit
    refetchProfile: fetchProfile, // Hàm để tải lại profile thủ công
  };
}

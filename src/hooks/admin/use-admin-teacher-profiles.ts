// [Task: S3-FE-02] Hook quản lý danh sách và nghiệp vụ duyệt hồ sơ giảng viên cho Admin
import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '@/lib/api';

// Định nghĩa các interface nội bộ để TypeScript hỗ trợ check lỗi
export interface AdminTeacherProfile {
  id: string;
  bio: string;
  expertise: string[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: string;
  user: {
    id: string;
    email: string;
    full_name?: string;
  };
}

interface ApiError {
  message?: string;
}

export function useAdminTeacherProfiles() {
  const [profiles, setProfiles] = useState<AdminTeacherProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State quản lý bộ lọc và phân trang
  const [filters, setFilters] = useState({
    status: 'PENDING', // Mặc định hiển thị hồ sơ chờ duyệt
    page: 1,
    limit: 10,
  });
  const [totalPages, setTotalPages] = useState(1);

  // [Task: S3-FE-02] Hàm fetch danh sách hồ sơ
  const fetchProfiles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Build query string từ filters
      const queryParams = new URLSearchParams({
        page: filters.page.toString(),
        limit: filters.limit.toString(),
        ...(filters.status !== 'ALL' && { status: filters.status }),
      }).toString();

      // Gọi API GET từ Task S3-BE-02 — uses apiClient for automatic auth token injection
      const response = await apiClient.get(`/admin/teacher-profiles?${queryParams}`);
      const data = response.data;

      setProfiles(data.data.items);
      setTotalPages(data.data.meta.totalPages);
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Lỗi khi lấy danh sách');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    let isMounted = true;

    const loadProfiles = async () => {
      if (isMounted) {
        await fetchProfiles();
      }
    };

    loadProfiles();

    return () => {
      isMounted = false;
    };
  }, [fetchProfiles]);
  // [Task: S3-FE-02] Hàm xử lý Duyệt / Từ chối
  const reviewProfile = async (profileId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await apiClient.patch(`/admin/teacher-profiles/${profileId}/review`, { status });

      // Update lại state local để UI phản hồi ngay lập tức mà không cần gọi lại fetchProfiles
      setProfiles((prev) => prev.map((p) => (p.id === profileId ? { ...p, status } : p)));

      return true;
    } catch (err: unknown) {
      const apiError = err as ApiError;
      const errorMessage = apiError.message || 'Lỗi khi xử lý hồ sơ';

      alert(errorMessage); // Hiển thị lỗi nhanh bằng alert (hoặc dùng Toast tùy dự án)
      return false;
    }
  };

  return {
    profiles,
    isLoading,
    error,
    filters,
    setFilters,
    totalPages,
    fetchProfiles,
    reviewProfile,
  };
}

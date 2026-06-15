// src/hooks/admin/useAdminTeacherProfiles.ts
import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '@/lib/api';

export interface AdminTeacherProfile {
  id: string;
  bio: string;
  expertise: string[];
  status: 'pending_review' | 'approved' | 'rejected';
  createdAt: string;
  user: {
    id: string;
    email: string;
    fullName?: string;
  };
}

export function useAdminTeacherProfiles() {
  const [profiles, setProfiles] = useState<AdminTeacherProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: 'pending_review',
    page: 1,
    limit: 10,
  });
  const [totalPages, setTotalPages] = useState(1);

  const fetchProfiles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/admin/teacher-profiles', { params: filters });
      const data = response.data;
      setProfiles(data.data.items);
      setTotalPages(data.data.meta.totalPages);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi khi lấy danh sách');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const reviewProfile = async (profileId: string, status: 'approved' | 'rejected') => {
    try {
      const endpoint =
        status === 'approved'
          ? `/admin/teacher-profiles/${profileId}/approve`
          : `/admin/teacher-profiles/${profileId}/reject`;
      await apiClient.patch(endpoint);
      setProfiles((prev) => prev.map((p) => (p.id === profileId ? { ...p, status } : p)));
      return true;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Lỗi khi xử lý hồ sơ';
      alert(message);
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

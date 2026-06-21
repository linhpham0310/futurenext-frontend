import { adminApi, apiClient } from '@/lib/api';
import { User, UserRole, UserStatus } from '@/types/auth.api';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export const useUserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    q: '',
    role: '' as UserRole | '',
    status: '' as UserStatus | '',
  });

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await adminApi.getUsers({
        page: filters.page,
        limit: filters.limit,
        q: filters.q || undefined,
        role: filters.role || undefined,
        status: filters.status || undefined,
      });
      setUsers(response.data.data || []);
      setTotal(response.data.meta?.total || 0);
      setTotalPages(response.data.meta?.totalPages || 0);
    } catch (error: any) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || 'Không thể tải danh sách người dùng');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    let isMounted = true;
    const loadUsers = async () => {
      if (isMounted) {
        await fetchUsers();
      }
    };
    loadUsers();
    return () => {
      isMounted = false;
    };
  }, [fetchUsers]);

  const handleUpdateRole = async (userId: string, newRole: UserRole) => {
    try {
      await adminApi.updateUser(userId, { role: newRole });
      toast.success('Cập nhật vai trò thành công');
      await fetchUsers();
    } catch (error: any) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || 'Cập nhật thất bại');
    }
  };

  return {
    users,
    total,
    totalPages,
    isLoading,
    filters,
    setFilters,
    handleUpdateRole,
  };
};

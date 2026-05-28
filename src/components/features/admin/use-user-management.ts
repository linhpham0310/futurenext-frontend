import { apiClient } from '@/lib/api';
import { User, UserRole, UserStatus } from '@/types/auth.api';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface FetchUsersResponse {
  items: User[];
  meta: {
    total: number;
    totalPages: number;
    page: number;
    limit: number;
  };
}

export const useUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Trạng thái các bộ lọc
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    q: '',
    role: '' as UserRole | '',
    status: '' as UserStatus | '',
  });

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/admin/users', { params: filters });
      setUsers(response.data.items);
      setTotal(response.data.meta.total);
      setTotalPages(response.data.meta.totalPages);
    } catch (error: unknown) {
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

  // Hàm cập nhật quyền người dùng (Kết nối S2-BE-05)
  const handleUpdateRole = async (userId: string, newRole: UserRole) => {
    try {
      await apiClient.put(`/admin/users/${userId}/role`, { role: newRole });
      toast.success('Cập nhật vai trò thành công');
      fetchUsers(); // Tải lại dữ liệu sau khi cập nhật
    } catch (error: unknown) {
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

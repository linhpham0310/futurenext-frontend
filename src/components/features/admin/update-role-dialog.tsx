'use client';

import { useState } from 'react';
import { User, UserRole } from '@/types/auth.api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '@/lib/api';

interface UpdateRoleDialogProps {
  user: User;
  onUpdate: (userId: string, newRole: UserRole) => Promise<void>;
  children: React.ReactNode;
}

const roleConfig = {
  [UserRole.ADMIN]: {
    label: 'Quản trị viên',
    description: 'Toàn quyền quản lý hệ thống',
    color: 'bg-red-100 text-red-800',
  },
  [UserRole.TEACHER]: {
    label: 'Giảng viên',
    description: 'Tạo và quản lý khóa học',
    color: 'bg-blue-100 text-blue-800',
  },
  [UserRole.STUDENT]: {
    label: 'Học viên',
    description: 'Tham gia khóa học',
    color: 'bg-green-100 text-green-800',
  },
};

export const UpdateRoleDialog = ({ user, onUpdate, children }: UpdateRoleDialogProps) => {
  const [open, setOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(user.role as UserRole);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (selectedRole === user.role) {
      setOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      // Kiểm tra admin cuối cùng
      if (user.role === UserRole.ADMIN && selectedRole !== UserRole.ADMIN) {
        const { data } = await adminApi.checkLastAdmin(user.id, selectedRole);
        if (data.isLastAdmin) {
          toast.error('Không thể thay đổi vai trò của admin cuối cùng');
          setIsLoading(false);
          return;
        }
      }
      await onUpdate(user.id, selectedRole);
      setOpen(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Cập nhật vai trò thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentRoleLabel = () => roleConfig[user.role as UserRole]?.label || user.role;
  const isAdminWarning = selectedRole === UserRole.ADMIN && user.role !== UserRole.ADMIN;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-500" /> Cập nhật vai trò
          </DialogTitle>
          <DialogDescription>
            Thay đổi quyền hạn cho <strong>{user.fullName}</strong>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="rounded-lg bg-muted p-3">
            <p className="text-xs text-muted-foreground">Email</p>
            <p className="text-sm font-medium">{user.email}</p>
          </div>
          <div className="space-y-2">
            <Label>Vai trò hiện tại</Label>
            <div
              className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm ${roleConfig[user.role as UserRole]?.color}`}
            >
              {getCurrentRoleLabel()}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Vai trò mới</Label>
            <Select
              value={selectedRole}
              onValueChange={(value) => setSelectedRole(value as UserRole)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UserRole.STUDENT}>Học viên</SelectItem>
                <SelectItem value={UserRole.TEACHER}>Giảng viên</SelectItem>
                <SelectItem value={UserRole.ADMIN}>Quản trị viên</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {isAdminWarning && (
            <div className="rounded-md bg-yellow-50 p-3 text-sm text-yellow-800">
              ⚠️ Bạn đang cấp quyền Quản trị viên. Người dùng này sẽ có toàn quyền.
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
            Hủy
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading || selectedRole === user.role}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang lưu...
              </>
            ) : (
              'Lưu thay đổi'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

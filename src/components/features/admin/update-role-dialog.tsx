// src/components/features/admin/update-role-dialog.tsx
'use client';

import { useState } from 'react'; // ✅ Xóa useEffect khỏi import
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
import { Loader2 } from 'lucide-react';

interface UpdateRoleDialogProps {
  user: User;
  onUpdate: (userId: string, newRole: UserRole) => Promise<void>;
  children: React.ReactNode;
}

export const UpdateRoleDialog = ({ user, onUpdate, children }: UpdateRoleDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(user.role as UserRole);
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setSelectedRole(user.role as UserRole); // Reset khi mở dialog
    }
  };

  const handleUpdate = async () => {
    if (selectedRole === user.role) {
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      await onUpdate(user.id, selectedRole);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to update role:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'Quản trị viên';
      case UserRole.TEACHER:
        return 'Giảng viên';
      case UserRole.STUDENT:
        return 'Học viên';
      default:
        return role;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Đổi vai trò người dùng</DialogTitle>
          <DialogDescription>
            Thay đổi vai trò cho <strong>{user.fullName}</strong> ({user.email})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Vai trò hiện tại</Label>
            <div className="p-2 bg-muted rounded-md text-sm">
              {getRoleLabel(user.role as UserRole)}
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
            Hủy
          </Button>
          <Button onClick={handleUpdate} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang lưu...
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

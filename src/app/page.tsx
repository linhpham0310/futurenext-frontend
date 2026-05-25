// src/app/page.tsx
'use client';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { AuthUser, UserRole } from '@/types/auth.api'; //  Import đúng

export default function HomePage() {
  const { isAuthenticated, user, login, logout } = useAuth();

  const handleMockLogin = () => {
    //  Thêm email vào mock user
    const mockUser: AuthUser = {
      id: 'test-123',
      fullName: 'Mock User',
      email: 'mock@example.com', // ← THÊM DÒNG NÀY
      role: UserRole.STUDENT,
      avatarUrl: null, // Có thể thêm nếu cần
    };
    login('mock-access-token', mockUser);
  };

  const handleMockTeacherLogin = () => {
    //  Mock teacher user
    const mockTeacher: AuthUser = {
      id: 'teacher-456',
      fullName: 'Teacher User',
      email: 'teacher@example.com', // ← BẮT BUỘC
      role: UserRole.TEACHER,
      avatarUrl: null,
    };
    login('mock-teacher-token', mockTeacher);
  };

  const handleMockAdminLogin = () => {
    //  Mock admin user
    const mockAdmin: AuthUser = {
      id: 'admin-789',
      fullName: 'Admin User',
      email: 'admin@example.com', // ← BẮT BUỘC
      role: UserRole.ADMIN,
      avatarUrl: null,
    };
    login('mock-admin-token', mockAdmin);
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Home Page</h1>

      {!isAuthenticated ? (
        <div className="space-x-4">
          <Button onClick={handleMockLogin}>Mock Login as Student</Button>
          <Button onClick={handleMockTeacherLogin}>Mock Login as Teacher</Button>
          <Button onClick={handleMockAdminLogin}>Mock Login as Admin</Button>
        </div>
      ) : (
        <div>
          <p>Welcome, {user?.fullName}!</p>
          <p>Role: {user?.role}</p>
          <p>Email: {user?.email}</p>
          <Button onClick={logout}>Logout</Button>
        </div>
      )}
    </div>
  );
}

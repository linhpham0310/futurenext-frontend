// src/app/page.tsx (Ví dụ test - Xóa/Sửa sau)
'use client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { AuthUser, UserRole } from '@/types';

export default function HomePage() {
  const { isAuthenticated, user, accessToken, login, logout, setUser } = useAuth();

  const handleMockLogin = () => {
    const mockUser: AuthUser = { id: 'test-123', fullName: 'Mock User', role: UserRole.STUDENT };
    login('mock-access-token', mockUser);
  };

  const handleUpdateName = () => {
    if (user) {
      setUser({ ...user, fullName: 'Updated Mock Name' });
    }
  };

  return (
    <div className="p-10">
      <h1 className="text-xl font-bold mb-4">Auth State Test</h1>
      <p>Is Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
      <p>User: {user ? JSON.stringify(user) : 'null'}</p>
      <p>Access Token: {accessToken ? '********' : 'null'}</p>
      <div className="mt-4 space-x-2">
        <Button onClick={handleMockLogin} disabled={isAuthenticated}>
          Mock Login
        </Button>
        <Button onClick={handleUpdateName} disabled={!isAuthenticated}>
          Update Name
        </Button>
        <Button onClick={logout} disabled={!isAuthenticated} variant="destructive">
          Logout
        </Button>
      </div>
    </div>
  );
}

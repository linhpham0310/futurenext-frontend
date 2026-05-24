// src/types/index.ts

// Dựa trên response của API /auth/login và /users/me/profile
// Có thể import UserRole từ entity backend nếu muốn đồng bộ
export enum UserRole {
  STUDENT = 'student',
  TEACHER = 'teacher',
  ADMIN = 'admin',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  avatar?: string;
}

export interface AuthUser {
  id: string;
  fullName: string;
  email?: string; // Email có thể có hoặc không tùy context
  role: UserRole;
  avatarUrl?: string | null;
  // Thêm các trường cần thiết khác lấy từ API profile
  createdAt?: string; // Dạng ISO string
  updatedAt?: string; // Dạng ISO string
  teacherProfile?: {
    id: string;
    bio: string;
    expertise: string[];
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
  };
}

// Thêm các types khác nếu cần

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  instructorId: string;
  students: number;
  rating: number;
  price: string;
  thumbnail?: string;
  tags: string[];
  duration: string;
  lessons: Lesson[];
  assignments: Assignment[];
  isEnrolled?: boolean;
  progress?: number;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  videoUrl?: string;
  content: string;
  duration: number;
  isCompleted: boolean;
  order: number;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  type: 'quiz' | 'coding' | 'essay';
  questions?: Question[];
  dueDate: string;
  maxScore: number;
  isSubmitted: boolean;
  score?: number;
}

export interface Question {
  id: string;
  question: string;
  type: 'multiple-choice' | 'coding' | 'essay';
  options?: string[];
  correctAnswer?: string;
  points: number;
}

export interface NavigationProps {
  onNavigate: (page: string, courseId?: string) => void;
}

export interface UserAuthProps {
  user: User | null;
  onLogin: (user: User) => void;
  onLogout: () => void;
}

export type PageName =
  | 'landing'
  | 'student-dashboard'
  | 'instructor-dashboard'
  | 'admin-dashboard'
  | 'learning'
  | 'course-detail'
  | 'course-listing'
  | 'course-catalog'
  | 'user-profile'
  | 'instructor-profile'
  | 'checkout'
  | 'messages'
  | 'my-courses'
  | 'instructors'
  | 'component-showcase'
  | 'my-reviews'
  | 'shopping-cart'
  | 'order-complete';

export interface AppState {
  user: User | null;
  currentPage: PageName;
  selectedCourse: string | null;
  showAIAssistant: boolean;
}

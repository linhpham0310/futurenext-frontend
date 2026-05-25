// src/types/index.ts

// Import auth types nếu cần dùng lại
import type { User } from './auth.api';
export * from './auth.api';

// ========== Course Types ==========
export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  instructor: {
    id: string;
    name: string;
    avatar: string;
  };
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  price: number;
  originalPrice?: number;
  rating: number;
  totalRatings: number;
  totalStudents: number;
  duration: string;
  lessons: number;
  lastUpdated: string;
  tags: string[];
  bestseller?: boolean;
  featured?: boolean;
  instructorId: string;
  students: number;
  assignments: Assignment[];
  isEnrolled?: boolean;
  progress?: number;
}

export interface CourseFilters {
  search: string;
  category: string;
  level: string;
  priceRange: string;
  rating: string;
}

// ========== Learning Types ==========
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

// ========== UI/Navigation Types ==========
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
  user: import('./auth.api').User | null;
  currentPage: PageName;
  selectedCourse: string | null;
  showAIAssistant: boolean;
}

export interface NavigationProps {
  onNavigate: (page: string, courseId?: string) => void;
}

export interface UserAuthProps {
  user: import('./auth.api').User | null;
  onLogin: (user: import('./auth.api').User) => void;
  onLogout: () => void;
}

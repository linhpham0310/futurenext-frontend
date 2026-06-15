// src/types/index.ts

// Import auth types nếu cần dùng lại
import type { User } from './auth.api';
export * from './auth.api';

// ========== Course Types ==========
export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnailUrl: string | null;
  price: number;
  status: 'DRAFT' | 'SUBMITTED' | 'PUBLISHED' | 'REJECTED';
  instructorId: string;
  instructor?: {
    id: string;
    fullName: string;
    avatarUrl?: string | null;
  };
  outcomes?: string[];
  createdAt: string;
  updatedAt: string;
  students?: number; // tổng số học viên đã mua
  progress?: number; // tiến độ của học viên (0-100)
  isEnrolled?: boolean; // học viên hiện tại đã ghi danh chưa
  sections?: Section[]; // nếu include
}

export interface Section {
  id: string;
  title: string;
  orderIndex: number;
  courseId: string;
  lessons?: Lesson[];
  createdAt: string;
  updatedAt: string;
}

export interface Lesson {
  id: string;
  title: string;
  slug: string;
  type: 'VIDEO' | 'ARTICLE' | 'QUIZ' | 'LAB';
  content?: string; // nội dung hoặc URL video
  duration?: number; // phút
  isFreePreview: boolean;
  orderIndex: number;
  sectionId: string;
  courseId?: string;
  aiMetadata?: any;
  createdAt: string;
  updatedAt: string;
  userProgress?: {
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
    lastPosition: number;
    score?: number;
  };
}

// ========== Learning Types  ==========
export type LessonProgressStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export interface LessonProgress {
  lessonId: string;
  status: LessonProgressStatus;
  lastPosition: number;
  score?: number;
  metadata?: Record<string, any>;
  completedAt?: string;
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

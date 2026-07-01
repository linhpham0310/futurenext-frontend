// src/types/auth.api.ts

// ========== User Entity từ BE ==========
export interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  avatarUrl?: string | null;
  phone?: string | null;
  status: 'pending_email_verify' | 'active' | 'locked' | 'deleted';
  locale: string;
  timezone: string;
  lastLoginAt?: string;
  lockedUntil?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ========== Auth Request Types ==========
export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  confirmPassword?: string;
  agreeTerms: boolean;
  role: 'student' | 'teacher';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface VerifyEmailRequest {
  email: string;
  otp: string;
}

export interface ResendOtpRequest {
  email: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  avatarUrl?: string | null;
  phone?: string | null; // Optimistic lock
}

// ========== Auth Response Types ==========
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    role: 'student' | 'teacher' | 'admin';
  };
}

export interface RefreshTokenResponse {
  accessToken: string;
}

export interface RegisterResponse {
  message: string;
}

export interface VerifyEmailResponse {
  message: string;
}

export interface LogoutResponse {
  message: string;
}

export type ProfileResponse = User;

// ========== Error Type ==========
export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

// ========== Frontend Helper Types ==========
// src/types/auth.api.ts
export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  avatarUrl?: string | null;
  phone?: string | null;
  updatedAt?: string;
  teacherProfile?: {
    id: string;
    bio: string;
    expertise: string[];
    status: 'pending_review' | 'approved' | 'rejected';
  };
}

// ========== Enums nếu cần ==========
export enum UserRole {
  STUDENT = 'student',
  TEACHER = 'teacher',
  ADMIN = 'admin',
}

export enum UserStatus {
  PENDING_EMAIL_VERIFY = 'pending_email_verify',
  ACTIVE = 'active',
  LOCKED = 'locked',
  DELETED = 'deleted',
}

export type TeacherProfileStatus = 'pending_review' | 'approved' | 'rejected';

export interface TeacherProfile {
  id: string;
  userId: string;
  bio: string;
  expertise?: string[];
  status: TeacherProfileStatus;
  rejectionReason?: string;
  reviewedByUserId?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

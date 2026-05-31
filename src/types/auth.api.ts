// src/types/auth.api.ts

// ========== User Entity từ BE ==========
export interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  avatarUrl?: string | null;
  status: 'PENDING_EMAIL_VERIFY' | 'ACTIVE' | 'LOCKED';
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
  agreeTerms: boolean;
  role: 'student' | 'teacher';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface VerifyEmailRequest {
  otp: string;
}

export interface ResendOtpRequest {
  email: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  avatarUrl?: string | null;
  updatedAt: string; // Optimistic lock
}

// ========== Auth Response Types ==========
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: Omit<
    User,
    'status' | 'locale' | 'timezone' | 'lastLoginAt' | 'lockedUntil' | 'createdAt' | 'updatedAt'
  >;
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
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  avatarUrl?: string | null;
  updatedAt?: string;
  teacherProfile?: {
    id: string;
    bio: string;
    expertise: string[];
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
  };
}

// ========== Enums nếu cần ==========
export enum UserRole {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  ADMIN = 'ADMIN',
}

export enum UserStatus {
  PENDING_EMAIL_VERIFY = 'PENDING_EMAIL_VERIFY',
  ACTIVE = 'ACTIVE',
  LOCKED = 'LOCKED',
}

export type TeacherProfileStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

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

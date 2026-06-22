// src/lib/api.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { AuthUser, RegisterRequest, RegisterResponse } from '@/types/auth.api';
import { LoginFormData, VerifyEmailFormData, ResetPasswordFormData } from './schemas/auth.schema';
import { useAuthStore } from '@/store/authStore';
import { UpdateProfileFormData } from './schemas/user.schema';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL is not defined');
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  timeout: 10000,
});

interface LoginSuccessResponse {
  accessToken: string;
  user: AuthUser;
}

interface ErrorResponse {
  message?: string;
  error?: string;
  statusCode?: number;
}

interface QueueItem {
  resolve: (value: unknown) => void;
  reject: (reason?: Error | AxiosError) => void;
}

const getAccessToken = (): string | null => {
  const storeToken = useAuthStore.getState().accessToken;
  if (storeToken) return storeToken;
  return localStorage.getItem('accessToken');
};

const setAccessToken = (token: string) => {
  useAuthStore.getState().setAccessToken(token);
  localStorage.setItem('accessToken', token);
};

const clearAccessToken = () => {
  useAuthStore.getState().clearAuth();
  localStorage.removeItem('accessToken');
};

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = getAccessToken();
    const publicRoutes = [
      '/auth/login',
      '/auth/register',
      '/auth/forgot-password',
      '/auth/reset-password',
      '/auth/verify-email',
      '/auth/refresh',
    ];
    const isPublic = publicRoutes.some((route) => config.url?.startsWith(route));
    if (accessToken && !isPublic && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;
    const url = originalRequest.url;

    if (status === 401 && url !== '/auth/refresh' && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            if (originalRequest.headers) {
              originalRequest.headers['Authorization'] = 'Bearer ' + newToken;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await authApi.refreshToken();
        const newAccessToken = refreshResponse.accessToken;
        setAccessToken(newAccessToken);

        if (originalRequest.headers) {
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        }
        processQueue(null, newAccessToken);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError, null);
        clearAccessToken();
        if (typeof window !== 'undefined') {
          window.location.href = '/sign-in';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const responseData = error.response?.data as ErrorResponse | undefined;
    const simplifiedError = responseData
      ? {
          statusCode: error.response?.status,
          message: responseData.message || `Lỗi ${error.response?.status}`,
          error: responseData.error || 'Error',
        }
      : { message: error.message || 'Lỗi không xác định.' };
    return Promise.reject(simplifiedError);
  }
);

// ==================== AUTH API ====================
export const authApi = {
  register: (data: RegisterRequest) => apiClient.post<RegisterResponse>('/auth/register', data),
  verifyEmail: (data: VerifyEmailFormData) =>
    apiClient.post<{ message: string }>('/auth/verify-email', data),
  // Backend không có endpoint resend-otp, có thể bỏ hoặc giữ để sau
  resendOtp: (data: { email: string }) =>
    apiClient.post<{ message: string }>('/auth/resend-otp', data),
  login: async (data: LoginFormData): Promise<LoginSuccessResponse> => {
    const response = await apiClient.post<LoginSuccessResponse>('/auth/login', data);
    if (response.data.accessToken) setAccessToken(response.data.accessToken);
    return response.data;
  },

  logout: async (): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/logout');
    clearAccessToken();
    return response.data;
  },
  refreshToken: async (): Promise<{ accessToken: string }> => {
    const response = await apiClient.post<{ accessToken: string }>(
      '/auth/refresh',
      {},
      { withCredentials: true }
    );
    return response.data;
  },
  forgotPassword: (data: { email: string }) => apiClient.post('/auth/forgot-password', data),
  resetPassword: (data: ResetPasswordFormData) => apiClient.post('/auth/reset-password', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiClient.patch('/auth/change-password', data),
};

// ==================== USERS API ====================
export const usersApi = {
  getProfile: () => apiClient.get<AuthUser>('/users/me/profile'),
  updateProfile: (data: UpdateProfileFormData) =>
    apiClient.put<AuthUser>('/users/me/profile', data),
  getMyCourses: () => apiClient.get('/courses/my-courses'),
};

// ==================== TEACHER PROFILES API ====================
export const teacherProfilesApi = {
  submit: (data: { bio: string; expertise: string[] }) =>
    apiClient.post('/teacher-profiles/submit', data),
  update: (data: Partial<{ bio: string; expertise: string[] }>) =>
    apiClient.put('/teacher-profiles/update', data),
  getMyProfile: () => apiClient.get('/teacher-profiles/my-profile'),
};

// ==================== COURSE API ====================
export const courseApi = {
  getPublicCourses: (params?: { page?: number; limit?: number; search?: string; level?: string }) =>
    apiClient.get('/courses/public', { params }),
  getPublicCourseDetail: (id: string) => apiClient.get(`/courses/public/${id}`),
  getMyCourses: () => apiClient.get('/courses/my-courses'),
  getCourse: (id: string) => apiClient.get(`/courses/${id}`),
  createDraft: (data: any) => apiClient.post('/courses/draft', data),
  updateCourse: (id: string, data: any) => apiClient.patch(`/courses/${id}`, data),
  getUploadUrl: async (courseId: string, fileName: string, fileType: string) => {
    const response = await apiClient.get(`/courses/${courseId}/upload-url`, {
      params: { fileName, fileType },
    });
    return response.data;
  },
  processReview: (courseId: string, action: string, reason?: string) =>
    apiClient.patch(`/courses/${courseId}/review`, { action, reason }),
  getAdminDetail: (courseId: string) => apiClient.get(`/courses/${courseId}/admin-detail`),
};

// ==================== ADMIN API ====================
export const adminApi = {
  getDashboardStats: () => apiClient.get('/dashboard/admin/stats'),
  getRecentActivities: (limit?: number) =>
    apiClient.get('/dashboard/admin/activities/recent', { params: { limit } }),
  getUsers: (params?: {
    page?: number;
    limit?: number;
    q?: string;
    role?: string;
    status?: string;
  }) => apiClient.get('/admin/users', { params }),
  getUserById: (id: string) => apiClient.get(`/admin/users/${id}`),
  updateUser: (id: string, data: { role?: string; status?: string }) =>
    apiClient.patch(`/admin/users/${id}`, data),
  updateUserFull: (
    id: string,
    data: { fullName: string; email: string; phone?: string; role: string; status: string }
  ) => apiClient.put(`/admin/users/${id}`, data),
  deleteUser: (id: string) => apiClient.delete(`/admin/users/${id}`),
  getStudents: (params?: { page?: number; limit?: number; q?: string; status?: string }) =>
    apiClient.get('/admin/users/students', { params }),
  getStudentById: (id: string) => apiClient.get(`/admin/users/students/${id}`),
  updateStudentStatus: (id: string, status: 'active' | 'locked') =>
    apiClient.patch(`/admin/users/students/${id}/status`, { status }),
  updateStudent: (
    id: string,
    data: { fullName: string; email: string; phone?: string; status: string }
  ) => apiClient.put(`/admin/users/students/${id}`, data),
  deleteStudent: (id: string) => apiClient.delete(`/admin/users/students/${id}`),
  getTeacherProfiles: (params?: { status?: string; page?: number; limit?: number; q?: string }) =>
    apiClient.get('/admin/teacher-profiles', { params }),
  approveTeacherProfile: (id: string) => apiClient.patch(`/admin/teacher-profiles/${id}/approve`),
  rejectTeacherProfile: (id: string, reason?: string) =>
    apiClient.patch(`/admin/teacher-profiles/${id}/reject`, { reason }),
  deleteTeacherProfile: (id: string) => apiClient.delete(`/admin/teacher-profiles/${id}`),
  getCourses: (params?: { page?: number; limit?: number; q?: string; status?: string }) =>
    apiClient.get('/admin/courses', { params }),
  getCourseDetail: (id: string) => apiClient.get(`/admin/courses/${id}`),
  approveCourse: (id: string) => apiClient.patch(`/admin/courses/${id}/approve`),
  rejectCourse: (id: string, reason: string) =>
    apiClient.patch(`/admin/courses/${id}/reject`, { reason }),
  updateCourse: (
    id: string,
    data: { title?: string; description?: string; price?: number; status?: string }
  ) => apiClient.put(`/admin/courses/${id}`, data),
  deleteCourse: (id: string) => apiClient.delete(`/admin/courses/${id}`),
  getRevenueStats: () => apiClient.get('/revenue/admin/stats'),
  getTransactions: (limit?: number) =>
    apiClient.get('/revenue/admin/transactions', { params: { limit } }),
};

// ==================== TEACHER API ====================
export const teacherApi = {
  getDashboardStats: () => apiClient.get('/teacher/courses/dashboard/stats'),
  getMyCourses: (params?: { status?: string; page?: number; limit?: number }) =>
    apiClient.get('/teacher/courses', { params }),
  createCourse: (data: {
    title: string;
    description?: string;
    price?: number;
    thumbnailUrl?: string;
  }) => apiClient.post('/teacher/courses', data),
  getCourseDetail: (id: string) => apiClient.get(`/teacher/courses/${id}`),
  updateCourse: (
    id: string,
    data: { title?: string; description?: string; price?: number; thumbnailUrl?: string }
  ) => apiClient.put(`/teacher/courses/${id}`, data),
  deleteCourse: (id: string) => apiClient.delete(`/teacher/courses/${id}`),
  submitCourse: (courseId: string) => apiClient.patch(`/teacher/courses/${courseId}/submit`),
  getCourseBuilder: (id: string) => apiClient.get(`/teacher/courses/${id}/builder`),
  addSection: (courseId: string, data: { title: string }) =>
    apiClient.post(`/teacher/courses/${courseId}/sections`, data),
  updateSection: (courseId: string, sectionId: string, data: { title: string }) =>
    apiClient.patch(`/teacher/courses/${courseId}/sections/${sectionId}`, data),
  deleteSection: (courseId: string, sectionId: string) =>
    apiClient.delete(`/teacher/courses/${courseId}/sections/${sectionId}`),
  reorderSections: (courseId: string, orders: { id: string; orderIndex: number }[]) =>
    apiClient.patch(`/teacher/courses/${courseId}/sections/reorder`, { orders }),
  addLesson: (
    courseId: string,
    sectionId: string,
    data: {
      title: string;
      type: string;
      content?: string;
      duration?: number;
      isFreePreview?: boolean;
    }
  ) => apiClient.post(`/teacher/courses/${courseId}/sections/${sectionId}/lessons`, data),
  getLesson: (courseId: string, lessonId: string) =>
    apiClient.get(`/teacher/courses/${courseId}/lessons/${lessonId}`),
  updateLesson: (courseId: string, lessonId: string, data: any) =>
    apiClient.patch(`/teacher/courses/${courseId}/lessons/${lessonId}`, data),
  deleteLesson: (courseId: string, lessonId: string) =>
    apiClient.delete(`/teacher/courses/${courseId}/lessons/${lessonId}`),
  updateLessonContent: (
    courseId: string,
    lessonId: string,
    data: { content: string; duration?: number }
  ) => apiClient.patch(`/teacher/courses/${courseId}/lessons/${lessonId}`, data),
  updateOutcomes: (courseId: string, outcomes: string[]) =>
    apiClient.patch(`/teacher/courses/${courseId}/outcomes`, { outcomes }),
  getStudents: (params?: { q?: string; courseId?: string; page?: number; limit?: number }) =>
    apiClient.get('/teacher/courses/students', { params }),
  getCourseStudents: (courseId: string) => apiClient.get(`/teacher/courses/${courseId}/students`),
  getRevenueStats: () => apiClient.get('/revenue/teacher/stats'),
  getTransactions: (limit?: number) =>
    apiClient.get('/revenue/teacher/transactions', { params: { limit } }),
  getProfile: () => apiClient.get('/teacher-profiles/my-profile'),
  updateProfile: (data: { fullName: string; phone?: string; bio?: string; expertise?: string[] }) =>
    apiClient.put('/teacher-profiles/update', data),
  getPaymentSettings: () => apiClient.get('/teacher/payment'),
  updatePaymentSettings: (data: { bankAccount: string; bankName: string; accountHolder: string }) =>
    apiClient.put('/teacher/payment', data),
  getExams: (params?: { status?: string; page?: number; limit?: number }) =>
    apiClient.get('/teacher/exams', { params }),
  generateQuiz: (data: { topic: string; type: string; duration: number; numQuestions: number }) =>
    apiClient.post('/teacher/exams/generate', data),
  createExam: (data: any) => apiClient.post('/teacher/exams', data),
  getExam: (id: string) => apiClient.get(`/teacher/exams/${id}`),
  updateExam: (id: string, data: any) => apiClient.put(`/teacher/exams/${id}`, data),
  deleteExam: (id: string) => apiClient.delete(`/teacher/exams/${id}`),
  publishExam: (id: string, data: { courseId: string }) =>
    apiClient.post(`/teacher/exams/${id}/publish`, data),
  getExamResults: (id: string) => apiClient.get(`/teacher/exams/${id}/results`),
  getAnnouncements: () => apiClient.get('/teacher/announcements'),
  createAnnouncement: (data: { courseId: string; title: string; content: string }) =>
    apiClient.post('/teacher/announcements', data),
  getCertificates: () => apiClient.get('/teacher/certificates'),
  exportRevenueReport: () => apiClient.get('/reports/revenue/export', { responseType: 'blob' }),
  exportStudentsReport: () => apiClient.get('/reports/students/export', { responseType: 'blob' }),
};

// ==================== STUDENT API ====================
export const studentApi = {
  getStudentStats: () => apiClient.get('/dashboard/student/stats'),
  getStudentRecentCourses: (params?: { limit?: number }) =>
    apiClient.get('/dashboard/student/recent-courses', { params }),
  getMyCourses: () => apiClient.get('/courses/my-enrolled'),
  getPublicCourses: (params?: { search?: string; page?: number; limit?: number }) =>
    apiClient.get('/courses', { params }),
  getPublicCourseDetail: (id: string) => apiClient.get(`/courses/public/${id}`),
  enrollCourse: (id: string) => apiClient.post(`/courses/${id}/enroll`),
  getProfile: () => apiClient.get('/student/profile'),
  updateProfile: (data: { fullName?: string; phone?: string; avatarUrl?: string }) =>
    apiClient.put('/student/profile', data),
  getFavorites: () => apiClient.get('/student/favorites'),
  removeFavorite: (courseId: string) => apiClient.delete(`/student/favorites/${courseId}`),
  getReviews: () => apiClient.get('/student/reviews'),
  createReview: (data: { courseId: string; rating: number; comment?: string }) =>
    apiClient.post('/student/reviews', data),
  deleteReview: (reviewId: string) => apiClient.delete(`/student/reviews/${reviewId}`),
  getAssignedExams: () => apiClient.get('/student/exams'),
  getExamInfo: (id: string) => apiClient.get(`/student/exams/${id}`),
  takeExam: (id: string) => apiClient.get(`/student/exams/${id}/take`),
  submitExam: (id: string, answers: Record<string, string>) =>
    apiClient.post(`/student/exams/${id}/submit`, { answers }),
  getExamResult: (id: string) => apiClient.get(`/student/exams/${id}/result`),
  getRuntimeOverview: (courseId: string) => apiClient.get(`/lx/runtime/${courseId}`),
  getLessonContent: (lessonId: string) => apiClient.get(`/lx/lesson/${lessonId}`),
  updateLessonProgress: (lessonId: string, data: { status: string; lastPosition?: number }) =>
    apiClient.patch(`/lx/lessons/${lessonId}/progress`, data),
  askAi: (data: { lessonId?: string; question: string }) => apiClient.post('/lx/ai/ask', data),
  getNotifications: (limit?: number) => apiClient.get('/notifications', { params: { limit } }),
  markNotificationRead: (id: string) => apiClient.patch(`/notifications/${id}/read`),
  search: (q: string) => apiClient.get('/search/courses', { params: { q } }),
};

// ==================== COMMON API ====================
export const commonApi = {
  getNotifications: (params?: { limit?: number }) => apiClient.get('/notifications', { params }),
  getUnreadCount: () => apiClient.get('/notifications/unread-count'),
  markNotificationRead: (id: string) => apiClient.patch(`/notifications/${id}/read`),
  markAllNotificationsRead: () => apiClient.patch('/notifications/mark-all-read'),
  search: (q: string) => apiClient.get('/search/courses', { params: { q } }),
};

// ==================== LX API ====================
export const lxApi = {
  testAiLog: (data: {
    lessonId: string;
    interactionType: string;
    prompt: string;
    response: string;
  }) => apiClient.post('/lx/ai/test-log', data),
};

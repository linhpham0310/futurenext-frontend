// src/lib/api.ts (Phiên bản hoàn chỉnh)
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { AuthUser, RegisterRequest, RegisterResponse } from '@/types/auth.api';
import { LoginFormData, VerifyEmailFormData } from './schemas/auth.schema';
import { useAuthStore } from '@/store/authStore';
import { UpdateProfileFormData } from './schemas/user.schema';
import { Course } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, //  Giữ lại - quan trọng cho refresh token cookie
  timeout: 10000,
});

// Types
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

//  Thêm function lấy token từ localStorage
const getAccessToken = (): string | null => {
  // Ưu tiên lấy từ Zustand store trước
  const storeToken = useAuthStore.getState().accessToken;
  if (storeToken) return storeToken;

  // Fallback sang localStorage
  return localStorage.getItem('accessToken');
};

//  Thêm function lưu token (sync cả Zustand và localStorage)
const setAccessToken = (token: string) => {
  useAuthStore.getState().setAccessToken(token);
};

// --- Axios Request Interceptor ---
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    //  Dùng function mới
    const accessToken = getAccessToken();

    const publicRoutes = [
      '/auth/login',
      '/auth/register',
      '/auth/forgot-password',
      '/auth/reset-password',
      '/auth/verify-email',
    ];
    const isRefreshRequest = config.url === '/auth/refresh';

    if (
      accessToken &&
      config.headers &&
      !publicRoutes.includes(config.url || '') &&
      !isRefreshRequest
    ) {
      config.headers.Authorization = `Bearer ${accessToken}`;
      console.debug('[API Request] Added Authorization header.');
    }
    return config;
  },
  (error) => {
    console.error('[API Request Error Interceptor]', error);
    return Promise.reject(error);
  }
);

// --- Axios Response Interceptor ---
let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;
    const url = originalRequest.url;

    console.debug(`[API Response Error] Status: ${status}, URL: ${url}`);

    if (status === 401 && url !== '/auth/refresh' && !originalRequest._retry) {
      if (isRefreshing) {
        console.debug('Token refresh in progress, queueing request:', originalRequest.url);
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
      console.log('Access token expired or invalid. Attempting refresh...');

      try {
        const refreshResponse = await authApi.refreshToken();
        const newAccessToken = refreshResponse.accessToken;
        console.log('Token refresh successful!');

        //  Dùng function mới để sync
        setAccessToken(newAccessToken);

        if (originalRequest.headers) {
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        }

        processQueue(null, newAccessToken);
        return apiClient(originalRequest);
      } catch (refreshError: unknown) {
        console.error('Token refresh failed:', refreshError);
        processQueue(refreshError as AxiosError, null);

        //  Clear cả Zustand và localStorage
        useAuthStore.getState().clearAuth();
        localStorage.removeItem('accessToken');

        console.error('User logged out due to refresh failure.');

        //  Chuyển hướng về login
        if (typeof window !== 'undefined') {
          window.location.href = '/sign-in';
        }

        return Promise.reject(refreshError || error);
      } finally {
        isRefreshing = false;
      }
    }

    const responseData = error.response?.data as ErrorResponse | undefined;
    const simplifiedError = error.response?.data
      ? {
          statusCode: error.response.status,
          message: responseData?.message || `Lỗi ${error.response.status}`,
          error: responseData?.error || 'Error',
        }
      : {
          message: error.message || 'Lỗi không xác định.',
        };
    return Promise.reject(simplifiedError);
  }
);

// --- Auth API Calls ---
export const authApi = {
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  verifyEmail: async (data: VerifyEmailFormData): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/verify-email', data);
    return response.data;
  },

  resendOtp: async (data: { email: string }): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/resend-otp', data);
    return response.data;
  },

  login: async (data: LoginFormData): Promise<LoginSuccessResponse> => {
    const response = await apiClient.post<LoginSuccessResponse>('/auth/login', data);
    //  Lưu token sau khi login thành công
    if (response.data.accessToken) {
      setAccessToken(response.data.accessToken);
    }
    return response.data;
  },

  logout: async (): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/logout');
    //  Clear token khi logout
    localStorage.removeItem('accessToken');
    useAuthStore.getState().clearAuth();
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

  // [SPRINT 2 - RESET PASSWORD]
  resetPassword: async (data: { email: string; otp: string; newPassword: string }) => {
    const response = await apiClient.post('/auth/reset-password', data);
    return response.data;
  },
};

// --- Users API ---
export const usersApi = {
  getProfile: async (): Promise<AuthUser> => {
    const response = await apiClient.get<AuthUser>('/users/me/profile');
    return response.data;
  },

  updateProfile: async (data: UpdateProfileFormData): Promise<AuthUser> => {
    const response = await apiClient.put<AuthUser>('/users/me/profile', data);
    return response.data;
  },
  getMyCourses: async (): Promise<Course[]> => {
    const response = await apiClient.get<Course[]>('/courses/me');
    return response.data;
  },
};

// Thêm API cho teacher profiles
export const teacherProfilesApi = {
  submit: async (data: { bio: string; expertise: string[] }) => {
    const response = await apiClient.post('/teacher-profiles/submit', data);
    return response.data;
  },
  update: async (data: Partial<{ bio: string; expertise: string[] }>) => {
    const response = await apiClient.put('/teacher-profiles/update', data);
    return response.data;
  },
  getMyProfile: async () => {
    const response = await apiClient.get('/teacher-profiles/my-profile');
    return response.data;
  },
};

export const courseApi = {
  getPublicCourses: (params?: { page?: number; limit?: number; search?: string; level?: string }) =>
    apiClient.get('/courses', { params }),

  getPublicCourseDetail: (id: string) => apiClient.get(`/courses/${id}`),

  getMyCourses: () => apiClient.get('/courses/my-courses'),

  getCourse: (id: string) => apiClient.get(`/courses/${id}`),

  createDraft: (data: any) => apiClient.post('/courses/draft', data),

  // src/lib/api.ts (thêm vào cuối file, trong courseApi)

  updateCourse: (id: string, data: any) => apiClient.patch(`/courses/${id}`, data),
  deleteCourse: (id: string) => apiClient.delete(`/courses/${id}`),

  // Sections
  addSection: (courseId: string, data: any) =>
    apiClient.post(`/courses/${courseId}/sections`, data),
  updateSection: (sectionId: string, data: any) => apiClient.patch(`/sections/${sectionId}`, data),
  deleteSection: (sectionId: string) => apiClient.delete(`/sections/${sectionId}`),
  reorderSections: (courseId: string, orders: any[]) =>
    apiClient.patch(`/courses/${courseId}/sections/reorder`, { orders }),

  // Lessons
  addLesson: (sectionId: string, data: any) =>
    apiClient.post(`/sections/${sectionId}/lessons`, data),
  updateLesson: (lessonId: string, data: any) => apiClient.patch(`/lessons/${lessonId}`, data),
  deleteLesson: (lessonId: string) => apiClient.delete(`/lessons/${lessonId}`),
  updateLessonContent: (courseId: string, lessonId: string, data: any) =>
    apiClient.patch(`/courses/${courseId}/lessons/${lessonId}`, data),
  updateLessonMetadata: (courseId: string, lessonId: string, data: any) =>
    apiClient.patch(`/courses/${courseId}/lessons/${lessonId}/metadata`, data),

  // Upload
  getUploadUrl: (courseId: string, fileName: string, fileType: string) =>
    apiClient.get(`/courses/${courseId}/upload-url`, { params: { fileName, fileType } }),

  // Outcomes
  updateOutcomes: (courseId: string, outcomes: string[]) =>
    apiClient.patch(`/courses/${courseId}/outcomes`, { outcomes }),

  // Submit & Review
  submitCourse: (courseId: string) => apiClient.post(`/courses/${courseId}/submit`),
  processReview: (courseId: string, action: string, reason?: string) =>
    apiClient.patch(`/courses/${courseId}/review`, { action, reason }),
  getAdminDetail: (courseId: string) => apiClient.get(`/courses/${courseId}/admin-detail`),
};

export const lxApi = {
  testAiLog: (data: {
    lessonId: string;
    interactionType: string;
    prompt: string;
    response: string;
  }) => apiClient.post('/lx/ai/test-log', data),
};
// ==================== BỔ SUNG API CHO CÁC MODULE CÒN THIẾU ====================

// ---------- 1. Common API (dùng cho cả 3 role) ----------
export const commonApi = {
  // Đổi mật khẩu (dùng chung)
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiClient.patch('/auth/change-password', data),

  // Thông báo (notifications)
  getNotifications: (params?: { limit?: number }) => apiClient.get('/notifications', { params }),
  getUnreadCount: () => apiClient.get('/notifications/unread-count'),
  markNotificationRead: (id: string) => apiClient.patch(`/notifications/${id}/read`),
  markAllNotificationsRead: () => apiClient.patch('/notifications/mark-all-read'),

  // Tìm kiếm toàn cục
  search: (q: string) => apiClient.get('/search', { params: { q } }),
};

// ---------- 2. Admin API ----------
export const adminApi = {
  // Dashboard
  getDashboardStats: () => apiClient.get('/admin/dashboard/stats'),
  getRecentActivities: (limit?: number) =>
    apiClient.get('/admin/activities/recent', { params: { limit } }),

  // Quản lý người dùng (users)
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

  // Quản lý học viên (students)
  getStudents: (params?: { page?: number; limit?: number; q?: string; status?: string }) =>
    apiClient.get('/admin/students', { params }),
  getStudentById: (id: string) => apiClient.get(`/admin/students/${id}`),
  updateStudentStatus: (id: string, status: 'ACTIVE' | 'LOCKED') =>
    apiClient.patch(`/admin/students/${id}/status`, { status }),
  updateStudent: (
    id: string,
    data: { fullName: string; email: string; phone?: string; status: string }
  ) => apiClient.put(`/admin/students/${id}`, data),
  deleteStudent: (id: string) => apiClient.delete(`/admin/students/${id}`),

  // Quản lý hồ sơ giáo viên
  getTeacherProfiles: (params?: { status?: string; page?: number; limit?: number }) =>
    apiClient.get('/admin/teacher-profiles', { params }),
  approveTeacherProfile: (id: string) => apiClient.patch(`/admin/teacher-profiles/${id}/approve`),
  rejectTeacherProfile: (id: string, reason?: string) =>
    apiClient.patch(`/admin/teacher-profiles/${id}/reject`, { reason }),
  deleteTeacherProfile: (id: string) => apiClient.delete(`/admin/teacher-profiles/${id}`),

  // Quản lý khóa học (admin view)
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

  // Doanh thu & giao dịch
  getRevenueStats: () => apiClient.get('/admin/revenue/stats'),
  getTransactions: (limit?: number) =>
    apiClient.get('/admin/revenue/transactions', { params: { limit } }),
};

// ---------- 3. Teacher API ----------
export const teacherApi = {
  // Dashboard
  getDashboardStats: () => apiClient.get('/teacher/dashboard/stats'),

  // Quản lý khóa học (giảng viên)
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
  submitCourse: (id: string) => apiClient.patch(`/teacher/courses/${id}/submit`),

  // Quản lý chương/bài học (builder)
  getCourseBuilder: (id: string) => apiClient.get(`/teacher/courses/${id}/builder`),
  addSection: (courseId: string, data: { title: string }) =>
    apiClient.post(`/teacher/courses/${courseId}/sections`, data),
  updateSection: (sectionId: string, data: { title: string }) =>
    apiClient.patch(`/teacher/courses/${courseId}/sections/${sectionId}`, data),
  deleteSection: (courseId: string, sectionId: string) =>
    apiClient.delete(`/teacher/courses/${courseId}/sections/${sectionId}`),
  reorderSections: (courseId: string, orders: { id: string; orderIndex: number }[]) =>
    apiClient.patch(`/teacher/courses/${courseId}/sections/reorder`, { orders }),
  addLesson: (
    sectionId: string,
    data: {
      title: string;
      type: string;
      content?: string;
      duration?: number;
      isFreePreview?: boolean;
    }
  ) => apiClient.post(`/teacher/sections/${sectionId}/lessons`, data),
  updateLesson: (courseId: string, lessonId: string, data: any) =>
    apiClient.patch(`/teacher/courses/${courseId}/lessons/${lessonId}`, data),
  deleteLesson: (courseId: string, lessonId: string) =>
    apiClient.delete(`/teacher/courses/${courseId}/lessons/${lessonId}`),
  updateLessonContent: (
    courseId: string,
    lessonId: string,
    data: { content: string; duration?: number }
  ) => apiClient.patch(`/teacher/courses/${courseId}/lessons/${lessonId}/content`, data),
  updateLessonMetadata: (courseId: string, lessonId: string, data: { keyConcepts: string[] }) =>
    apiClient.patch(`/teacher/courses/${courseId}/lessons/${lessonId}/metadata`, data),

  // Outcomes
  updateOutcomes: (courseId: string, outcomes: string[]) =>
    apiClient.patch(`/teacher/courses/${courseId}/outcomes`, { outcomes }),

  // Quản lý học viên (teacher)
  getStudents: (params?: { q?: string; courseId?: string; page?: number; limit?: number }) =>
    apiClient.get('/teacher/students', { params }),
  getCourseStudents: (courseId: string) => apiClient.get(`/teacher/courses/${courseId}/students`),

  // Doanh thu giảng viên
  getRevenueStats: () => apiClient.get('/teacher/revenue/stats'),
  getTransactions: (limit?: number) =>
    apiClient.get('/teacher/revenue/transactions', { params: { limit } }),

  // Hồ sơ giảng viên (profile)
  getProfile: () => apiClient.get('/teacher/profile'),
  updateProfile: (data: { fullName: string; phone?: string; bio?: string; expertise?: string }) =>
    apiClient.put('/teacher/profile', data),

  // Cài đặt thanh toán (payout)
  getPaymentSettings: () => apiClient.get('/teacher/payment-settings'),
  updatePaymentSettings: (data: { bankAccount: string; bankName: string; accountHolder: string }) =>
    apiClient.put('/teacher/payment-settings', data),

  // Quản lý đề thi (exams)
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

  // Thông báo (announcements)
  getAnnouncements: () => apiClient.get('/teacher/announcements'),
  createAnnouncement: (data: { courseId: string; title: string; content: string }) =>
    apiClient.post('/teacher/announcements', data),

  // Chứng chỉ đã cấp
  getCertificates: () => apiClient.get('/teacher/certificates'),

  // Báo cáo xuất Excel
  exportRevenueReport: () =>
    apiClient.get('/teacher/reports/revenue/export', { responseType: 'blob' }),
  exportStudentsReport: () =>
    apiClient.get('/teacher/reports/students/export', { responseType: 'blob' }),
};

// ---------- 4. Student API ----------
export const studentApi = {
  // Dashboard & Khóa học của tôi
  getMyCourses: () => apiClient.get('/student/courses/my'),
  getPublicCourses: (params?: { search?: string; page?: number; limit?: number }) =>
    apiClient.get('/student/courses', { params }),
  getPublicCourseDetail: (id: string) => apiClient.get(`/student/courses/${id}`),
  enrollCourse: (id: string) => apiClient.post(`/student/courses/${id}/enroll`),

  // Hồ sơ học viên
  getProfile: () => apiClient.get('/student/profile'),
  updateProfile: (data: { fullName?: string; phone?: string; avatarUrl?: string }) =>
    apiClient.put('/student/profile', data),

  // Yêu thích (favorites)
  getFavorites: () => apiClient.get('/student/favorites'),
  removeFavorite: (courseId: string) => apiClient.delete(`/student/favorites/${courseId}`),

  // Đánh giá (reviews)
  getReviews: () => apiClient.get('/student/reviews'),
  createReview: (data: { courseId: string; rating: number; comment?: string }) =>
    apiClient.post('/student/reviews', data),
  deleteReview: (reviewId: string) => apiClient.delete(`/student/reviews/${reviewId}`),

  // Bài thi (exams)
  getAssignedExams: () => apiClient.get('/student/exams'),
  getExamInfo: (id: string) => apiClient.get(`/student/exams/${id}`),
  takeExam: (id: string) => apiClient.get(`/student/exams/${id}/take`),
  submitExam: (id: string, answers: Record<string, string>) =>
    apiClient.post(`/student/exams/${id}/submit`, { answers }),
  getExamResult: (id: string) => apiClient.get(`/student/exams/${id}/result`),

  // Không gian học tập (LX)
  getRuntimeOverview: (courseId: string) => apiClient.get(`/student/lx/${courseId}/overview`),
  getLessonContent: (lessonId: string) => apiClient.get(`/student/lx/lessons/${lessonId}`),
  updateLessonProgress: (lessonId: string, data: { status: string; lastPosition?: number }) =>
    apiClient.patch(`/student/lessons/${lessonId}/progress`, data),
  askAi: (data: { lessonId?: string; question: string }) => apiClient.post('/student/ai/ask', data),

  // Thông báo (student)
  getNotifications: (limit?: number) =>
    apiClient.get('/student/notifications', { params: { limit } }),
  markNotificationRead: (id: string) => apiClient.patch(`/student/notifications/${id}/read`),

  // Tìm kiếm
  search: (q: string) => apiClient.get('/student/search', { params: { q } }),
};

// ==================== GIỮ NGUYÊN CÁC API CŨ ====================
// (authApi, usersApi, teacherProfilesApi, courseApi, lxApi vẫn giữ nguyên)
// Nếu có conflict (ví dụ courseApi.getMyCourses trùng với studentApi.getMyCourses) thì tuỳ nhu cầu frontend,
// nhưng khuyến nghị dùng studentApi cho student, teacherApi cho teacher, và courseApi giữ cho các endpoint chung cũ.
// Bạn có thể comment hoặc xoá bớt nếu muốn dùng hoàn toàn các object mới.

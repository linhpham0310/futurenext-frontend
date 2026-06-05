import { create } from 'zustand';
import axios from 'axios';
// Định nghĩa cấu trúc dữ liệu theo thiết kế LLD của module LX
export interface LXLesson {
  id: string;
  title: string;
  type: 'VIDEO' | 'ARTICLE' | 'QUIZ' | 'LAB';
  isFreePreview: boolean;
  orderIndex: number;
  content?: string; // Nội dung chi tiết (Markdown hoặc S3 URL)
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  lastPosition: number;
}
export interface LXSection {
  id: string;
  title: string;
  orderIndex: number;
  lessons: LXLesson[];
}
interface LXState {
  courseId: string | null;
  courseTitle: string;
  progressPercentage: number;
  sections: LXSection[];
  activeLesson: LXLesson | null;
  isLoadingStructure: boolean;
  isLoadingLesson: boolean;
  // ---------------------------------------------------------
  // TASK: LX-FE-1.2: Các Actions tương tác với API Backend
  // ---------------------------------------------------------
  fetchRuntimeOverview: (courseId: string) => Promise<void>;
  fetchLessonDetail: (lessonId: string) => Promise<void>;
  updateLessonProgressLocal: (
    lessonId: string,
    status: LXLesson['status'],
    lastPosition: number
  ) => void;
  resetLXStore: () => void;
  // ---------------------------------------------------------
  // TASK: LX-FE-1.5: Hàm tiện ích tìm bài học để tiếp tục học
  // ---------------------------------------------------------
  getLastActiveLesson: () => LXLesson | null;
}
export const useLXStore = create<LXState>((set, get) => ({
  courseId: null,
  courseTitle: '',
  progressPercentage: 0,
  sections: [],
  activeLesson: null,
  isLoadingStructure: false,
  isLoadingLesson: false,
  // Action 1: Lấy bản đồ lộ trình khóa học (Gọi API LX-BE-1.3)
  fetchRuntimeOverview: async (courseId: string) => {
    try {
      set({ isLoadingStructure: true });
      const { data } = await axios.get(`/lx/runtime/${courseId}`);
      set({
        courseId: data.courseId,
        courseTitle: data.courseTitle,
        progressPercentage: data.progressPercentage,
        sections: data.sections,
      });
    } catch (error) {
      console.error('Lỗi khi fetch lộ trình học tập (Zustand):', error);
    } finally {
      set({ isLoadingStructure: false });
    }
  },
  // Action 2: Lấy nội dung chi tiết của một bài học cụ thể (Gọi API LX-BE-1.4)
  fetchLessonDetail: async (lessonId: string) => {
    try {
      set({ isLoadingLesson: true });
      const { data } = await axios.get(`/lx/lesson/${lessonId}`);
      set({
        activeLesson: {
          id: data.id,
          title: data.title,
          type: data.type,
          content: data.content,
          isFreePreview: data.isFreePreview,
          orderIndex: data.orderIndex,
          status: data.userProgress.status,
          lastPosition: data.userProgress.lastPosition,
        },
      });
    } catch (error) {
      console.error('Lỗi khi fetch nội dung bài giảng (Zustand):', error);
    } finally {
      set({ isLoadingLesson: false });
    }
  },
  // Action 3: Cập nhật nhanh trạng thái bài học trên giao diện (Optimistic UI state)
  updateLessonProgressLocal: (
    lessonId: string,
    status: LXLesson['status'],
    lastPosition: number
  ) => {
    set((state) => {
      const updatedSections = state.sections.map((section) => ({
        ...section,
        lessons: section.lessons.map((lesson) =>
          lesson.id === lessonId ? { ...lesson, status, lastPosition } : lesson
        ),
      }));
      // Tính toán lại sơ bộ phần trăm tiến độ tổng quát để UI mượt mà
      const allLessons = updatedSections.flatMap((s) => s.lessons);
      const completedCount = allLessons.filter((l) => l.status === 'COMPLETED').length;
      const newPercentage = allLessons.length > 0 ? (completedCount / allLessons.length) * 100 : 0;
      return {
        sections: updatedSections,
        progressPercentage: newPercentage,
        // Nếu bài học đang cập nhật trùng với bài đang mở, cập nhật luôn activeLesson
        activeLesson:
          state.activeLesson?.id === lessonId
            ? { ...state.activeLesson, status, lastPosition }
            : state.activeLesson,
      };
    });
  },
  // Action 4: Dọn dẹp bộ nhớ khi học viên thoát khỏi không gian học
  resetLXStore: () =>
    set({
      courseId: null,
      courseTitle: '',
      progressPercentage: 0,
      sections: [],
      activeLesson: null,
      isLoadingStructure: false,
      isLoadingLesson: false,
    }),
  // TASK: LX-FE-1.5: Quét mảng tiến độ để tìm ra bài học tối ưu nhất để Resume
  getLastActiveLesson: () => {
    const { sections } = get();
    const allLessons = sections.flatMap((s) => s.lessons);
    if (allLessons.length === 0) return null;
    // Ưu tiên 1: Tìm bài học đang ở trạng thái 'IN_PROGRESS'
    const inProgressLesson = allLessons.find((l) => l.status === 'IN_PROGRESS');
    if (inProgressLesson) return inProgressLesson;
    // Ưu tiên 2: Tìm bài học đầu tiên ở trạng thái 'NOT_STARTED'
    const notStartedLesson = allLessons.find((l) => l.status === 'NOT_STARTED');
    if (notStartedLesson) return notStartedLesson;
    // Ưu tiên 3: Nếu đã học xong hết sạch, trả về bài học đầu tiên để review lại
    return allLessons[0];
  },
}));

import { create } from 'zustand';

// Định nghĩa kiểu dữ liệu
interface Lesson {
  id: string;
  title: string;
  type: 'VIDEO' | 'ARTICLE' | 'QUIZ';
  orderIndex: number;
}

interface Section {
  id: string;
  title: string;
  orderIndex: number;
  lessons: Lesson[];
}

interface CourseState {
  courseId: string | null;
  sections: Section[];
  isLoading: boolean;

  // TASK S2-CM-05: Thêm backup để rollback
  _backupSections: Section[];
  setCourseData: (courseId: string, sections: Section[]) => void;
  addSection: (section: Section) => void;
  updateSectionTitle: (sectionId: string, title: string) => void;
  reorderSections: (activeId: string, overId: string) => void;
  setLoading: (status: boolean) => void;
  rollbackSections: () => void; // Hàm khôi phục dữ liệu
}

// Task S1-CM-07: Khởi tạo Zustand Store
export const useCourseBuilderStore = create<CourseState>((set) => ({
  courseId: null,
  sections: [],
  isLoading: false,
  _backupSections: [],

  setCourseData: (courseId, sections) =>
    set({
      courseId,
      sections: [...(sections ?? [])].sort((a, b) => a.orderIndex - b.orderIndex),
      _backupSections: [...(sections ?? [])],
    }),
  addSection: (section) =>
    set((state) => ({
      sections: [...state.sections, section],
    })),

  updateSectionTitle: (sectionId, title) =>
    set((state) => ({
      sections: state.sections.map((s) => (s.id === sectionId ? { ...s, title } : s)),
    })),

  // TASK S2-CM-05: Cập nhật logic reorder để hỗ trợ Optimistic
  reorderSections: (activeId, overId) =>
    set((state) => {
      // Lưu lại trạng thái hiện tại vào backup trước khi thay đổi
      const currentSections = [...state.sections];
      const oldIndex = state.sections.findIndex((s) => s.id === activeId);
      const newIndex = state.sections.findIndex((s) => s.id === overId);
      if (oldIndex === -1 || newIndex === -1) return state;

      const newSections = [...state.sections];
      const [removed] = newSections.splice(oldIndex, 1);
      newSections.splice(newIndex, 0, removed);

      return {
        sections: newSections,
        _backupSections: currentSections, // Giữ bản cũ để phòng lỗi API
      };
    }),

  setLoading: (status) => set({ isLoading: status }),
  // TASK S2-CM-05: Hàm hoàn tác nếu API thất bại
  rollbackSections: () =>
    set((state) => ({
      sections: state._backupSections,
    })),
}));

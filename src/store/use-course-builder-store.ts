import { create } from 'zustand';

// Định nghĩa kiểu dữ liệu
interface Lesson {
  id: string;
  title: string;
  type: 'VIDEO' | 'ARTICLE' | 'QUIZ';
  orderIndex: number;
  content?: string;
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

  setCourseData: (courseId: string, sections: Section[]) => void;
  addSection: (section: Section) => void;
  updateSectionTitle: (sectionId: string, title: string) => void;
  deleteSection: (sectionId: string) => void;
  reorderSections: (activeId: string, overId: string) => void;
  rollbackSections: () => void; // Hàm khôi phục dữ liệu
  addLesson: (sectionId: string, lesson: Lesson) => void;
  setLoading: (status: boolean) => void;
  updateLesson: (sectionId: string, lessonId: string, data: Partial<Lesson>) => void;
  deleteLesson: (sectionId: string, lessonId: string) => void;
  _backupSections: Section[];
}

// Task S1-CM-07: Khởi tạo Zustand Store
export const useCourseBuilderStore = create<CourseState>((set, get) => ({
  courseId: null,
  sections: [],
  isLoading: false,
  _backupSections: [],

  setCourseData: (courseId, sections) =>
    set({
      courseId,
      sections: sections.sort((a, b) => a.orderIndex - b.orderIndex),
      _backupSections: sections,
    }),
  addSection: (section) =>
    set((state) => ({
      sections: [...state.sections, section],
    })),

  updateSectionTitle: (sectionId, title) =>
    set((state) => ({
      sections: state.sections.map((s) => (s.id === sectionId ? { ...s, title } : s)),
    })),

  deleteSection: (sectionId) =>
    set((state) => ({ sections: state.sections.filter((s) => s.id !== sectionId) })),

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

  rollbackSections: () => set((state) => ({ sections: state._backupSections })),

  addLesson: (sectionId, lesson) =>
    set((state) => ({
      sections: state.sections.map((s) =>
        s.id === sectionId ? { ...s, lessons: [...s.lessons, lesson] } : s
      ),
    })),
  setLoading: (status) => set({ isLoading: status }),
  updateLesson: (sectionId, lessonId, data) =>
    set((state) => ({
      sections: state.sections.map((s) =>
        s.id === sectionId
          ? { ...s, lessons: s.lessons.map((l) => (l.id === lessonId ? { ...l, ...data } : l)) }
          : s
      ),
    })),

  deleteLesson: (sectionId, lessonId) =>
    set((state) => ({
      sections: state.sections.map((s) =>
        s.id === sectionId ? { ...s, lessons: s.lessons.filter((l) => l.id !== lessonId) } : s
      ),
    })),
}));

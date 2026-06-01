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

  setCourseData: (courseId, sections) =>
    set({
      courseId,
      sections: [...(sections ?? [])].sort((a, b) => a.orderIndex - b.orderIndex),
    }),
  addSection: (section) =>
    set((state) => ({
      sections: [...state.sections, section],
    })),

  updateSectionTitle: (sectionId, title) =>
    set((state) => ({
      sections: state.sections.map((s) => (s.id === sectionId ? { ...s, title } : s)),
    })),

  // Logic sắp xếp lại Section (Sẽ tích hợp với dnd-kit ở Sprint 2)
  reorderSections: (activeId, overId) =>
    set((state) => {
      const oldIndex = state.sections.findIndex((s) => s.id === activeId);
      const newIndex = state.sections.findIndex((s) => s.id === overId);
      const newSections = [...state.sections];
      const [removed] = newSections.splice(oldIndex, 1);
      newSections.splice(newIndex, 0, removed);
      return { sections: newSections };
    }),

  setLoading: (status) => set({ isLoading: status }),
  rollbackSections: () => set((state) => ({})),
}));

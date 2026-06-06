import { describe, it, expect, beforeEach } from 'vitest';
import { useCourseBuilderStore } from '@/store/use-course-builder-store';

const makeSections = () => [
  {
    id: 's1',
    title: 'Section 1',
    orderIndex: 1,
    lessons: [{ id: 'l1', title: 'Lesson 1', type: 'VIDEO' as const, orderIndex: 0 }],
  },
  {
    id: 's2',
    title: 'Section 2',
    orderIndex: 0,
    lessons: [],
  },
  {
    id: 's3',
    title: 'Section 3',
    orderIndex: 2,
    lessons: [],
  },
];

describe('useCourseBuilderStore', () => {
  beforeEach(() => {
    useCourseBuilderStore.setState({
      courseId: null,
      sections: [],
      isLoading: false,
      _backupSections: [],
    });
  });

  describe('setCourseData', () => {
    it('sets courseId and sorts sections by orderIndex', () => {
      useCourseBuilderStore.getState().setCourseData('course-1', makeSections());
      const state = useCourseBuilderStore.getState();
      expect(state.courseId).toBe('course-1');
      expect(state.sections.map((s) => s.id)).toEqual(['s2', 's1', 's3']);
    });

    it('stores a backup of sections', () => {
      useCourseBuilderStore.getState().setCourseData('c1', makeSections());
      expect(useCourseBuilderStore.getState()._backupSections).toHaveLength(3);
    });

    it('handles null sections gracefully', () => {
      useCourseBuilderStore.getState().setCourseData('c1', null as unknown as never[]);
      expect(useCourseBuilderStore.getState().sections).toEqual([]);
    });
  });

  describe('addSection', () => {
    it('appends a new section', () => {
      useCourseBuilderStore.getState().setCourseData('c1', makeSections());
      const newSection = { id: 's4', title: 'New Section', orderIndex: 3, lessons: [] };
      useCourseBuilderStore.getState().addSection(newSection);
      expect(useCourseBuilderStore.getState().sections).toHaveLength(4);
      expect(useCourseBuilderStore.getState().sections[3].id).toBe('s4');
    });
  });

  describe('updateSectionTitle', () => {
    it('updates the title of a specific section', () => {
      useCourseBuilderStore.getState().setCourseData('c1', makeSections());
      useCourseBuilderStore.getState().updateSectionTitle('s1', 'Renamed');
      const section = useCourseBuilderStore.getState().sections.find((s) => s.id === 's1');
      expect(section?.title).toBe('Renamed');
    });

    it('leaves other sections unchanged', () => {
      useCourseBuilderStore.getState().setCourseData('c1', makeSections());
      useCourseBuilderStore.getState().updateSectionTitle('s1', 'Renamed');
      const s2 = useCourseBuilderStore.getState().sections.find((s) => s.id === 's2');
      expect(s2?.title).toBe('Section 2');
    });
  });

  describe('reorderSections', () => {
    it('moves a section to a new position', () => {
      useCourseBuilderStore.getState().setCourseData('c1', makeSections());
      // After setCourseData, order is [s2, s1, s3]. Move s3 before s2.
      useCourseBuilderStore.getState().reorderSections('s3', 's2');
      const ids = useCourseBuilderStore.getState().sections.map((s) => s.id);
      expect(ids).toEqual(['s3', 's2', 's1']);
    });

    it('saves backup before reordering', () => {
      useCourseBuilderStore.getState().setCourseData('c1', makeSections());
      const beforeReorder = useCourseBuilderStore.getState().sections.map((s) => s.id);
      useCourseBuilderStore.getState().reorderSections('s3', 's2');
      const backup = useCourseBuilderStore.getState()._backupSections.map((s) => s.id);
      expect(backup).toEqual(beforeReorder);
    });

    it('returns unchanged state for invalid ids', () => {
      useCourseBuilderStore.getState().setCourseData('c1', makeSections());
      const before = useCourseBuilderStore.getState().sections;
      useCourseBuilderStore.getState().reorderSections('nonexistent', 's1');
      expect(useCourseBuilderStore.getState().sections).toEqual(before);
    });
  });

  describe('rollbackSections', () => {
    it('restores sections from backup', () => {
      useCourseBuilderStore.getState().setCourseData('c1', makeSections());
      const originalIds = useCourseBuilderStore.getState().sections.map((s) => s.id);
      useCourseBuilderStore.getState().reorderSections('s3', 's2');
      useCourseBuilderStore.getState().rollbackSections();
      const restoredIds = useCourseBuilderStore.getState().sections.map((s) => s.id);
      expect(restoredIds).toEqual(originalIds);
    });
  });

  describe('setLoading', () => {
    it('toggles isLoading', () => {
      useCourseBuilderStore.getState().setLoading(true);
      expect(useCourseBuilderStore.getState().isLoading).toBe(true);
      useCourseBuilderStore.getState().setLoading(false);
      expect(useCourseBuilderStore.getState().isLoading).toBe(false);
    });
  });
});

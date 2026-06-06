import { describe, it, expect, beforeEach } from 'vitest';
import { useLXStore } from '@/store/use-lx-store';
import type { LXSection, LXLesson } from '@/store/use-lx-store';

const makeLesson = (overrides: Partial<LXLesson> = {}): LXLesson => ({
  id: 'lesson-1',
  title: 'Lesson 1',
  type: 'VIDEO',
  isFreePreview: false,
  orderIndex: 0,
  status: 'NOT_STARTED',
  lastPosition: 0,
  ...overrides,
});

const makeSections = (): LXSection[] => [
  {
    id: 'sec-1',
    title: 'Section 1',
    orderIndex: 0,
    lessons: [
      makeLesson({ id: 'l1', status: 'COMPLETED', orderIndex: 0 }),
      makeLesson({ id: 'l2', status: 'IN_PROGRESS', lastPosition: 45, orderIndex: 1 }),
    ],
  },
  {
    id: 'sec-2',
    title: 'Section 2',
    orderIndex: 1,
    lessons: [
      makeLesson({ id: 'l3', status: 'NOT_STARTED', orderIndex: 0 }),
      makeLesson({ id: 'l4', status: 'NOT_STARTED', orderIndex: 1 }),
    ],
  },
];

describe('useLXStore', () => {
  beforeEach(() => {
    useLXStore.getState().resetLXStore();
  });

  describe('resetLXStore', () => {
    it('resets all state to defaults', () => {
      useLXStore.setState({
        courseId: 'c1',
        courseTitle: 'Title',
        progressPercentage: 50,
        sections: makeSections(),
        activeLesson: makeLesson(),
        isLoadingStructure: true,
        isLoadingLesson: true,
      });

      useLXStore.getState().resetLXStore();
      const state = useLXStore.getState();
      expect(state.courseId).toBeNull();
      expect(state.courseTitle).toBe('');
      expect(state.progressPercentage).toBe(0);
      expect(state.sections).toEqual([]);
      expect(state.activeLesson).toBeNull();
      expect(state.isLoadingStructure).toBe(false);
      expect(state.isLoadingLesson).toBe(false);
    });
  });

  describe('updateLessonProgressLocal', () => {
    beforeEach(() => {
      useLXStore.setState({
        sections: makeSections(),
        progressPercentage: 0,
      });
    });

    it('updates lesson status and lastPosition', () => {
      useLXStore.getState().updateLessonProgressLocal('l3', 'COMPLETED', 100);
      const lesson = useLXStore
        .getState()
        .sections.flatMap((s) => s.lessons)
        .find((l) => l.id === 'l3');
      expect(lesson?.status).toBe('COMPLETED');
      expect(lesson?.lastPosition).toBe(100);
    });

    it('recalculates progressPercentage', () => {
      // Initially: l1=COMPLETED, l2=IN_PROGRESS, l3=NOT_STARTED, l4=NOT_STARTED → 1/4 = 25%
      useLXStore.getState().updateLessonProgressLocal('l2', 'COMPLETED', 100);
      // Now: l1=COMPLETED, l2=COMPLETED → 2/4 = 50%
      expect(useLXStore.getState().progressPercentage).toBe(50);
    });

    it('updates activeLesson when it matches the lessonId', () => {
      useLXStore.setState({ activeLesson: makeLesson({ id: 'l2', status: 'IN_PROGRESS' }) });
      useLXStore.getState().updateLessonProgressLocal('l2', 'COMPLETED', 100);
      expect(useLXStore.getState().activeLesson?.status).toBe('COMPLETED');
      expect(useLXStore.getState().activeLesson?.lastPosition).toBe(100);
    });

    it('does not update activeLesson when ids differ', () => {
      useLXStore.setState({ activeLesson: makeLesson({ id: 'l2', status: 'IN_PROGRESS' }) });
      useLXStore.getState().updateLessonProgressLocal('l3', 'COMPLETED', 100);
      expect(useLXStore.getState().activeLesson?.status).toBe('IN_PROGRESS');
    });

    it('handles 0 lessons without division error', () => {
      useLXStore.setState({ sections: [] });
      useLXStore.getState().updateLessonProgressLocal('nonexistent', 'COMPLETED', 0);
      expect(useLXStore.getState().progressPercentage).toBe(0);
    });
  });

  describe('getLastActiveLesson', () => {
    it('returns IN_PROGRESS lesson first', () => {
      useLXStore.setState({ sections: makeSections() });
      const lesson = useLXStore.getState().getLastActiveLesson();
      expect(lesson?.id).toBe('l2');
      expect(lesson?.status).toBe('IN_PROGRESS');
    });

    it('returns first NOT_STARTED lesson when none are IN_PROGRESS', () => {
      const sections: LXSection[] = [
        {
          id: 'sec-1',
          title: 'Section 1',
          orderIndex: 0,
          lessons: [
            makeLesson({ id: 'l1', status: 'COMPLETED' }),
            makeLesson({ id: 'l2', status: 'NOT_STARTED' }),
          ],
        },
      ];
      useLXStore.setState({ sections });
      const lesson = useLXStore.getState().getLastActiveLesson();
      expect(lesson?.id).toBe('l2');
    });

    it('returns first lesson when all are COMPLETED', () => {
      const sections: LXSection[] = [
        {
          id: 'sec-1',
          title: 'Section 1',
          orderIndex: 0,
          lessons: [
            makeLesson({ id: 'l1', status: 'COMPLETED' }),
            makeLesson({ id: 'l2', status: 'COMPLETED' }),
          ],
        },
      ];
      useLXStore.setState({ sections });
      const lesson = useLXStore.getState().getLastActiveLesson();
      expect(lesson?.id).toBe('l1');
    });

    it('returns null for empty sections', () => {
      useLXStore.setState({ sections: [] });
      expect(useLXStore.getState().getLastActiveLesson()).toBeNull();
    });

    it('returns null for sections with no lessons', () => {
      useLXStore.setState({
        sections: [{ id: 'sec-1', title: 'Empty', orderIndex: 0, lessons: [] }],
      });
      expect(useLXStore.getState().getLastActiveLesson()).toBeNull();
    });
  });
});

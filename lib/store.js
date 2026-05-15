import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Debounce helper
const createDebounce = (fn, delay = 500) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
};

export const useStudentStore = create(
  persist(
    (set, get) => ({
      // Student data
      student: null,
      setStudent: (student) => set({ student }),

      // Dashboard state
      sessions: [],
      setSessions: (sessions) => set({ sessions }),

      progress: [],
      setProgress: (progress) => set({ progress }),

      activeTab: 'dashboard',
      setActiveTab: (tab) => set({ activeTab: tab }),

      // Placement test
      showPlacementTest: false,
      setShowPlacementTest: (show) => set({ showPlacementTest: show }),

      testQuestions: [],
      setTestQuestions: (questions) => set({ testQuestions: questions }),

      testAnswers: {},
      setTestAnswers: (answers) => set({ testAnswers: answers }),
      addTestAnswer: (index, answer) => {
        const current = get().testAnswers;
        const updated = { ...current, [index]: answer };
        set({ testAnswers: updated });
      },

      testIndex: 0,
      setTestIndex: (index) => set({ testIndex: index }),

      testResult: null,
      setTestResult: (result) => set({ testResult: result }),

      // Lesson state
      currentLesson: null,
      setCurrentLesson: (lesson) => set({ currentLesson: lesson }),

      lessonAnswers: {},
      setLessonAnswers: (answers) => set({ lessonAnswers: answers }),
      addLessonAnswer: (index, answer) => {
        const current = get().lessonAnswers;
        const updated = { ...current, [index]: answer };
        set({ lessonAnswers: updated });
      },

      lessonQuestionIndex: 0,
      setLessonQuestionIndex: (index) => set({ lessonQuestionIndex: index }),

      // Loading state
      loading: true,
      setLoading: (loading) => set({ loading }),

      // Recovery
      hasRecoveryData: false,
      setHasRecoveryData: (has) => set({ hasRecoveryData: has }),

      // Reset all (logout)
      reset: () => set({
        student: null,
        sessions: [],
        progress: [],
        activeTab: 'dashboard',
        showPlacementTest: false,
        testQuestions: [],
        testAnswers: {},
        testIndex: 0,
        testResult: null,
        currentLesson: null,
        lessonAnswers: {},
        lessonQuestionIndex: 0,
        loading: true,
        hasRecoveryData: false
      })
    }),
    {
      name: 'atlas-student-store',
      version: 1,
      // Only persist specific fields (avoid persisting sensitive data like loading)
      partialize: (state) => ({
        student: state.student,
        sessions: state.sessions,
        progress: state.progress,
        activeTab: state.activeTab,
        showPlacementTest: state.showPlacementTest,
        testQuestions: state.testQuestions,
        testAnswers: state.testAnswers,
        testIndex: state.testIndex,
        testResult: state.testResult,
        currentLesson: state.currentLesson,
        lessonAnswers: state.lessonAnswers,
        lessonQuestionIndex: state.lessonQuestionIndex,
      }),
    }
  )
);

// Debounced save to server
export const useDebouncedSave = () => {
  const saveToServer = async (data) => {
    try {
      // Save quiz answers
      if (data.lessonAnswers && Object.keys(data.lessonAnswers).length > 0) {
        localStorage.setItem('pendingLessonAnswers', JSON.stringify(data.lessonAnswers));
      }
      // Save test answers
      if (data.testAnswers && Object.keys(data.testAnswers).length > 0) {
        localStorage.setItem('pendingTestAnswers', JSON.stringify(data.testAnswers));
      }
    } catch (error) {
      console.error('Error saving to server:', error);
    }
  };

  return createDebounce(saveToServer, 1000); // Wait 1 second after last change
};

// Check if there's recovery data
export const hasRecoveryData = () => {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem('atlas-student-store');
  if (!stored) return false;
  
  try {
    const data = JSON.parse(stored);
    const state = data.state || {};
    
    // Check if there's an active lesson or test in progress
    return !!(
      (state.currentLesson !== null && state.lessonAnswers && Object.keys(state.lessonAnswers).length > 0) ||
      (state.showPlacementTest && state.testAnswers && Object.keys(state.testAnswers).length > 0)
    );
  } catch {
    return false;
  }
};

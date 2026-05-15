import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  AdaptiveSessionUiState,
  AdaptiveStartResponse,
  AdaptiveSubmitResponse,
} from "@/types/domain/adaptive";

const initialState: AdaptiveSessionUiState = {
  selectedSubjectId: null,
  selectedTopicId: null,
  questionCount: 5,
  sessionId: null,
  expiresAt: null,
  exercises: [],
  studentAnswers: {},
  sessionStartedAt: null,
  results: null,
};

const adaptiveSlice = createSlice({
  name: "adaptive",
  initialState,
  reducers: {
    setSubject(state, action: PayloadAction<number>) {
      state.selectedSubjectId = action.payload;
      state.selectedTopicId = null;
    },
    setTopic(state, action: PayloadAction<number>) {
      state.selectedTopicId = action.payload;
    },
    setQuestionCount(state, action: PayloadAction<number>) {
      state.questionCount = action.payload;
    },
    setSession(state, action: PayloadAction<AdaptiveStartResponse>) {
      state.sessionId = action.payload.sessionId ?? null;
      state.expiresAt = action.payload.expiresAt ?? null;
      state.exercises = action.payload.exercises ?? [];
      state.studentAnswers = {};
      state.sessionStartedAt = null;
      state.results = null;
    },
    toggleAnswer(
      state,
      action: PayloadAction<{ exerciseId: string; answer: string; multi: boolean }>,
    ) {
      const { exerciseId, answer, multi } = action.payload;
      const current = state.studentAnswers[exerciseId] ?? [];

      if (multi) {
        state.studentAnswers[exerciseId] = current.includes(answer)
          ? current.filter((item) => item !== answer)
          : [...current, answer];
        return;
      }

      state.studentAnswers[exerciseId] = [answer];
    },
    markSessionStarted(state) {
      state.sessionStartedAt = Date.now();
    },
    setResults(state, action: PayloadAction<AdaptiveSubmitResponse>) {
      state.results = action.payload;
    },
    resetSession(state) {
      state.sessionId = null;
      state.expiresAt = null;
      state.exercises = [];
      state.studentAnswers = {};
      state.sessionStartedAt = null;
      state.results = null;
    },
  },
});

export const {
  setSubject,
  setTopic,
  setQuestionCount,
  setSession,
  toggleAnswer,
  markSessionStarted,
  setResults,
  resetSession,
} = adaptiveSlice.actions;

export default adaptiveSlice.reducer;

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { startAdaptiveSession, submitAdaptiveSession } from "@/lib/adaptive/api";
import {
  AdaptiveStartRequest,
  ClientExercise,
  AdaptiveResult,
} from "@/lib/adaptive/types";
import type { RootState } from "@/store";

interface AdaptiveState {
  selectedSubjectId: number | null;
  selectedTopicId: number | null;
  questionCount: number;
  sessionId: string | null;
  expiresAt: string | null;
  exercises: ClientExercise[];
  studentAnswers: Record<string, string[]>;
  sessionStartedAt: number | null;
  results: AdaptiveResult | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AdaptiveState = {
  selectedSubjectId: null,
  selectedTopicId: null,
  questionCount: 5,
  sessionId: null,
  expiresAt: null,
  exercises: [],
  studentAnswers: {},
  sessionStartedAt: null,
  results: null,
  isLoading: false,
  error: null,
};

export const startSessionThunk = createAsyncThunk(
  "adaptive/startSession",
  async (req: AdaptiveStartRequest, { getState, rejectWithValue }) => {
    const token = (getState() as RootState).auth.accessToken ?? "";
    try {
      return await startAdaptiveSession(token, req);
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : "Failed to start session");
    }
  }
);

export const submitSessionThunk = createAsyncThunk(
  "adaptive/submitSession",
  async (
    { sessionId, timePerExercise }: { sessionId: string; timePerExercise: number },
    { getState, rejectWithValue }
  ) => {
    const rootState = getState() as RootState;
    const token = rootState.auth.accessToken ?? "";
    const state = rootState.adaptive;
    const answers = state.exercises.map((ex) => ({
      exerciseId: ex.exerciseId,
      givenAnswers: state.studentAnswers[ex.exerciseId] ?? [],
      timeSpent: Math.round(timePerExercise),
    }));
    try {
      return await submitAdaptiveSession(token, sessionId, { answers });
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : "Failed to submit session");
    }
  }
);

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
    toggleAnswer(
      state,
      action: PayloadAction<{ exerciseId: string; answer: string; multi: boolean }>
    ) {
      const { exerciseId, answer, multi } = action.payload;
      const current = state.studentAnswers[exerciseId] ?? [];
      if (multi) {
        if (current.includes(answer)) {
          state.studentAnswers[exerciseId] = current.filter((a) => a !== answer);
        } else {
          state.studentAnswers[exerciseId] = [...current, answer];
        }
      } else {
        state.studentAnswers[exerciseId] = [answer];
      }
    },
    markSessionStarted(state) {
      state.sessionStartedAt = Date.now();
    },
    resetSession(state) {
      state.sessionId = null;
      state.expiresAt = null;
      state.exercises = [];
      state.studentAnswers = {};
      state.sessionStartedAt = null;
      state.results = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(startSessionThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(startSessionThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sessionId = action.payload.sessionId;
        state.expiresAt = action.payload.expiresAt;
        state.exercises = action.payload.exercises;
        state.studentAnswers = {};
        state.results = null;
      })
      .addCase(startSessionThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(submitSessionThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(submitSessionThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.results = action.payload;
      })
      .addCase(submitSessionThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setSubject,
  setTopic,
  setQuestionCount,
  toggleAnswer,
  markSessionStarted,
  resetSession,
} = adaptiveSlice.actions;

export default adaptiveSlice.reducer;

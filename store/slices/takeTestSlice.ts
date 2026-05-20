import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  apiGetMyAttempts,
  apiGetStudentProgress,
  apiGetTestResult,
  apiGetTestsForCourse,
  apiStartTestSession,
  apiSubmitTest,
} from "@/lib/tests/api";
import { StudentProgress, SubmitTestPayload, TakeTestSession, TestResult } from "@/lib/tests/types";

function getErrorMessage(err: unknown, fallback: string) {
  return err instanceof Error ? err.message : fallback;
}

interface TakeTestState {
  session: TakeTestSession | null;
  answers: Record<string, string[]>;
  result: TestResult | null;
  progress: StudentProgress | null;
  loading: boolean;
  error: string | null;
  testsForCourse: unknown[];
  myAttempts: unknown[];
}

const initialState: TakeTestState = {
  session: null,
  answers: {},
  result: null,
  progress: null,
  loading: false,
  error: null,
  testsForCourse: [],
  myAttempts: [],
};

export const startTestThunk = createAsyncThunk(
  "takeTest/start",
  async (testId: string, { rejectWithValue }) => {
    try {
      return await apiStartTestSession(testId);
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err, "Failed to start test."));
    }
  }
);

export const submitTestThunk = createAsyncThunk(
  "takeTest/submit",
  async ({ attemptId, payload }: { attemptId: string; payload: SubmitTestPayload }, { rejectWithValue }) => {
    try {
      return await apiSubmitTest(attemptId, payload);
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err, "Failed to submit test."));
    }
  }
);

export const fetchTestResultThunk = createAsyncThunk(
  "takeTest/fetchResult",
  async (attemptId: string, { rejectWithValue }) => {
    try {
      return await apiGetTestResult(attemptId);
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err, "Failed to load result."));
    }
  }
);

export const fetchStudentProgressThunk = createAsyncThunk(
  "takeTest/progress",
  async (courseId: string, { rejectWithValue }) => {
    try {
      return await apiGetStudentProgress(courseId);
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err, "Failed to load progress."));
    }
  }
);

export const fetchMyAttemptsThunk = createAsyncThunk(
  "takeTest/myAttempts",
  async (testId: string, { rejectWithValue }) => {
    try {
      return await apiGetMyAttempts(testId);
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err, "Failed to load attempts."));
    }
  }
);

export const fetchTestsForCourseThunk = createAsyncThunk(
  "takeTest/testsForCourse",
  async (courseId: string, { rejectWithValue }) => {
    try {
      return await apiGetTestsForCourse(courseId);
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err, "Failed to load tests."));
    }
  }
);

const takeTestSlice = createSlice({
  name: "takeTest",
  initialState,
  reducers: {
    toggleAnswer: (
      state,
      action: PayloadAction<{ questionId: string; optionId: string; multi: boolean }>
    ) => {
      const current = state.answers[action.payload.questionId] ?? [];

      if (action.payload.multi) {
        state.answers[action.payload.questionId] = current.includes(action.payload.optionId)
          ? current.filter((id) => id !== action.payload.optionId)
          : [...current, action.payload.optionId];
      } else {
        state.answers[action.payload.questionId] = [action.payload.optionId];
      }
    },
    resetTestState: () => initialState,
    clearCurrentAttempt(state) {
      state.session = null;
      state.answers = {};
      state.result = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(startTestThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.session = null;
        state.result = null;
        state.answers = {};
      })
      .addCase(startTestThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.session = action.payload;
      })
      .addCase(startTestThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(submitTestThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitTestThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.result = action.payload;
      })
      .addCase(submitTestThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchTestResultThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTestResultThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.result = action.payload;
      })
      .addCase(fetchTestResultThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchStudentProgressThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentProgressThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.progress = action.payload;
      })
      .addCase(fetchStudentProgressThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchTestsForCourseThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTestsForCourseThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.testsForCourse = action.payload;
      })
      .addCase(fetchTestsForCourseThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchMyAttemptsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyAttemptsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.myAttempts = action.payload;
      })
      .addCase(fetchMyAttemptsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentAttempt, resetTestState, toggleAnswer } = takeTestSlice.actions;

export default takeTestSlice.reducer;

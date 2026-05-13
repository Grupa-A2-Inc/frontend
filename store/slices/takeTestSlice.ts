// --------------------------------------------------
// store/slices/takeTestSlice.ts
// --------------------------------------------------
// Acest slice gestionează logica pentru student:
// - start test (API real)
// - selectare răspunsuri
// - submit test (API real)
// - fetch rezultate test
// - fetch progres student
// - resetare stare
// --------------------------------------------------

import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
    apiStartTestSession,
    apiSubmitTest,
    apiGetTestResult,
    apiGetStudentProgress,
} from "@/lib/tests/api";
import { TakeTestSession, TestResult } from "@/lib/tests/types";
import { StudentProgress } from "@/lib/tests/types";
import { apiGetTestsForCourse } from "@/lib/tests/api";
import { apiGetMyAttempts } from "@/lib/tests/api";

// --------------------------------------------------
// Tipurile interne pentru state-ul slice-ului
// --------------------------------------------------

interface TakeTestState {
    session: TakeTestSession | null; // datele sesiunii curente
    currentQuestionIndex: number; // indexul întrebării curente
    answers: Record<string, string>; // mapare întrebareId -> răspunsId
    result: TestResult | null; // rezultatul final al testului
    progress: StudentProgress | null; // progresul studentului (lista testelor date)
    loading: boolean; // flag pentru request-uri
    error: string | null; // mesaj de eroare

    testsForCourse: any[];
    myAttempts: any[],
}

// --------------------------------------------------
// Starea inițială
// --------------------------------------------------

const initialState: TakeTestState = {
    session: null,
    currentQuestionIndex: 0,
    answers: {},
    result: null,
    progress: null,
    loading: false,
    error: null,
    testsForCourse: [],
    myAttempts: [],
};

// --------------------------------------------------
// Thunk: pornirea testului (API real)
// --------------------------------------------------

export const startTestThunk = createAsyncThunk(
    "takeTest/start",
    async (testId: string, { rejectWithValue }) => {
        try {
            const data = await apiStartTestSession(testId);
            return data;
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

// --------------------------------------------------
// Thunk: trimiterea testului (API real)
// --------------------------------------------------

export const submitTestThunk = createAsyncThunk(
    "takeTest/submit",
    async (
        { attemptId, payload }: { attemptId: string; payload: any },
        { rejectWithValue }
    ) => {
        try {
            const data = await apiSubmitTest(attemptId, payload);
            return data;
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

// --------------------------------------------------
// Thunk: obținerea rezultatului testului
// --------------------------------------------------

export const fetchTestResultThunk = createAsyncThunk(
    "takeTest/fetchResult",
    async (attemptId: string, { rejectWithValue }) => {
        try {
            const data = await apiGetTestResult(attemptId);
            return data;
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

// --------------------------------------------------
// Thunk: obținerea progresului studentului
// --------------------------------------------------

export const fetchStudentProgressThunk = createAsyncThunk(
  "takeTest/progress",
  async (courseId: string, { rejectWithValue }) => {
    try {
      const data = await apiGetStudentProgress(courseId);
      return data; // <-- acesta este StudentProgress, nu array
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchMyAttemptsThunk = createAsyncThunk(
  "takeTest/myAttempts",
  async (testId: string, { rejectWithValue }) => {
    try {
      const data = await apiGetMyAttempts(testId);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchTestsForCourseThunk = createAsyncThunk(
  "takeTest/testsForCourse",
  async (courseId: string, { rejectWithValue }) => {
    try {
      return await apiGetTestsForCourse(courseId);
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// --------------------------------------------------
// Slice principal
// --------------------------------------------------

const takeTestSlice = createSlice({
    name: "takeTest",
    initialState,
    reducers: {
        // Selectează un răspuns pentru o întrebare
        selectAnswer: (
            state,
            action: PayloadAction<{ questionId: string; optionId: string }>
        ) => {
            state.answers[action.payload.questionId] = action.payload.optionId;
        },

        // Navighează la următoarea întrebare
        nextQuestion: (state) => {
            if (
                state.session &&
                state.currentQuestionIndex < state.session.questions.length - 1
            ) {
                state.currentQuestionIndex += 1;
            }
        },

        // Navighează la întrebarea anterioară
        prevQuestion: (state) => {
            if (state.currentQuestionIndex > 0) {
                state.currentQuestionIndex -= 1;
            }
        },

        // Resetează complet starea (după finalizare)
        resetTestState: (state) => {
            state.session = null;
            state.currentQuestionIndex = 0;
            state.answers = {};
            state.result = null;
            state.progress = null;
            state.loading = false;
            state.error = null;

            state.testsForCourse = [];
            state.myAttempts = [];
        },
    },

    // --------------------------------------------------
    // Extra reducers pentru thunk-uri
    // --------------------------------------------------
    extraReducers: (builder) => {
        // Pornire test
        builder.addCase(startTestThunk.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(startTestThunk.fulfilled, (state, action) => {
            state.loading = false;
            state.session = action.payload;
            state.currentQuestionIndex = 0;
            state.answers = {};
        });
        builder.addCase(startTestThunk.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Submit test
        builder.addCase(submitTestThunk.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(submitTestThunk.fulfilled, (state, action) => {
            state.loading = false;
            state.result = action.payload;
        });
        builder.addCase(submitTestThunk.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Rezultatul testului
        builder.addCase(fetchTestResultThunk.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchTestResultThunk.fulfilled, (state, action) => {
            state.loading = false;
            state.result = action.payload;
        });
        builder.addCase(fetchTestResultThunk.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Progresul studentului
        builder.addCase(fetchStudentProgressThunk.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchStudentProgressThunk.fulfilled, (state, action) => {
            state.loading = false;
            state.progress = action.payload;
        });
        builder.addCase(fetchStudentProgressThunk.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        builder.addCase(fetchTestsForCourseThunk.pending, (state) => {
            state.loading = true;
            state.error = null;
        });

        builder.addCase(fetchTestsForCourseThunk.fulfilled, (state, action) => {
            state.loading = false;
            state.testsForCourse = action.payload;
        });

        builder.addCase(fetchTestsForCourseThunk.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        builder.addCase(fetchMyAttemptsThunk.pending, (state) => {
            state.loading = true;
            state.error = null;
            });

            builder.addCase(fetchMyAttemptsThunk.fulfilled, (state, action) => {
            state.loading = false;
            state.myAttempts = action.payload;
            });

            builder.addCase(fetchMyAttemptsThunk.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
            });
    },
});

// --------------------------------------------------
// Exportăm acțiunile și reducerul
// --------------------------------------------------

export const {
    selectAnswer,
    nextQuestion,
    prevQuestion,
    resetTestState,
} = takeTestSlice.actions;

export default takeTestSlice.reducer;

import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  GenerateTestPayload,
  QuestionType,
  TestEditPayload,
  TestEntity,
  TestQuestion,
} from "@/lib/tests/types";
import {
  apiGenerateAndInjectQuestions,
  apiGetQuestionsForTest,
  apiGetTestForLesson,
  apiPublishTest,
  apiSaveDraftTest,
} from "@/lib/tests/api";

interface TestDraftState {
  test: TestEntity | null;
  questions: TestQuestion[];
  deletedQuestionIds: number[];
  isLoading: boolean;
  isGenerating: boolean;
  isSaving: boolean;
  isPublishing: boolean;
  error: string | null;
  lastInjectionMessage: string | null;
}

interface GenerateQuestionsThunkPayload {
  lessonId: string;
  payload: GenerateTestPayload;
}

interface SaveDraftThunkPayload {
  lessonId: string;
  test: TestEditPayload;
}

const initialState: TestDraftState = {
  test: null,
  questions: [],
  deletedQuestionIds: [],
  isLoading: false,
  isGenerating: false,
  isSaving: false,
  isPublishing: false,
  error: null,
  lastInjectionMessage: null,
};

function getErrorMessage(err: unknown, fallback: string) {
  return err instanceof Error ? err.message : fallback;
}

function makeClientId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function makeEmptyQuestion(questionType: QuestionType = "SINGLE_CHOICE"): TestQuestion {
  const isTrueFalse = questionType === "TRUE_FALSE";
  const labels = isTrueFalse ? ["True", "False"] : ["Option 1", "Option 2", "Option 3", "Option 4"];

  return {
    clientId: makeClientId("question"),
    questionType,
    content: "",
    options: labels.map((label, index) => ({
      clientId: makeClientId(`option-${index + 1}`),
      text: label,
      displayOrder: index + 1,
      isCorrect: index === 0,
    })),
  };
}

export const loadLessonTestDraftThunk = createAsyncThunk(
  "testDraft/loadLessonTest",
  async (lessonId: string, { rejectWithValue }) => {
    try {
      const test = await apiGetTestForLesson(lessonId);
      const questions = test ? await apiGetQuestionsForTest(test.id) : [];
      return { test, questions };
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err, "Failed to load test."));
    }
  }
);

export const generateQuestionsThunk = createAsyncThunk(
  "testDraft/generateQuestions",
  async ({ lessonId, payload }: GenerateQuestionsThunkPayload, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { testDraft: TestDraftState };
      const testId = state.testDraft.test?.id;
      const data = await apiGenerateAndInjectQuestions(lessonId, payload, testId);
      return {
        test: data.test,
        questions: data.questions,
        message: `${data.injection.injectedCount} AI question${
          data.injection.injectedCount === 1 ? "" : "s"
        } added.`,
      };
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err, "Failed to generate AI questions."));
    }
  }
);

export const saveDraftThunk = createAsyncThunk(
  "testDraft/saveDraft",
  async (payload: SaveDraftThunkPayload, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { testDraft: TestDraftState };
      const data = await apiSaveDraftTest({
        lessonId: payload.lessonId,
        testId: state.testDraft.test?.id,
        test: payload.test,
        questions: state.testDraft.questions,
        deletedQuestionIds: state.testDraft.deletedQuestionIds,
      });
      return data;
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err, "Failed to save draft."));
    }
  }
);

export const publishDraftThunk = createAsyncThunk(
  "testDraft/publishDraft",
  async (payload: SaveDraftThunkPayload, { dispatch, rejectWithValue }) => {
    try {
      const saved = await dispatch(saveDraftThunk(payload)).unwrap();
      const published = await apiPublishTest(saved.test.id);
      const questions = await apiGetQuestionsForTest(published.id);
      return { test: published, questions };
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err, "Failed to publish test."));
    }
  }
);

const testDraftSlice = createSlice({
  name: "testDraft",
  initialState,
  reducers: {
    resetDraft() {
      return initialState;
    },
    updateQuestionText(state, action: PayloadAction<{ qId: string; newText: string }>) {
      const question = state.questions.find((item) => item.clientId === action.payload.qId);
      if (question) question.content = action.payload.newText;
    },
    updateQuestionType(state, action: PayloadAction<{ qId: string; questionType: QuestionType }>) {
      const question = state.questions.find((item) => item.clientId === action.payload.qId);
      if (!question) return;

      question.questionType = action.payload.questionType;
      if (action.payload.questionType === "TRUE_FALSE") {
        question.options = ["True", "False"].map((label, index) => ({
          clientId: makeClientId(`option-${index + 1}`),
          text: label,
          displayOrder: index + 1,
          isCorrect: index === 0,
        }));
      } else if (action.payload.questionType === "SINGLE_CHOICE") {
        const firstCorrectIndex = question.options.findIndex((option) => option.isCorrect);
        question.options.forEach((option, index) => {
          option.isCorrect = index === (firstCorrectIndex >= 0 ? firstCorrectIndex : 0);
        });
      }
    },
    updateOptionText(
      state,
      action: PayloadAction<{ qId: string; optId: string; newText: string }>
    ) {
      const question = state.questions.find((item) => item.clientId === action.payload.qId);
      const option = question?.options.find((item) => item.clientId === action.payload.optId);
      if (option) option.text = action.payload.newText;
    },
    toggleCorrectOption(state, action: PayloadAction<{ qId: string; optId: string }>) {
      const question = state.questions.find((item) => item.clientId === action.payload.qId);
      if (!question) return;

      question.options.forEach((option) => {
        if (question.questionType === "MULTI_CHOICE") {
          if (option.clientId === action.payload.optId) {
            option.isCorrect = !option.isCorrect;
          }
        } else {
          option.isCorrect = option.clientId === action.payload.optId;
        }
      });
    },
    addOption(state, action: PayloadAction<string>) {
      const question = state.questions.find((item) => item.clientId === action.payload);
      if (!question || question.questionType === "TRUE_FALSE") return;

      question.options.push({
        clientId: makeClientId("option"),
        text: `Option ${question.options.length + 1}`,
        displayOrder: question.options.length + 1,
        isCorrect: false,
      });
    },
    deleteOption(state, action: PayloadAction<{ qId: string; optId: string }>) {
      const question = state.questions.find((item) => item.clientId === action.payload.qId);
      if (!question || question.options.length <= 2) return;

      question.options = question.options
        .filter((option) => option.clientId !== action.payload.optId)
        .map((option, index) => ({ ...option, displayOrder: index + 1 }));

      if (!question.options.some((option) => option.isCorrect)) {
        question.options[0].isCorrect = true;
      }
    },
    deleteQuestion(state, action: PayloadAction<string>) {
      const question = state.questions.find((item) => item.clientId === action.payload);
      if (question?.id !== undefined) {
        state.deletedQuestionIds.push(question.id);
      }
      state.questions = state.questions.filter((item) => item.clientId !== action.payload);
    },
    addManualQuestion(state) {
      state.questions.push(makeEmptyQuestion());
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadLessonTestDraftThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadLessonTestDraftThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.test = action.payload.test;
        state.questions = action.payload.questions;
        state.deletedQuestionIds = [];
      })
      .addCase(loadLessonTestDraftThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(generateQuestionsThunk.pending, (state) => {
        state.isGenerating = true;
        state.error = null;
        state.lastInjectionMessage = null;
      })
      .addCase(generateQuestionsThunk.fulfilled, (state, action) => {
        state.isGenerating = false;
        state.test = action.payload.test;
        state.questions = action.payload.questions;
        state.deletedQuestionIds = [];
        state.lastInjectionMessage = action.payload.message;
      })
      .addCase(generateQuestionsThunk.rejected, (state, action) => {
        state.isGenerating = false;
        state.error = action.payload as string;
      })
      .addCase(saveDraftThunk.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(saveDraftThunk.fulfilled, (state, action) => {
        state.isSaving = false;
        state.test = action.payload.test;
        state.questions = action.payload.questions;
        state.deletedQuestionIds = [];
      })
      .addCase(saveDraftThunk.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string;
      })
      .addCase(publishDraftThunk.pending, (state) => {
        state.isPublishing = true;
        state.error = null;
      })
      .addCase(publishDraftThunk.fulfilled, (state, action) => {
        state.isPublishing = false;
        state.test = action.payload.test;
        state.questions = action.payload.questions;
        state.deletedQuestionIds = [];
      })
      .addCase(publishDraftThunk.rejected, (state, action) => {
        state.isPublishing = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  addManualQuestion,
  addOption,
  deleteOption,
  deleteQuestion,
  resetDraft,
  toggleCorrectOption,
  updateOptionText,
  updateQuestionText,
  updateQuestionType,
} = testDraftSlice.actions;

export default testDraftSlice.reducer;

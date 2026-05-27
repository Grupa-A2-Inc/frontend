import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  DEFAULT_TEST_TIME_LIMIT_SEC,
  GenerateTestPayload,
  MIN_TEST_TIME_LIMIT_SEC,
  QuestionType,
  TestEditPayload,
  TestEntity,
  TestQuestion,
} from "@/lib/tests/types";
import {
  apiCreateLessonTest,
  apiCreateQuestion,
  apiDeleteQuestion,
  apiGenerateAndInjectQuestions,
  apiGetEditableQuestionsForTest,
  apiGetTestForLesson,
  apiPublishTest,
  apiUpdateQuestion,
  apiUpdateTest,
} from "@/lib/tests/api";

interface TestDraftState {
  lessonId: string | null;
  test: TestEntity | null;
  questions: TestQuestion[];
  isLoading: boolean;
  isGenerating: boolean;
  isPreparingTest: boolean;
  isSavingMetadata: boolean;
  isPublishing: boolean;
  savingQuestionIds: string[];
  deletingQuestionIds: string[];
  error: string | null;
  lastInjectionMessage: string | null;
}

interface GenerateQuestionsThunkPayload {
  lessonId: string;
  payload: GenerateTestPayload;
}

const initialState: TestDraftState = {
  lessonId: null,
  test: null,
  questions: [],
  isLoading: false,
  isGenerating: false,
  isPreparingTest: false,
  isSavingMetadata: false,
  isPublishing: false,
  savingQuestionIds: [],
  deletingQuestionIds: [],
  error: null,
  lastInjectionMessage: null,
};

function getErrorMessage(err: unknown, fallback: string) {
  return err instanceof Error ? err.message : fallback;
}

const DEFAULT_OPTION_TEXT_PATTERN = /^option\s+\d+$/i;

function validateQuestion(question: TestQuestion, index: number): string[] {
  const label = `Question ${index + 1}`;
  const errors: string[] = [];
  const emptyOptions: number[] = [];
  const placeholderOptions: number[] = [];

  if (!question.content.trim()) {
    errors.push(`${label}: Question text is required.`);
  }

  question.options.forEach((option, optionIndex) => {
    const text = option.text.trim();
    if (!text) {
      emptyOptions.push(optionIndex + 1);
    } else if (DEFAULT_OPTION_TEXT_PATTERN.test(text)) {
      placeholderOptions.push(optionIndex + 1);
    }
  });

  if (emptyOptions.length > 0) {
    errors.push(`${label}: Option text is required for option(s) ${emptyOptions.join(", ")}.`);
  }
  if (placeholderOptions.length > 0) {
    errors.push(`${label}: Replace the placeholder text in option(s) ${placeholderOptions.join(", ")}.`);
  }
  if (!question.options.some((option) => option.isCorrect)) {
    errors.push(`${label}: Select at least one correct option.`);
  }

  return errors;
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
      const questions = test ? await apiGetEditableQuestionsForTest(test.id) : [];
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

export const ensureLessonTestThunk = createAsyncThunk(
  "testDraft/ensureLessonTest",
  async (lessonId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { testDraft: TestDraftState };
      if (state.testDraft.test) {
        return state.testDraft.test;
      }

      const existingTest = await apiGetTestForLesson(lessonId);
      if (existingTest) {
        return existingTest;
      }

      return apiCreateLessonTest(lessonId, {
        title: "Lesson test",
        description: "",
        timeLimitSec: DEFAULT_TEST_TIME_LIMIT_SEC,
        aiEnabled: false,
      });
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err, "Failed to prepare lesson test."));
    }
  }
);

export const saveTestMetadataThunk = createAsyncThunk(
  "testDraft/saveMetadata",
  async (
    { lessonId, payload }: { lessonId: string; payload: TestEditPayload },
    { getState, rejectWithValue }
  ) => {
    try {
      if (!payload.title.trim()) {
        throw new Error("Test title is required.");
      }
      if ((payload.timeLimitSec ?? 0) < MIN_TEST_TIME_LIMIT_SEC) {
        throw new Error("Time limit must be at least 60 seconds.");
      }

      const state = getState() as { testDraft: TestDraftState };
      const test = state.testDraft.test;

      return test
        ? await apiUpdateTest(test.id, payload)
        : await apiCreateLessonTest(lessonId, payload);
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err, "Failed to save test settings."));
    }
  }
);

export const saveQuestionThunk = createAsyncThunk(
  "testDraft/saveQuestion",
  async (
    payload: { questionClientId: string; lessonId: string },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as { testDraft: TestDraftState };
      const lessonId = payload.lessonId || state.testDraft.lessonId;
      let test = state.testDraft.test;
      const question = state.testDraft.questions.find(
        (item) => item.clientId === payload.questionClientId
      );

      if (!question) {
        throw new Error("Question not found.");
      }

      const questionIndex = state.testDraft.questions.findIndex(
        (item) => item.clientId === payload.questionClientId
      );
      const validationErrors = validateQuestion(question, questionIndex);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(" "));
      }

      if (!test) {
        if (!lessonId) {
          throw new Error("Lesson not found.");
        }
        test = await apiCreateLessonTest(lessonId, {
          title: "Lesson test",
          description: "",
          timeLimitSec: DEFAULT_TEST_TIME_LIMIT_SEC,
          aiEnabled: false,
        });
      }

      const savedQuestion =
        question.id === undefined
          ? await apiCreateQuestion(test.id, question)
          : await apiUpdateQuestion(test.id, question);

      return { questionClientId: payload.questionClientId, question: savedQuestion, test };
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err, "Failed to save question."));
    }
  }
);

export const deleteQuestionThunk = createAsyncThunk(
  "testDraft/deleteQuestion",
  async (questionClientId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { testDraft: TestDraftState };
      const testId = state.testDraft.test?.id;
      const question = state.testDraft.questions.find(
        (item) => item.clientId === questionClientId
      );

      if (!question) {
        throw new Error("Question not found.");
      }

      if (question.id !== undefined) {
        if (!testId) {
          throw new Error("This lesson does not have a test yet.");
        }
        await apiDeleteQuestion(testId, question.id);
      }

      return { questionClientId };
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err, "Failed to delete question."));
    }
  }
);

export const publishDraftThunk = createAsyncThunk(
  "testDraft/publishDraft",
  async (_: void, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { testDraft: TestDraftState };
      const testId = state.testDraft.test?.id;

      if (!testId) {
        throw new Error("This lesson does not have a test yet.");
      }
      if ((state.testDraft.test?.timeLimitSec ?? 0) < MIN_TEST_TIME_LIMIT_SEC) {
        throw new Error("Set a time limit of at least 60 seconds before publishing.");
      }

      const validationErrors = state.testDraft.questions.flatMap((question, index) =>
        validateQuestion(question, index)
      );
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(" "));
      }

      const published = await apiPublishTest(testId);
      const questions = await apiGetEditableQuestionsForTest(published.id);
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
    clearDraftError(state) {
      state.error = null;
    },
    updateQuestionText(state, action: PayloadAction<{ qId: string; newText: string }>) {
      const question = state.questions.find((item) => item.clientId === action.payload.qId);
      if (question) question.content = action.payload.newText;
      state.error = null;
    },
    updateQuestionType(state, action: PayloadAction<{ qId: string; questionType: QuestionType }>) {
      const question = state.questions.find((item) => item.clientId === action.payload.qId);
      if (!question) return;

      state.error = null;
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
      state.error = null;
    },
    toggleCorrectOption(state, action: PayloadAction<{ qId: string; optId: string }>) {
      const question = state.questions.find((item) => item.clientId === action.payload.qId);
      if (!question) return;

      state.error = null;
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

      state.error = null;
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

      state.error = null;
      question.options = question.options
        .filter((option) => option.clientId !== action.payload.optId)
        .map((option, index) => ({ ...option, displayOrder: index + 1 }));

      if (!question.options.some((option) => option.isCorrect)) {
        question.options[0].isCorrect = true;
      }
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
        state.lessonId = action.meta.arg;
        state.test = action.payload.test;
        state.questions = action.payload.questions;
        state.savingQuestionIds = [];
        state.deletingQuestionIds = [];
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
        state.lessonId = action.payload.test.lessonId;
        state.test = action.payload.test;
        state.questions = action.payload.questions;
        state.savingQuestionIds = [];
        state.deletingQuestionIds = [];
        state.lastInjectionMessage = action.payload.message;
      })
      .addCase(generateQuestionsThunk.rejected, (state, action) => {
        state.isGenerating = false;
        state.error = action.payload as string;
      })
      .addCase(ensureLessonTestThunk.pending, (state, action) => {
        state.isPreparingTest = true;
        state.lessonId = action.meta.arg;
        state.error = null;
      })
      .addCase(ensureLessonTestThunk.fulfilled, (state, action) => {
        state.isPreparingTest = false;
        state.lessonId = action.meta.arg;
        state.test = action.payload;
      })
      .addCase(ensureLessonTestThunk.rejected, (state, action) => {
        state.isPreparingTest = false;
        state.error = action.payload as string;
      })
      .addCase(saveTestMetadataThunk.pending, (state) => {
        state.isSavingMetadata = true;
        state.error = null;
      })
      .addCase(saveTestMetadataThunk.fulfilled, (state, action) => {
        state.isSavingMetadata = false;
        state.test = action.payload;
        state.lessonId = action.payload.lessonId;
      })
      .addCase(saveTestMetadataThunk.rejected, (state, action) => {
        state.isSavingMetadata = false;
        state.error = action.payload as string;
      })
      .addCase(saveQuestionThunk.pending, (state, action) => {
        state.savingQuestionIds.push(action.meta.arg.questionClientId);
        state.lessonId = action.meta.arg.lessonId;
        state.error = null;
      })
      .addCase(saveQuestionThunk.fulfilled, (state, action) => {
        state.savingQuestionIds = state.savingQuestionIds.filter(
          (clientId) => clientId !== action.payload.questionClientId
        );
        state.test = action.payload.test;
        state.lessonId = action.payload.test.lessonId;
        const index = state.questions.findIndex(
          (item) => item.clientId === action.payload.questionClientId
        );
        if (index >= 0) {
          state.questions[index] = action.payload.question;
        }
      })
      .addCase(saveQuestionThunk.rejected, (state, action) => {
        state.savingQuestionIds = state.savingQuestionIds.filter(
          (clientId) => clientId !== action.meta.arg.questionClientId
        );
        state.error = action.payload as string;
      })
      .addCase(deleteQuestionThunk.pending, (state, action) => {
        state.deletingQuestionIds.push(action.meta.arg);
        state.error = null;
      })
      .addCase(deleteQuestionThunk.fulfilled, (state, action) => {
        state.deletingQuestionIds = state.deletingQuestionIds.filter(
          (clientId) => clientId !== action.payload.questionClientId
        );
        state.questions = state.questions.filter(
          (item) => item.clientId !== action.payload.questionClientId
        );
      })
      .addCase(deleteQuestionThunk.rejected, (state, action) => {
        state.deletingQuestionIds = state.deletingQuestionIds.filter(
          (clientId) => clientId !== action.meta.arg
        );
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
        state.savingQuestionIds = [];
        state.deletingQuestionIds = [];
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
  clearDraftError,
  deleteOption,
  resetDraft,
  toggleCorrectOption,
  updateOptionText,
  updateQuestionText,
  updateQuestionType,
} = testDraftSlice.actions;

export default testDraftSlice.reducer;

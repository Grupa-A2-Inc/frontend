import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { DraftQuestion, GenerateTestPayload } from "../../lib/tests/types";
import { apiGenerateTest, apiSaveFinalTest } from "../../lib/tests/api";

interface TestDraftState {
  questions: DraftQuestion[];
  isGenerating: boolean;
  isSaving: boolean;
  error: string | null;
  status: "IDLE" | "DRAFT" | "SAVED";
}

const initialState: TestDraftState = {
  questions: [],
  isGenerating: false,
  isSaving: false,
  error: null,
  status: "IDLE",
};

// Asincron
export const generateTestThunk = createAsyncThunk(
  "testDraft/generate",
  async (payload: GenerateTestPayload, { rejectWithValue }) => {
    try {
      const data = await apiGenerateTest(payload);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to generate test");
    }
  }
);

export const saveFinalTestThunk = createAsyncThunk(
  "testDraft/save",
  async (courseId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const questions = state.testDraft.questions;
      await apiSaveFinalTest(courseId, questions);
      return true;
    } catch (err: any) {
      return rejectWithValue("Failed to save final test");
    }
  }
);

// Sincron - Logica de editare

const testDraftSlice = createSlice({
  name: "testDraft",
  initialState,
  reducers: {
    //Modificare text intrebare
    updateQuestionText(state, action: PayloadAction<{ qId: string; newText: string }>) {
      const q = state.questions.find((x) => x.id === action.payload.qId);
      if (q) q.prompt = action.payload.newText;
    },

    //Modificare text varianta raspuns
    updateOptionText(state, action: PayloadAction<{ qId: string; optId: string; newText: string }>) {
      const q = state.questions.find((x) => x.id === action.payload.qId);
      if (q) {
        const opt = q.options.find((o) => o.id === action.payload.optId);
        if (opt) opt.label = action.payload.newText;
      }
    },

    // Bifare varianta corecta (restul false)
    toggleCorrectOption(state, action: PayloadAction<{ qId: string; optId: string }>) {
      const q = state.questions.find((x) => x.id === action.payload.qId);
      if (q) {
        q.options.forEach((opt) => {
          opt.isCorrect = (opt.id === action.payload.optId);
        });
      }
    },

    // Stergere intrebare
    deleteQuestion(state, action: PayloadAction<string>) {
      state.questions = state.questions.filter((q) => q.id !== action.payload);
    },

    //Adaugare intrebare manuala la final
    addManualQuestion(state) {
      const newQ: DraftQuestion = {
        id: `manual-${Date.now()}`,
        prompt: "Scrieți întrebarea aici...",
        options: [
          { id: `opt-${Date.now()}-1`, label: "Varianta 1", isCorrect: true },
          { id: `opt-${Date.now()}-2`, label: "Varianta 2", isCorrect: false },
          { id: `opt-${Date.now()}-3`, label: "Varianta 3", isCorrect: false },
          { id: `opt-${Date.now()}-4`, label: "Varianta 4", isCorrect: false },
        ],
      };
      state.questions.push(newQ);
    },

    // Resetare cand iese de pe pagina
    resetDraft(state) {
      return initialState;
    }
  },
  extraReducers: (builder) => {
    // Generate AI
    builder.addCase(generateTestThunk.pending, (state) => {
      state.isGenerating = true;
      state.error = null;
      state.status = "IDLE";
    });
    builder.addCase(generateTestThunk.fulfilled, (state, action) => {
      state.isGenerating = false;
      state.questions = action.payload;
      state.status = "DRAFT";
    });
    builder.addCase(generateTestThunk.rejected, (state, action) => {
      state.isGenerating = false;
      state.error = action.payload as string;
    });

    // Save Final
    builder.addCase(saveFinalTestThunk.pending, (state) => {
      state.isSaving = true;
      state.error = null;
    });
    builder.addCase(saveFinalTestThunk.fulfilled, (state) => {
      state.isSaving = false;
      state.status = "SAVED";
    });
    builder.addCase(saveFinalTestThunk.rejected, (state, action) => {
      state.isSaving = false;
      state.error = action.payload as string;
    });
  }
});

export const { 
  updateQuestionText, 
  updateOptionText, 
  toggleCorrectOption, 
  deleteQuestion, 
  addManualQuestion,
  resetDraft 
} = testDraftSlice.actions;

export default testDraftSlice.reducer;
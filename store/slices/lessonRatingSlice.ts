import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchWithAuth } from "@/lib/fetchWithAuth"; // Verifică să fie corectă calea

const BASE_URL = "https://api.adaptiveelearning.online/api/v1";

export interface RatingPayload {
  rating: number;
  comment?: string;
}

export interface RatingSummaryResponse {
  lessonId: string;
  lessonTitle: string;
  avgRating: number;
  totalRatings: number;
  belowThreshold?: boolean;
  distribution?: Record<string, number>;
  recentComments?: { rating: number; comment: string; createdAt: string }[];
  myRating: number;
  myComment: string;
}

export const fetchLessonRating = createAsyncThunk(
  "lessonRating/fetchSummary",
  async (lessonId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const token = state.auth.accessToken;
      const response = await fetchWithAuth(`${BASE_URL}/lessons/${lessonId}/ratings/summary`, token);
      
      if (!response.ok) {
        if (response.status === 404) return null; 
        throw new Error("Eroare la preluarea sumarului de rating");
      }
      return await response.json() as RatingSummaryResponse;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const submitLessonRating = createAsyncThunk(
  "lessonRating/submit",
  async ({ lessonId, payload }: { lessonId: string; payload: RatingPayload }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const token = state.auth.accessToken;
      
      const response = await fetchWithAuth(`${BASE_URL}/lessons/${lessonId}/ratings`, token, {
        method: "POST",
       headers: {
          "Content-Type": "application/json", 
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Eroare la trimiterea rating-ului");
      }
      
      return await response.json() as RatingSummaryResponse; 
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const lessonRatingSlice = createSlice({
  name: "lessonRating",
  initialState: {
    summary: null as RatingSummaryResponse | null,
    loading: false,
    submitting: false,
    error: null as string | null,
  },
  reducers: {
    clearRatingState: (state) => {
      state.summary = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLessonRating.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLessonRating.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload;
      })
      .addCase(fetchLessonRating.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
    
      .addCase(submitLessonRating.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(submitLessonRating.fulfilled, (state, action) => {
  state.submitting = false;
  const notaTrimisa = action.meta.arg.payload.rating;
  
  if (!state.summary) {
    state.summary = {
      lessonId: action.meta.arg.lessonId,
      lessonTitle: "",
      avgRating: notaTrimisa,
      totalRatings: 1,
      myRating: notaTrimisa,
      myComment: "",
    };
  } else {
    state.summary.myRating = notaTrimisa;
    state.summary.totalRatings += 1;
  }
})
.addCase(submitLessonRating.rejected, (state, action) => {
  state.submitting = false;
  state.error = action.payload as string;

});
  }
});

export const { clearRatingState } = lessonRatingSlice.actions;
export default lessonRatingSlice.reducer; 
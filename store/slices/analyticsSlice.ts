import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { ENDPOINTS } from "@/lib/api-endpoints";
import { API_BASE } from "@/lib/config";
import { StudentCourseStats, TeacherCatalogResponse } from "@/lib/analytics/types";
import type { RootState } from "@/store";

function getErrorMessage(err: unknown, fallback: string) {
  return err instanceof Error ? err.message : fallback;
}

export const fetchStudentCourseStats = createAsyncThunk(
  "analytics/fetchStudentCourseStats",
  async (courseId: string, { getState, rejectWithValue }) => {
    try {
      const token = (getState() as RootState).auth.accessToken;
      const response = await fetchWithAuth(`${API_BASE}${ENDPOINTS.students.myCourseStats(courseId)}`, token);
      
      if (!response.ok) throw new Error("Eroare la preluarea datelor studentului");
      return await response.json() as StudentCourseStats;
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err, "Eroare la preluarea datelor studentului"));
    }
  }
);


export const fetchTeacherCatalog = createAsyncThunk(
  "analytics/fetchTeacherCatalog",
  async (
    { courseId, page = 0, size = 10 }: { courseId: string; page?: number; size?: number },
    { getState, rejectWithValue },
  ) => {
    try {
      const token = (getState() as RootState).auth.accessToken;
      const url = `${API_BASE}${ENDPOINTS.courses.analyticsStudentAverages(courseId)}?page=${page}&size=${size}`;
      
      const response = await fetchWithAuth(url, token);
      if (!response.ok) throw new Error("Eroare la preluarea catalogului");
      
      return await response.json() as TeacherCatalogResponse;
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err, "Eroare la preluarea catalogului"));
    }
  }
);

const analyticsSlice = createSlice({
  name: "analytics",
  initialState: {
    studentStats: null as StudentCourseStats | null,
    teacherCatalog: null as TeacherCatalogResponse | null,
    loading: false,
    error: null as string | null,
  },
  reducers: {
    
    clearAnalyticsError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      
      .addCase(fetchStudentCourseStats.pending, (state) => { 
        state.loading = true; 
        state.error = null;
      })
      .addCase(fetchStudentCourseStats.fulfilled, (state, action) => {
        state.loading = false;
        state.studentStats = action.payload;
      })
      .addCase(fetchStudentCourseStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchTeacherCatalog.pending, (state) => { 
        state.loading = true; 
        state.error = null;
      })
      .addCase(fetchTeacherCatalog.fulfilled, (state, action) => {
        state.loading = false;
        state.teacherCatalog = action.payload;
      })
      .addCase(fetchTeacherCatalog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearAnalyticsError } = analyticsSlice.actions;
export default analyticsSlice.reducer;

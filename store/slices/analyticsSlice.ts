import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { StudentCourseStats, TeacherCatalogResponse } from "@/lib/analytics/types";

const BASE_URL = "https://api.adaptiveelearning.online/api/v1";


export const fetchStudentCourseStats = createAsyncThunk(
  "analytics/fetchStudentCourseStats",
  async (courseId: string, { getState, rejectWithValue }) => {
    try {
      const token = (getState() as any).auth.accessToken;
      const response = await fetchWithAuth(`${BASE_URL}/students/me/courses/${courseId}/stats`, token);
      
      if (!response.ok) throw new Error("Eroare la preluarea datelor studentului");
      return await response.json() as StudentCourseStats;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);


export const fetchTeacherCatalog = createAsyncThunk(
  "analytics/fetchTeacherCatalog",
  async ({ courseId, page = 0 }: { courseId: string; page?: number }, { getState, rejectWithValue }) => {
    try {
      const token = (getState() as any).auth.accessToken;
      const url = `${BASE_URL}/courses/${courseId}/analytics/student-averages?page=${page}&size=10`;
      
      const response = await fetchWithAuth(url, token);
      if (!response.ok) throw new Error("Eroare la preluarea catalogului");
      
      return await response.json() as TeacherCatalogResponse;
    } catch (err: any) {
      return rejectWithValue(err.message);
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
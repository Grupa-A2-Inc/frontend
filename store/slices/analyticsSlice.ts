import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { EnrolledCourseDto, StudentCourseAnalyticsDto } from '@/lib/analytics/types';

interface AnalyticsState {
  coursesProgress: EnrolledCourseDto[];
  selectedCourseAnalytics: StudentCourseAnalyticsDto | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AnalyticsState = {
  coursesProgress: [],
  selectedCourseAnalytics: null,
  isLoading: false,
  error: null,
};

export const fetchStudentProgress = createAsyncThunk(
  'analytics/fetchStudentProgress',
  async (studentId: string, { rejectWithValue, getState }) => {
    try {
        const state = getState() as any;
        const token = state.auth.accessToken; 
    
        const baseUrl = "https://api.adaptiveelearning.online";
        const url = `${baseUrl}/api/v1/students/${studentId}/courses-progress`;
      

        const response = await fetchWithAuth(
            url,           
            token,
            { method: 'GET' }
        );
      
      if (!response.ok) {
        return rejectWithValue(`Eroare ${response.status}`);
      }
      
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCourseAnalytics = createAsyncThunk(
  'analytics/fetchCourseAnalytics',
  async ({ studentId, courseId }: { studentId: string; courseId: string }, { rejectWithValue, getState }) => {
    try {
      const state = getState() as any;
      const token = state.auth.accessToken; 

      const baseUrl = "https://api.adaptiveelearning.online";
      const url = `${baseUrl}/api/v1/students/${studentId}/courses/${courseId}/stats`;

      const response = await fetchWithAuth(url, token, { method: 'GET' });
      
      if (!response.ok) return rejectWithValue('Failed to fetch course stats');
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    clearSelectedAnalytics: (state) => {
      state.selectedCourseAnalytics = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudentProgress.pending, (state) => { state.isLoading = true; })
      .addCase(fetchStudentProgress.fulfilled, (state, action) => {
        state.isLoading = false;
        state.coursesProgress = action.payload;
      })
      .addCase(fetchStudentProgress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchCourseAnalytics.fulfilled, (state, action) => {
        state.selectedCourseAnalytics = action.payload;
      });
  },
});

export const { clearSelectedAnalytics } = analyticsSlice.actions;
export default analyticsSlice.reducer;
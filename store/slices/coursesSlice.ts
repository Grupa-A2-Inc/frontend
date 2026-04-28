import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_URL = "https://backend-for-render-ws6z.onrender.com";

export type CourseStatus = "DRAFT" | "PUBLISHED" | "HIDDEN";

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  status: CourseStatus;
  visibility: string;
  createdBy: string;
}
interface CoursesState {
  courses: Course[];
  loading: boolean;
  error: string | null;
}
const initialState: CoursesState = {
  courses: [],
  loading: false,
  error: null,
};

export const fetchCourses = createAsyncThunk(
  "courses/fetchCourses",
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/api/v1/courses/my-courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const err = await response.json();
        return rejectWithValue(err.message || "Failed to load courses");
      }
      return await response.json();
    } catch {
      return rejectWithValue("Network error");
    }
  }
);
const coursesSlice = createSlice({
  name: "courses",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourses.pending, (state) => { // starea loading
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => { // normal sau empty 
        state.loading = false;
        state.courses = action.payload;
      })
      .addCase(fetchCourses.rejected, (state, action) => { // eroare
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default coursesSlice.reducer;
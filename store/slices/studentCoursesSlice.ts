import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { StudentCourse } from "@/lib/student-courses/types";
import {
  enrollInCourse,
  fetchPublicCourses,
  fetchMyCourses,
} from "@/lib/student-courses/api";

interface StudentCoursesState {
  myCourses: StudentCourse[];
  publicCourses: StudentCourse[];
  isLoadingMy: boolean;
  isLoadingPublic: boolean;
  enrollingCourseId: string | null;
  error: string | null;
}

const initialState: StudentCoursesState = {
  myCourses: [],
  publicCourses: [],
  isLoadingMy: false,
  isLoadingPublic: false,
  enrollingCourseId: null,
  error: null,
};

export const fetchMyCoursesThunk = createAsyncThunk(
  "studentCourses/fetchMyCourses",
  async (token: string, { rejectWithValue }) => {
    try {
      const data = await fetchMyCourses(token);
      return data.content;
    } catch (err) {
      return rejectWithValue(
        err instanceof Error ? err.message : "Failed to fetch my courses"
      );
    }
  }
);

export const fetchPublicCoursesThunk = createAsyncThunk(
  "studentCourses/fetchPublicCourses",
  async (token: string, { rejectWithValue }) => {
    try {
      const data = await fetchPublicCourses(token);
      return data.content;
    } catch (err) {
      return rejectWithValue(
        err instanceof Error ? err.message : "Failed to fetch public courses"
      );
    }
  }
);

export const enrollInCourseThunk = createAsyncThunk(
  "studentCourses/enrollInCourse",
  async (
    { token, courseId }: { token: string; courseId: string },
    { dispatch, rejectWithValue }
  ) => {
    try {
      await enrollInCourse(token, courseId);
      await Promise.all([
        dispatch(fetchMyCoursesThunk(token)),
        dispatch(fetchPublicCoursesThunk(token)),
      ]);
      return courseId;
    } catch (err) {
      return rejectWithValue(
        err instanceof Error ? err.message : "Failed to enroll in course"
      );
    }
  }
);

const studentCoursesSlice = createSlice({
  name: "studentCourses",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    //activeaza loading
    builder.addCase(fetchMyCoursesThunk.pending, (state) => {
        state.isLoadingMy = true;
        state.error = null;
    })
    //salveaza cursurile in state
    builder.addCase(fetchMyCoursesThunk.fulfilled, (state, action) => {
        state.isLoadingMy = false;
        state.myCourses = action.payload;
    })
    //salveaza eroarea in state
    builder.addCase(fetchMyCoursesThunk.rejected, (state, action) => {
        state.isLoadingMy = false;
        state.error = action.payload as string;
    })
    //activeaza loading
    builder.addCase(fetchPublicCoursesThunk.pending, (state) => {
        state.isLoadingPublic = true;
        state.error = null;
    })
    //salveaza cursurile publice in state
    builder.addCase(fetchPublicCoursesThunk.fulfilled, (state, action) => {
        state.isLoadingPublic = false;
        state.publicCourses = action.payload;
    })
    //salveaza eroarea in state
    builder.addCase(fetchPublicCoursesThunk.rejected, (state, action) => {
        state.isLoadingPublic = false;
        state.error = action.payload as string;
    })
    builder.addCase(enrollInCourseThunk.pending, (state, action) => {
        state.enrollingCourseId = action.meta.arg.courseId;
        state.error = null;
    })
    builder.addCase(enrollInCourseThunk.fulfilled, (state) => {
        state.enrollingCourseId = null;
    })
    builder.addCase(enrollInCourseThunk.rejected, (state, action) => {
        state.enrollingCourseId = null;
        state.error = action.payload as string;
    });
  },
});

export default studentCoursesSlice.reducer;

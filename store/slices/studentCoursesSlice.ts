import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { CoursePaginationMeta, StudentCourse } from "@/lib/student-courses/types";
import {
  enrollInCourse,
  fetchPublicCourses,
  fetchMyCourses,
} from "@/lib/student-courses/api";

const DEFAULT_PAGE_SIZE = 10;

interface StudentCoursesState {
  myCourses: StudentCourse[];
  publicCourses: StudentCourse[];
  myPagination: CoursePaginationMeta;
  publicPagination: CoursePaginationMeta;
  isLoadingMy: boolean;
  isLoadingPublic: boolean;
  enrollingCourseId: string | null;
  error: string | null;
}

const initialPagination: CoursePaginationMeta = {
  totalPages: 0,
  totalElements: 0,
  numberOfElements: 0,
  size: DEFAULT_PAGE_SIZE,
  number: 0,
  first: true,
  last: true,
  empty: true,
};

const initialState: StudentCoursesState = {
  myCourses: [],
  publicCourses: [],
  myPagination: initialPagination,
  publicPagination: initialPagination,
  isLoadingMy: false,
  isLoadingPublic: false,
  enrollingCourseId: null,
  error: null,
};

export const fetchMyCoursesThunk = createAsyncThunk(
  "studentCourses/fetchMyCourses",
  async (
    {
      token,
      page = 0,
      size = DEFAULT_PAGE_SIZE,
    }: { token: string; page?: number; size?: number },
    { rejectWithValue }
  ) => {
    try {
      return await fetchMyCourses(token, page, size);
    } catch (err) {
      return rejectWithValue(
        err instanceof Error ? err.message : "Failed to fetch my courses"
      );
    }
  }
);

export const fetchPublicCoursesThunk = createAsyncThunk(
  "studentCourses/fetchPublicCourses",
  async (
    {
      token,
      page = 0,
      size = DEFAULT_PAGE_SIZE,
    }: { token: string; page?: number; size?: number },
    { rejectWithValue }
  ) => {
    try {
      return await fetchPublicCourses(token, page, size);
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
    {
      token,
      courseId,
      myPage = 0,
      publicPage = 0,
      size = DEFAULT_PAGE_SIZE,
    }: {
      token: string;
      courseId: string;
      myPage?: number;
      publicPage?: number;
      size?: number;
    },
    { dispatch, rejectWithValue }
  ) => {
    try {
      await enrollInCourse(token, courseId);
      await Promise.all([
        dispatch(fetchMyCoursesThunk({ token, page: myPage, size })),
        dispatch(fetchPublicCoursesThunk({ token, page: publicPage, size })),
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
        state.myCourses = action.payload.content;
        state.myPagination = {
          totalPages: action.payload.totalPages,
          totalElements: action.payload.totalElements,
          numberOfElements: action.payload.numberOfElements,
          size: action.payload.size,
          number: action.payload.number,
          first: action.payload.first,
          last: action.payload.last,
          empty: action.payload.empty,
        };
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
        state.publicCourses = action.payload.content;
        state.publicPagination = {
          totalPages: action.payload.totalPages,
          totalElements: action.payload.totalElements,
          numberOfElements: action.payload.numberOfElements,
          size: action.payload.size,
          number: action.payload.number,
          first: action.payload.first,
          last: action.payload.last,
          empty: action.payload.empty,
        };
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

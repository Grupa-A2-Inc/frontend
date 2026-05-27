import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { Course, CourseStatus, Lesson, LessonResource } from "@/lib/courses/types";
import { API_BASE } from "@/lib/config";

// URL-ul backend-ului
const API_URL = API_BASE;

// ---------- Types ----------

export interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface CoursesState {
  courses: Course[];
  currentCourse: Course | null; 
  loading: boolean;
  creating: boolean;
  deleting: string | null;
  error: string | null;
  createError: string | null;
  deleteError: string | null;
  
  // Stare Lesson
  activeLesson: Lesson | null;
  activeLessonResources: LessonResource[];
  isLoadingLesson: boolean;
}

// ---------- Initial state ----------

const initialState: CoursesState = {
  courses: [],
  currentCourse: null,
  loading: false,
  creating: false,
  deleting: null,
  error: null,
  createError: null,
  deleteError: null,
  
  activeLesson: null,
  activeLessonResources: [],
  isLoadingLesson: false,
};

// ---------- Thunks ----------

// Aduce lista simplă de cursuri
export const fetchCourses = createAsyncThunk(
  "courses/fetchCourses",
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(`${API_URL}/api/v1/courses/my-courses`, token);
      if (!response.ok) {
        const err = await response.json();
        return rejectWithValue(err.message || "Failed to load courses");
      }
      const data = await response.json();
      return Array.isArray(data) ? data : (data.content ?? data.courses ?? data.items ?? []);
    } catch {
      return rejectWithValue("Network error");
    }
  }
);

export const fetchCourseDetails = createAsyncThunk(
  "courses/fetchCourseDetails",
  async (payload: { token: string; courseId: string }, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(`${API_URL}/api/v1/courses/${payload.courseId}/full-view`, payload.token);
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        return rejectWithValue(err.message || `Failed to load course details (${response.status})`);
      }
      return await response.json();
    } catch {
      return rejectWithValue("Network error");
    }
  }
);

export const fetchTeachers = createAsyncThunk(
  "courses/fetchTeachers",
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(`${API_URL}/api/v1/users`, token);
      if (!response.ok) {
        const err = await response.json();
        return rejectWithValue(err.message || "Failed to load teachers");
      }
      return await response.json();
    } catch {
      return rejectWithValue("Network error");
    }
  }
);

export const createCourse = createAsyncThunk(
  "courses/createCourse",
  async (
    payload: {
      token: string;
      data: {
        title: string;
        description: string;
        category: string;
        status: CourseStatus;
        teacherId?: string;
      };
    },
    { rejectWithValue }
  ) => {
    try {
      const { token, data } = payload;
      const body: Record<string, unknown> = {
        title: data.title,
        description: data.description,
        category: data.category,
        status: data.status,
        chapters: [],
      };
      if (data.teacherId) body.teacherId = data.teacherId;

      const response = await fetchWithAuth(`${API_URL}/api/v1/courses`, token, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const err = await response.json();
        return rejectWithValue(err.message || "Failed to create course");
      }
      return await response.json();
    } catch {
      return rejectWithValue("Network error");
    }
  }
);

export const deleteCourse = createAsyncThunk(
  "courses/deleteCourse",
  async (payload: { token: string; id: string }, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(`${API_URL}/api/v1/courses/${payload.id}`, payload.token, {
        method: "DELETE",
      });
      if (!response.ok) {
        const err = await response.json();
        return rejectWithValue(err.message || "Failed to delete course");
      }
      return payload.id;
    } catch {
      return rejectWithValue("Network error");
    }
  }
);

export const fetchActiveLessonData = createAsyncThunk(
  "courses/fetchActiveLesson",
  async (payload: { token: string; lessonId: string }, { rejectWithValue }) => {
    try {
      const lessonRes = await fetchWithAuth(`${API_URL}/api/v1/lessons/${payload.lessonId}`, payload.token);
      if (!lessonRes.ok) throw new Error("Failed to load lesson content");
      const lesson = await lessonRes.json();

      let resources = [];
      try {
        const resourcesRes = await fetchWithAuth(`${API_URL}/api/v1/lessons/${payload.lessonId}/resources`, payload.token);
        if (resourcesRes.ok) {
          resources = await resourcesRes.json();
        }
      } catch (e) {
        console.warn("Nu s-au putut încărca resursele lecției", e);
      }

      return { lesson, resources };
    } catch (err) {
      return rejectWithValue(
        err instanceof Error ? err.message : "Eroare la încărcarea lecției"
      );
    }
  }
);

// ---------- Slice ----------

const coursesSlice = createSlice({
  name: "courses",
  initialState,
  reducers: {
    clearCreateError(state) {
      state.createError = null;
    },
    clearDeleteError(state) {
      state.deleteError = null;
    },
    resetCurrentCourse(state) {
      state.currentCourse = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch list
      .addCase(fetchCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchCourseDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourseDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCourse = action.payload;
      })
      .addCase(fetchCourseDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create
      .addCase(createCourse.pending, (state) => {
        state.creating = true;
        state.createError = null;
      })
      .addCase(createCourse.fulfilled, (state, action) => {
        state.creating = false;
        if (action.payload) {
          state.courses.push(action.payload);
        }
      })
      .addCase(createCourse.rejected, (state, action) => {
        state.creating = false;
        state.createError = action.payload as string;
      })

      // Delete
      .addCase(deleteCourse.pending, (state, action) => {
        state.deleting = action.meta.arg.id;
        state.deleteError = null;
      })
      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.deleting = null;
        state.courses = state.courses.filter((c) => c.id !== action.payload);
      })
      .addCase(deleteCourse.rejected, (state, action) => {
        state.deleting = null;
        state.deleteError = action.payload as string;
      })
      
      // Lesson
      .addCase(fetchActiveLessonData.pending, (state) => {
        state.isLoadingLesson = true;
        state.error = null;
      })
      .addCase(fetchActiveLessonData.fulfilled, (state, action) => {
        state.isLoadingLesson = false;
        state.activeLesson = action.payload.lesson;
        state.activeLessonResources = action.payload.resources;
      })
      .addCase(fetchActiveLessonData.rejected, (state, action) => {
        state.isLoadingLesson = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCreateError, clearDeleteError, resetCurrentCourse } = coursesSlice.actions;
export default coursesSlice.reducer;

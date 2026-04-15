import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_URL = "https://backend-for-render-ws6z.onrender.com";

// ---------- Types ----------

export type CourseStatus = "DRAFT" | "PUBLISHED";
export type CourseVisibility = "PRIVATE" | "PUBLIC";

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  status: CourseStatus;
  visibility: CourseVisibility;
  createdBy: string;
}

export interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface ClassesState {
  courses: Course[];
  teachers: Teacher[];
  loading: boolean;
  creating: boolean;
  deleting: string | null;   // holds the id being deleted
  error: string | null;
  createError: string | null;
  deleteError: string | null;
}

// ---------- Initial state ----------

const initialState: ClassesState = {
  courses: [],
  teachers: [],
  loading: false,
  creating: false,
  deleting: null,
  error: null,
  createError: null,
  deleteError: null,
};

// ---------- Thunks ----------

export const fetchCourses = createAsyncThunk(
  "classes/fetchCourses",
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/api/courses/my-courses`, {
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

export const fetchTeachers = createAsyncThunk(
  "classes/fetchTeachers",
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/api/v1/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const err = await response.json();
        return rejectWithValue(err.message || "Failed to load teachers");
      }
      const data = await response.json();
      return data.filter((u: any) => u.roleName === "TEACHER");
    } catch {
      return rejectWithValue("Network error");
    }
  }
);

export const createCourse = createAsyncThunk(
  "classes/createCourse",
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

      const response = await fetch(`${API_URL}/api/courses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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
  "classes/deleteCourse",
  async (payload: { token: string; id: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/api/courses/${payload.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${payload.token}` },
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

// ---------- Slice ----------

const classesSlice = createSlice({
  name: "classes",
  initialState,
  reducers: {
    clearCreateError(state) {
      state.createError = null;
    },
    clearDeleteError(state) {
      state.deleteError = null;
    },
  },
  extraReducers: (builder) => {
    builder
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
      .addCase(fetchTeachers.fulfilled, (state, action) => {
        state.teachers = action.payload;
      })
      .addCase(createCourse.pending, (state) => {
        state.creating = true;
        state.createError = null;
      })
      .addCase(createCourse.fulfilled, (state) => {
        state.creating = false;
      })
      .addCase(createCourse.rejected, (state, action) => {
        state.creating = false;
        state.createError = action.payload as string;
      })
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
      });
  },
});

export const { clearCreateError, clearDeleteError } = classesSlice.actions;
export default classesSlice.reducer;
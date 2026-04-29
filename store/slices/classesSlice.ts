import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Student } from "@/lib/classes/types";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

const API_URL = "https://backend-for-render-ws6z.onrender.com";

// ---------- Types ----------

export interface Classroom {
  id: string;
  name: string;
  grade: string;
  description: string;
  teacherId?: string;
  teacherName?: string;
  studentCount: number;
  createdAt: string;
}

export interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface ClassesState {
  classrooms: Classroom[];
  teachers: Teacher[];
  loading: boolean;
  creating: boolean;
  updating: string | null;
  deleting: string | null;
  error: string | null;
  createError: string | null;
  updateError: string | null;
  currentClass: Classroom | null;
  currentClassStudents: Student[];
  currentClassLoading: boolean;
  currentClassError: string | null;
}

// ---------- Initial state ----------

const initialState: ClassesState = {
  classrooms: [],
  teachers: [],
  loading: false,
  creating: false,
  updating: null,
  deleting: null,
  error: null,
  createError: null,
  updateError: null,
  currentClass: null,
  currentClassStudents: [],
  currentClassLoading: false,
  currentClassError: null,
};

// ---------- Thunks ----------

export const fetchClassrooms = createAsyncThunk(
  "classes/fetchClassrooms",
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(`${API_URL}/api/v1/classrooms`, token);
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        return rejectWithValue(err.message || "Failed to load classrooms");
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
      const response = await fetchWithAuth(`${API_URL}/api/v1/users/organization`, token);
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        return rejectWithValue(err.message || "Failed to load teachers");
      }
      const data = await response.json();
      return data.filter((u: any) => u.roleName === "TEACHER" || u.role === "TEACHER");
    } catch {
      return rejectWithValue("Network error");
    }
  }
);

export const createClassroom = createAsyncThunk(
  "classes/createClassroom",
  async (
    payload: {
      token: string;
      data: { name: string; grade: string; description: string; teacherId?: string };
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetchWithAuth(`${API_URL}/api/v1/classrooms`, payload.token, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload.data),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        return rejectWithValue(err.message || "Failed to create classroom");
      }
      return await response.json();
    } catch {
      return rejectWithValue("Failed to create classroom.");
    }
  }
);

export const updateClassroom = createAsyncThunk(
  "classes/updateClassroom",
  async (
    payload: {
      token: string;
      id: string;
      data: { name: string; grade: string; description: string; teacherId?: string };
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetchWithAuth(`${API_URL}/api/v1/classrooms/${payload.id}`, payload.token, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload.data),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        return rejectWithValue(err.message || "Failed to update classroom");
      }
      return await response.json();
    } catch {
      return rejectWithValue("Failed to update classroom.");
    }
  }
);

export const deleteClassroom = createAsyncThunk(
  "classes/deleteClassroom",
  async (payload: { token: string; id: string }, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(`${API_URL}/api/v1/classrooms/${payload.id}`, payload.token, {
        method: "DELETE",
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        return rejectWithValue(err.message || "Failed to delete classroom");
      }
      return payload.id;
    } catch {
      return rejectWithValue("Failed to delete classroom.");
    }
  }
);

export const fetchSingleClass = createAsyncThunk(
  "classes/fetchSingleClass",
  async (payload: { token: string; classId: string }, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(`${API_URL}/api/v1/classrooms/${payload.classId}`, payload.token);
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        return rejectWithValue(err.message || "Failed to load class details");
      }
      return await response.json();
    } catch {
      return rejectWithValue("Network error");
    }
  }
);

export const fetchClassStudents = createAsyncThunk(
  "classes/fetchClassStudents",
  async (payload: { token: string; classId: string }, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(
        `${API_URL}/api/v1/classrooms/${payload.classId}/members`,
        payload.token,
      );
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        return rejectWithValue(err.message || "Failed to load students");
      }
      return await response.json();
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
    clearUpdateError(state) {
      state.updateError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClassrooms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClassrooms.fulfilled, (state, action) => {
        state.loading = false;
        state.classrooms = action.payload;
      })
      .addCase(fetchClassrooms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchTeachers.fulfilled, (state, action) => {
        state.teachers = action.payload;
      })
      .addCase(createClassroom.pending, (state) => {
        state.creating = true;
        state.createError = null;
      })
      .addCase(createClassroom.fulfilled, (state, action) => {
        state.creating = false;
        state.classrooms.push(action.payload);
      })
      .addCase(createClassroom.rejected, (state, action) => {
        state.creating = false;
        state.createError = action.payload as string;
      })
      .addCase(updateClassroom.pending, (state, action) => {
        state.updating = action.meta.arg.id;
        state.updateError = null;
      })
      .addCase(updateClassroom.fulfilled, (state, action) => {
        state.updating = null;
        const idx = state.classrooms.findIndex((c) => c.id === action.payload.id);
        if (idx !== -1) state.classrooms[idx] = action.payload;
      })
      .addCase(updateClassroom.rejected, (state, action) => {
        state.updating = null;
        state.updateError = action.payload as string;
      })
      .addCase(deleteClassroom.pending, (state, action) => {
        state.deleting = action.meta.arg.id;
      })
      .addCase(deleteClassroom.fulfilled, (state, action) => {
        state.deleting = null;
        state.classrooms = state.classrooms.filter((c) => c.id !== action.payload);
      })
      .addCase(deleteClassroom.rejected, (state) => {
        state.deleting = null;
      })
      .addCase(fetchSingleClass.pending, (state) => {
        state.currentClassLoading = true;
        state.currentClassError = null;
      })
      .addCase(fetchSingleClass.fulfilled, (state, action) => {
        state.currentClassLoading = false;
        state.currentClass = action.payload;
      })
      .addCase(fetchSingleClass.rejected, (state, action) => {
        state.currentClassLoading = false;
        state.currentClassError = action.payload as string;
      })
      .addCase(fetchClassStudents.fulfilled, (state, action) => {
        state.currentClassStudents = action.payload;
      })
      .addCase(fetchClassStudents.rejected, (state, action) => {
        state.currentClassError = action.payload as string;
      });
  },
});

export const { clearCreateError, clearUpdateError } = classesSlice.actions;
export default classesSlice.reducer;

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Student } from "@/lib/classes/types";

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
  // Nou pt class management
  currentClass: Classroom | null;
  currentClassStudents: Student[];
  currentClassLoading: boolean;
  currentClassError: string | null;
}

// ---------- Mock persistence ----------

const STORAGE_KEY = "mock_classrooms";

const seedClassrooms: Classroom[] = [
  {
    id: "mock-1",
    name: "10th Grade A",
    grade: "10th",
    description: "Main classroom for 10th grade group A",
    studentCount: 28,
    createdAt: new Date().toISOString(),
  },
  {
    id: "mock-2",
    name: "11th Grade B",
    grade: "11th",
    description: "Advanced sciences group",
    studentCount: 24,
    createdAt: new Date().toISOString(),
  },
];

function loadMockClassrooms(): Classroom[] {
  if (typeof window === "undefined") return seedClassrooms;
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) return JSON.parse(saved);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seedClassrooms));
  return seedClassrooms;
}

function saveMockClassrooms(classrooms: Classroom[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(classrooms));
  }
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
  //pt class management
  currentClass: null,
  currentClassStudents: [],
  currentClassLoading: false,
  currentClassError: null,
};

// ---------- Thunks ----------

export const fetchClassrooms = createAsyncThunk(
  "classes/fetchClassrooms",
  async () => {
    await new Promise((r) => setTimeout(r, 300));
    return loadMockClassrooms();
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

export const createClassroom = createAsyncThunk(
  "classes/createClassroom",
  async (
    payload: {
      name: string;
      grade: string;
      description: string;
      studentCount: number;
      teacherId?: string;
      teacherName?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      await new Promise((r) => setTimeout(r, 300));
      const existing = loadMockClassrooms();
      const duplicate = existing.some(
        (c) => c.name.trim().toLowerCase() === payload.name.trim().toLowerCase()
      );
      if (duplicate) return rejectWithValue("A classroom with this name already exists.");

      const newClassroom: Classroom = {
        id: `mock-${Date.now()}`,
        name: payload.name,
        grade: payload.grade,
        description: payload.description,
        teacherId: payload.teacherId,
        teacherName: payload.teacherName,
        studentCount: payload.studentCount,
        createdAt: new Date().toISOString(),
      };
      const updated = [...existing, newClassroom];
      saveMockClassrooms(updated);
      return newClassroom;
    } catch {
      return rejectWithValue("Failed to create classroom.");
    }
  }
);

export const updateClassroom = createAsyncThunk(
  "classes/updateClassroom",
  async (
    payload: {
      id: string;
      name: string;
      grade: string;
      description: string;
      studentCount: number;
      teacherId?: string;
      teacherName?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      await new Promise((r) => setTimeout(r, 300));
      const existing = loadMockClassrooms();
      const duplicate = existing.some(
        (c) => c.id !== payload.id && c.name.trim().toLowerCase() === payload.name.trim().toLowerCase()
      );
      if (duplicate) return rejectWithValue("A classroom with this name already exists.");

      const updated = existing.map((c) =>
        c.id === payload.id
          ? { ...c, name: payload.name, grade: payload.grade, description: payload.description, studentCount: payload.studentCount, teacherId: payload.teacherId, teacherName: payload.teacherName }
          : c
      );
      saveMockClassrooms(updated);
      return updated.find((c) => c.id === payload.id)!;
    } catch {
      return rejectWithValue("Failed to update classroom.");
    }
  }
);

export const deleteClassroom = createAsyncThunk(
  "classes/deleteClassroom",
  async (id: string, { rejectWithValue }) => {
    try {
      await new Promise((r) => setTimeout(r, 200));
      const existing = loadMockClassrooms();
      saveMockClassrooms(existing.filter((c) => c.id !== id));
      return id;
    } catch {
      return rejectWithValue("Failed to delete classroom.");
    }
  }
);

//class management: API calls
export const fetchSingleClass = createAsyncThunk(
  "classes/fetchSingleClass",
  async (payload: { token: string; classId: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/api/v1/classes/${payload.classId}`, {
        headers: { Authorization: `Bearer ${payload.token}` },
      });
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
      const response = await fetch(`${API_URL}/api/v1/classes/${payload.classId}/students`, {
        headers: { Authorization: `Bearer ${payload.token}` },
      });
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
      .addCase(fetchClassrooms.rejected, (state) => {
        state.loading = false;
        state.error = "Failed to load classrooms.";
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
        state.deleting = action.meta.arg;
      })
      .addCase(deleteClassroom.fulfilled, (state, action) => {
        state.deleting = null;
        state.classrooms = state.classrooms.filter((c) => c.id !== action.payload);
      })
      .addCase(deleteClassroom.rejected, (state) => {
        state.deleting = null;
      })
      // Nou pt class management: State updates
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
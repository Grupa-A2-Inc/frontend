import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { API_BASE } from "@/lib/config";
import { ENDPOINTS } from "@/lib/api-endpoints";

const API_URL = "https://api.adaptiveelearning.online";

// ---------- Types ----------

export type UserRole = "ADMIN" | "STUDENT" | "TEACHER" | "ORGANIZATION_ADMIN" | "PARENT";
export type UserStatus = "ACTIVE" | "INACTIVE" | "BLOCKED" | "PENDING";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  organizationId?: string;
}

export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  roleName: UserRole;
  organizationId?: string;
}

export interface UpdateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  organizationId?: string;
}

type UserResponse = User & {
  roleName?: UserRole;
};

export type UserImportResult = {
  email?: string;
  success?: boolean;
  user?: UserResponse;
  errorMessage?: string;
};

export type BulkImportResponse = {
  total?: number;
  succeeded?: number;
  failed?: number;
  results?: UserImportResult[];
};

interface UsersState {
  users: User[];
  loading: boolean;
  error: string | null;
  creating: boolean;
  createError: string | null;
  importing: boolean;
  importError: string | null;
  importResult: BulkImportResponse | null;
}

// ---------- Initial state ----------

const initialState: UsersState = {
  users: [],
  loading: false,
  error: null,
  creating: false,
  createError: null,
  importing: false,
  importError: null,
  importResult: null,
};

async function parseError(response: Response, fallback: string): Promise<string> {
  const data = await response.json().catch(() => null);
  if (typeof data?.message === "string") return data.message;
  if (typeof data?.error === "string") return data.error;
  return `${fallback} (${response.status})`;
}

// ---------- Thunks ----------

export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(`${API_URL}/api/v1/users/organization`, token);
      if (!response.ok) {
        const err = await response.json();
        return rejectWithValue(err.message || "Failed to load users");
      }
      const data = await response.json();
      return Array.isArray(data) ? data : (data.content ?? data.users ?? data.items ?? []);
    } catch {
      return rejectWithValue("Network error");
    }
  }
);

export const createUser = createAsyncThunk(
  "users/createUser",
  async (
    payload: { token: string; data: CreateUserPayload },
    { rejectWithValue }
  ) => {
    try {
      const { email, firstName, lastName, roleName, organizationId } = payload.data;
      const response = await fetchWithAuth(`${API_URL}/api/v1/users`, payload.token, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, firstName, lastName, roleName, organizationId }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        return rejectWithValue(err.message || "Failed to create user");
      }
      return await response.json();
    } catch {
      return rejectWithValue("Network error");
    }
  }
);

export async function uploadUsersCsv(token: string, file: File): Promise<BulkImportResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetchWithAuth(`${API_BASE}${ENDPOINTS.users.importCsv}`, token, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await parseError(response, "Failed to import CSV"));
  }

  return (await response.json()) as BulkImportResponse;
}

export const updateUser = createAsyncThunk(
  "users/updateUser",
  async (
    payload: { token: string; userId: string; data: UpdateUserPayload },
    { rejectWithValue }
  ) => {
    try {
      const { firstName, lastName, email, organizationId } = payload.data;
      const response = await fetchWithAuth(`${API_URL}/api/v1/users/${payload.userId}`, payload.token, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ firstName, lastName, email, organizationId }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        return rejectWithValue(err.message || "Failed to update user");
      }
      // 204 — no body, synthesise the updated fields
      return { firstName, lastName, email, id: payload.userId };
    } catch {
      return rejectWithValue("Network error");
    }
  }
);

export const toggleUserStatus = createAsyncThunk(
  "users/toggleUserStatus",
  async (
    payload: { token: string; userId: string; status: UserStatus },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetchWithAuth(`${API_URL}/api/v1/users/${payload.userId}/status`, payload.token, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: payload.status }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        return rejectWithValue(err.message || "Failed to update status");
      }
      return null; // 204 no content — reducer uses meta.arg
    } catch {
      return rejectWithValue("Network error");
    }
  }
);

export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (
    payload: { token: string; userId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetchWithAuth(`${API_URL}/api/v1/users/${payload.userId}`, payload.token, {
        method: "DELETE",
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        return rejectWithValue(err.message || "Failed to delete user");
      }
      return payload.userId; // 204 no content
    } catch {
      return rejectWithValue("Network error");
    }
  }
);

// ---------- Slice ----------

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearCreateError(state) {
      state.createError = null;
    },
    importUsersCsvStarted(state) {
      state.importing = true;
      state.importError = null;
      state.importResult = null;
    },
    importUsersCsvSucceeded(state, action: PayloadAction<BulkImportResponse>) {
      state.importing = false;
      state.importResult = action.payload;
    },
    importUsersCsvFailed(state, action: PayloadAction<string>) {
      state.importing = false;
      state.importError = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = (action.payload as UserResponse[]).map((u) => ({
          ...u,
          role: u.roleName ?? u.role,
        }));
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createUser.pending, (state) => {
        state.creating = true;
        state.createError = null;
      })
      .addCase(createUser.fulfilled, (state) => {
        state.creating = false;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.creating = false;
        state.createError = action.payload as string;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.users = state.users.map((u) =>
          u.id === action.payload.id ? { ...u, ...action.payload } : u
        );
      })
      .addCase(toggleUserStatus.fulfilled, (state, action) => {
        const { userId, status } = action.meta.arg;
        const idx = state.users.findIndex((u) => u.id === userId);
        if (idx !== -1) state.users[idx] = { ...state.users[idx], status };
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u.id !== action.payload);
      });
  },
});

export const {
  clearCreateError,
  importUsersCsvStarted,
  importUsersCsvSucceeded,
  importUsersCsvFailed,
} = usersSlice.actions;
export default usersSlice.reducer;

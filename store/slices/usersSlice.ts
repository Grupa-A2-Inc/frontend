import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

const API_URL = "https://api.adaptiveelearning.online";

// ---------- Types ----------

export type UserRole = "STUDENT" | "TEACHER" | "ORGANIZATION_ADMIN";
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

interface UsersState {
  users: User[];
  loading: boolean;
  error: string | null;
  creating: boolean;
  createError: string | null;
}

// ---------- Initial state ----------

const initialState: UsersState = {
  users: [],
  loading: false,
  error: null,
  creating: false,
  createError: null,
};

// ---------- Thunks ----------

export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/api/v1/users/organization`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
      const response = await fetch(`${API_URL}/api/v1/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${payload.token}`,
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

export const updateUser = createAsyncThunk(
  "users/updateUser",
  async (
    payload: { token: string; userId: string; data: UpdateUserPayload },
    { rejectWithValue }
  ) => {
    try {
      const { firstName, lastName, email, organizationId } = payload.data;
      const response = await fetch(`${API_URL}/api/v1/users/${payload.userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${payload.token}`,
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
      const response = await fetch(`${API_URL}/api/v1/users/${payload.userId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${payload.token}`,
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
      const response = await fetch(`${API_URL}/api/v1/users/${payload.userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${payload.token}` },
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
    addUsersLocally(state, action: PayloadAction<User[]>) {
      state.users.push(...action.payload);
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
        state.users = action.payload.map((u: any) => ({
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

export const { clearCreateError, addUsersLocally } = usersSlice.actions;
export default usersSlice.reducer;
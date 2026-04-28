import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

const API_URL = "https://backend-for-render-ws6z.onrender.com";

// ---------- Types ----------

export type UserRole = "STUDENT" | "TEACHER" | "ORGANIZATION_ADMIN";
export type UserStatus = "ACTIVE" | "INACTIVE";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}

export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  roleName?: string;
  organizationId?: string;
}

export interface UpdateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
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
      const response = await fetchWithAuth(`${API_URL}/api/v1/users`, token);
      if (!response.ok) {
        const err = await response.json();
        return rejectWithValue(err.message || "Failed to load users");
      }
      return await response.json();
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
      const response = await fetchWithAuth(`${API_URL}/api/v1/users`, payload.token, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload.data),
      });
      if (!response.ok) {
        const err = await response.json();
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
      const response = await fetch(`${API_URL}/api/v1/users/${payload.userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${payload.token}`,
        },
        body: JSON.stringify(payload.data),
      });
      if (!response.ok) {
        const err = await response.json();
        return rejectWithValue(err.message || "Failed to update user");
      }
      return { ...payload.data, id: payload.userId };
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: payload.status }),
      });
      if (!response.ok) {
        const err = await response.json();
        return rejectWithValue(err.message || "Failed to update status");
      }
      return await response.json();
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
        const err = await response.json();
        return rejectWithValue(err.message || "Failed to delete user");
      }
      return payload.userId;
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
        const updated = action.payload;
        state.users = state.users.map((u) =>
          u.id === updated.id ? updated : u
        );
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u.id !== action.payload);
      });
  },
});

export const { clearCreateError, addUsersLocally } = usersSlice.actions;
export default usersSlice.reducer;
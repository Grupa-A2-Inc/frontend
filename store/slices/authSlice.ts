import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { loginUser, registerOrganization } from "@/lib/mockApi";
import type { LoginPayload, RegisterOrgPayload } from "@/lib/mockApi";

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserRole = "ADMIN" | "TEACHER" | "STUDENT";
export type UserStatus = "ACTIVE" | "INACTIVE";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  organizationId: string;
  profilePicture?: string;
  classId?: string; // students only
}

export interface Organization {
  id: string;
  name: string;
  type: string;
  country: string;
  city: string;
}

interface AuthState {
  user: User | null;
  organization: Organization | null;
  accessToken: string | null; // in-memory only, never persisted
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// ─── Initial state ────────────────────────────────────────────────────────────

const initialState: AuthState = {
  user: null,
  organization: null,
  accessToken: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const login = createAsyncThunk(
  "auth/login",
  async (payload: LoginPayload, { rejectWithValue }) => {
    try {
      return await loginUser(payload);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed";
      return rejectWithValue(message);
    }
  }
);

export const registerOrg = createAsyncThunk(
  "auth/registerOrg",
  async (payload: RegisterOrgPayload, { rejectWithValue }) => {
    try {
      return await registerOrganization(payload);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registration failed";
      return rejectWithValue(message);
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.organization = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError(state) {
      state.error = null;
    },
    // Called by the refresh-token flow when a new access token is issued.
    // The refresh token itself is handled as an HttpOnly cookie by the backend.
    setAccessToken(state, action: PayloadAction<string>) {
      state.accessToken = action.payload;
    },
  },
  extraReducers: (builder) => {
    // login
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.organization = action.payload.organization;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // registerOrg
    builder
      .addCase(registerOrg.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerOrg.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.organization = action.payload.organization;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
      })
      .addCase(registerOrg.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError, setAccessToken } = authSlice.actions;
export default authSlice.reducer;

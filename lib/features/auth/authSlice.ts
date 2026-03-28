import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export type UserRole = "ADMIN" | "TEACHER" | "STUDENT";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  organizationId: string;
  profilePicture?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token:
    typeof window !== "undefined" ? localStorage.getItem("token") : null,
  loading: false,
  error: null,
};

// POST /auth/login
export const login = createAsyncThunk(
  "auth/login",
  async (
    credentials: { email: string; password: string },
    { rejectWithValue }
  ) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"}/auth/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      }
    );
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data.message ?? "Login failed");
    return data as { token: string; user: User };
  }
);

// POST /auth/register-organization
export const registerOrganization = createAsyncThunk(
  "auth/registerOrganization",
  async (
    payload: {
      adminFirstName: string;
      adminLastName: string;
      adminEmail: string;
      adminPassword: string;
      organizationName: string;
      country: string;
      city: string;
      organizationType: string;
      address?: string;
      phoneNumber?: string;
    },
    { rejectWithValue }
  ) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"}/auth/register-organization`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data.message ?? "Registration failed");
    return data as { token: string; user: User };
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.error = null;
      if (typeof window !== "undefined") localStorage.removeItem("token");
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<{ token: string; user: User }>) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        if (typeof window !== "undefined")
          localStorage.setItem("token", action.payload.token);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // registerOrganization
      .addCase(registerOrganization.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerOrganization.fulfilled, (state, action: PayloadAction<{ token: string; user: User }>) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        if (typeof window !== "undefined")
          localStorage.setItem("token", action.payload.token);
      })
      .addCase(registerOrganization.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;

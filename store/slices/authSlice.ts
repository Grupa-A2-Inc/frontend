import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type UserRole = "ORGANIZATION_ADMIN" | "TEACHER" | "STUDENT";

export type UserStatus = "ACTIVE" | "INACTIVE";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  organizationId: string;
  organizationName: string;
  organizationType: string;
  country: string;
  city: string;
  organizationPhoneNumber: string;
  organizationAddress: string;
}

export interface Organization {
  id: string;
  name: string;
  type: string;
  country: string;
  city: string;
  phoneNumber: string;
  address: string;
}

export interface AuthSessionPayload {
  user: User;
  organization: Organization;
  accessToken: string;
}

interface AuthState {
  user: User | null;
  organization: Organization | null;
  accessToken: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  organization: null,
  accessToken: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setSession(state, action: PayloadAction<AuthSessionPayload>) {
      state.user = action.payload.user;
      state.organization = action.payload.organization;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
    },
    clearSession(state) {
      state.user = null;
      state.organization = null;
      state.accessToken = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setSession, clearSession } = authSlice.actions;
export default authSlice.reducer;


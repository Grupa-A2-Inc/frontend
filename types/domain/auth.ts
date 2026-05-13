import type {
  ApiUserRole,
  ApiUserStatus,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UserDataResponse,
} from "@/types/api/generated";

export type UserRole = ApiUserRole;
export type UserStatus = ApiUserStatus;

export type SessionUser = UserDataResponse;

export type AuthSession = {
  user: SessionUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
};

export type LoginCredentials = LoginRequest;
export type RegisterPayload = RegisterRequest;
export type LoginResult = AuthResponse;


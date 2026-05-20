import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { API_BASE } from "@/lib/config";
import { ENDPOINTS } from "@/lib/api-endpoints";

// ---------- Types ----------

export type UserRole = "ADMIN" | "STUDENT" | "TEACHER" | "ORGANIZATION_ADMIN" | "PARENT";
export type UserStatus = "ACTIVE" | "INACTIVE" | "BLOCKED" | "PENDING";
export type UserRoleFilter = "ALL" | UserRole;
export type UserStatusFilter = "ALL" | UserStatus;

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

export type UsersPaginationMeta = {
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
};

type UsersPageResponse = {
  content?: UserResponse[];
  users?: UserResponse[];
  items?: UserResponse[];
  totalElements?: number;
  totalPages?: number;
  number?: number;
  size?: number;
  numberOfElements?: number;
  first?: boolean;
  last?: boolean;
};

export type FetchUsersParams = {
  token: string;
  scope?: "global" | "organization";
  page?: number;
  size?: number;
  search?: string;
  role?: UserRoleFilter;
  status?: UserStatusFilter;
  sortBy?: "firstName" | "lastName" | "email" | "createdAt";
  sortDir?: "asc" | "desc";
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
  pagination: UsersPaginationMeta;
}

// ---------- Initial state ----------

const DEFAULT_USERS_PAGINATION: UsersPaginationMeta = {
  totalElements: 0,
  totalPages: 0,
  number: 0,
  size: 10,
  numberOfElements: 0,
  first: true,
  last: true,
};

const initialState: UsersState = {
  users: [],
  loading: false,
  error: null,
  creating: false,
  createError: null,
  importing: false,
  importError: null,
  importResult: null,
  pagination: DEFAULT_USERS_PAGINATION,
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
  async (params: FetchUsersParams, { rejectWithValue }) => {
    try {
      const {
        token,
        scope = "organization",
        page = 0,
        size = 10,
        search,
        role = "ALL",
        status = "ALL",
        sortBy = "firstName",
        sortDir = "asc",
      } = params;
      const query = new URLSearchParams({
        page: String(Math.max(0, page)),
        size: String(Math.max(1, size)),
        sortBy,
        sortDir,
      });
      const trimmedSearch = search?.trim();
      if (trimmedSearch) query.set("search", trimmedSearch);
      if (role !== "ALL") query.set("role", role);
      if (status !== "ALL") query.set("status", status);

      const endpoint = scope === "global" ? ENDPOINTS.users.list : ENDPOINTS.users.organization;
      const response = await fetchWithAuth(`${API_BASE}${endpoint}?${query.toString()}`, token);
      if (!response.ok) {
        const err = await response.json();
        return rejectWithValue(err.message || "Failed to load users");
      }
      const data = (await response.json()) as UsersPageResponse | UserResponse[];
      const users = Array.isArray(data) ? data : (data.content ?? data.users ?? data.items ?? []);
      const pagination: UsersPaginationMeta = Array.isArray(data)
        ? {
            totalElements: users.length,
            totalPages: users.length > 0 ? 1 : 0,
            number: 0,
            size: users.length || size,
            numberOfElements: users.length,
            first: true,
            last: true,
          }
        : {
            totalElements: data.totalElements ?? users.length,
            totalPages: data.totalPages ?? (users.length > 0 ? 1 : 0),
            number: data.number ?? page,
            size: data.size ?? size,
            numberOfElements: data.numberOfElements ?? users.length,
            first: data.first ?? page <= 0,
            last: data.last ?? (data.totalPages ? page >= data.totalPages - 1 : true),
          };

      return { users, pagination };
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
      const response = await fetchWithAuth(`${API_BASE}${ENDPOINTS.users.list}`, payload.token, {
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
      const response = await fetchWithAuth(`${API_BASE}${ENDPOINTS.users.byId(payload.userId)}`, payload.token, {
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
      const response = await fetchWithAuth(`${API_BASE}${ENDPOINTS.users.status(payload.userId)}`, payload.token, {
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
      const response = await fetchWithAuth(`${API_BASE}${ENDPOINTS.users.byId(payload.userId)}`, payload.token, {
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
        state.users = action.payload.users.map((u) => ({
          ...u,
          role: u.roleName ?? u.role,
        }));
        state.pagination = action.payload.pagination;
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

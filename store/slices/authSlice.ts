import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

// URL-ul backend-ului
const API_URL = "https://backend-for-render-ws6z.onrender.com";

// ---------- Types ----------

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

// Structura organizatiei
export interface Organization {
  id: string;
  name: string;
  type: string;
  country: string;
  city: string;
  phoneNumber: string;
  address: string;
}

// Structura state-ului de autentificare
interface AuthState {
  user: User | null;
  organization: Organization | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// ---------- Initial state ----------
const initialState: AuthState = {
  user: null,
  organization: null,
  accessToken: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};


// ---------- Thunks ----------

// LOGIN
export const login = createAsyncThunk(
  "auth/loginThunk",
  async (
    payload: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      // Trimitem request-ul catre backend
      const response = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        credentials: "include",
        body: JSON.stringify(payload), // trimitem email + password 
      });

      // Daca backend-ul raspunde cu eroare
      if (!response.ok) {
        // Incercam sa parsam JSON, dar daca backend-ul trimite text simplu, prindem eroarea
        try {
          const errorData = await response.json();
          return rejectWithValue(errorData.message || "Login failed");
        } catch {
          return rejectWithValue(`Eroare server: ${response.status}`);
        }
      }

      // Daca login-ul reuseste, extragem datele
      const data = await response.json();

      // Returnam datele catre reducer
      return data;
    } catch (err) {
      return rejectWithValue("Network error");
    }
  }
);

// ---------- Slice  ----------
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Logout - sterge toate datele din state
    logout(state) {
      state.user = null;
      state.organization = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.error = null;

      // Stergem token-ul din cookies pentru proxy
      document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

      // Stergem rolul din cookies
      document.cookie = "role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    },

    // Curatam erorile manual
    clearError(state) {
      state.error = null;
    },

    // Setam un accessToken nou 
    setAccessToken(state, action: PayloadAction<string>) {
      state.accessToken = action.payload;
    },

    // AUTO - LOGIN
    loadUserFromStorage(state) {
      const token = localStorage.getItem("accessToken") ;
      const user = localStorage.getItem("user");

      // Daca nu exista token sau user, nu facem nimic
      if (!token || !user)
        return;

      // Convertim user-ul din string in obiect
      const parsedUser = JSON.parse(user);

      // Restauram datele in Redux
      state.accessToken = token;
      state.user = parsedUser;
      state.isAuthenticated = true;

      // Reconstruim organizatia din campurile useru-ului
      state.organization = {
        id: parsedUser.organizationId,
        name: parsedUser.organizationName,
        type: parsedUser.organizationType,
        country: parsedUser.country,
        city: parsedUser.city,
        phoneNumber: parsedUser.organizationPhoneNumber,
        address: parsedUser.organizationAddress,
      };
    }
  },

  extraReducers: (builder) => {
    // LOGIN - pending
    builder.addCase(login.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    // LOGIN - success
    builder.addCase(login.fulfilled, (state, action) => {
      state.loading = false;

      // Extragem user-ul din raspuns
      state.user = action.payload.user;

      // Reconstruim organization din campurile user-ului
      state.organization = {
        id: action.payload.user.organizationId,
        name: action.payload.user.organizationName,
        type: action.payload.user.organizationType,
        country: action.payload.user.country,
        city: action.payload.user.city,
        phoneNumber: action.payload.user.organizationPhoneNumber,
        address: action.payload.user.organizationAddress,
      };

      // Salvam accessToken-ul
      state.accessToken = action.payload.accessToken;

      // Salvam token-ul si in cookies pentru proxy
      document.cookie = `accessToken=${action.payload.accessToken}; path=/;`;
      // Salvam rolul in cookies pentru proxy
      document.cookie = `role=${action.payload.user.role}; path=/;`;

      localStorage.setItem("accessToken", action.payload.accessToken);
      localStorage.setItem("user", JSON.stringify(action.payload.user));


      // Marcam utilizatorul ca autentificat
      state.isAuthenticated = true;
    });

    // LOGIN - error
    builder.addCase(login.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

// Exportam actiunile 
export const { logout, clearError, setAccessToken, loadUserFromStorage } = 
  authSlice.actions;

// Exportam reducerul
export default authSlice.reducer;
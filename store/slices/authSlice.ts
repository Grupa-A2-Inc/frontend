// Importam utilitatile Redux Toolkit
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Importam serviciul care trimite request-ul catre backend
import { loginService } from "@/features/auth/authService";

// Importam tipurile folosite in Login
import { LoginRequest, LoginResponse, User } from "@/features/auth/authTypes";

// ------------------------------
// Definim forma starii de autentificare
// ------------------------------
interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

// ------------------------------
// Starea initiala
// ------------------------------
const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

// ------------------------------
// Thunk asincron pentru login
// createAsyncThunk gestioneaza automat: pending, fulfilled, rejected
// ------------------------------
export const loginUser = createAsyncThunk<
  LoginResponse,    // tipul valorii returnate la succes
  LoginRequest,   // tipul argumentului primit
  { rejectValue: string }   // tipul erorii returnate
>(
  "auth/login",
  async (data, { rejectWithValue }) => {
    try {
      // Apelam serviciul care trimite request-ul catre backend
      return await loginService(data);
    } catch (err: any) {
      // Daca backend-ul trimite eroare, o returnam catre slice
      return rejectWithValue(err.message);
    }
  }
);

// ------------------------------
// Slice-ul propriu-zis
// ------------------------------
const authSlice = createSlice({
  name: "auth",
  initialState,

  // Reduceri sincrone (ex: logout)
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
    },
  },

  // Reduceri pentru actiunile asincrone (loginUser)
  extraReducers: (builder) => {
    builder 

      // ------------------------------
      // LOGIN - pending
      // ------------------------------
      .addCase(loginUser.pending, (state) => {
        state.loading = true;   // pornim indicatorul de loading
        state.error = null;   // resetam erorile
      })

      // ------------------------------
      // LOGIN - success
      // ------------------------------
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;

        // Salvam user-ul primit de la backend
        state.user = action.payload.user;

        // Salvam token-ul JWT
        state.token = action.payload.access_token;
      })

      // ------------------------------
      // LOGIN - eroare
      // ------------------------------
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;

        // Salvam mesajul de eroare
        state.error = action.payload || "Login failed";
      });
  },
});

// Exportam actiunile sincrone (ex: logout)
export const { logout } = authSlice.actions;

// Exportam reducer-ul pentru a fi folosit in store
export default authSlice.reducer;
import { createSlice } from "@reduxjs/toolkit";
import { loginUser } from "../thunks/authThunks";

// Definim structura stării pentru autentificare.
interface AuthState {
  user: any | null;     
  token: string | null; // token-ul JWT primit de la backend
  loading: boolean; // indică dacă request-ul este în desfășurare
  error: string | null; 
}

// Starea inițială a reducer-ului.
const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null
};

// createSlice generează automat reducer + acțiuni pe baza configurării.
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;

        state.user = action.payload.user;
        state.token = action.payload.token;

        localStorage.setItem("token", action.payload.token);
      })

      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;

        // Mesajele sunt în engleză, conform cerinței tale.
        state.error = action.payload as string;
      });
  }
});

// Exportăm acțiunea logout și reducer-ul.
export const { logout } = authSlice.actions;
export default authSlice.reducer;
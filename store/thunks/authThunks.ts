import { createAsyncThunk } from "@reduxjs/toolkit";

// Definim tipul datelor trimise către backend la login.
interface LoginPayload {
  email: string;
  password: string;
}

// createAsyncThunk generează automat acțiuni pentru pending/fulfilled/rejected.
export const loginUser = createAsyncThunk(
  "auth/login",
  async (data: LoginPayload, { rejectWithValue }) => {
    try {
      // Trimitem request-ul POST către backend-ul tău hostat pe Render.
      const res = await fetch(
        "https://backend-for-render-ws6z.onrender.com/api/v1/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json" // specificăm tipul datelor
          },
          body: JSON.stringify(data) // convertim payload-ul în JSON
        }
      );

      // Dacă backend-ul întoarce status >= 400, extragem mesajul de eroare.
      if (!res.ok) {
        const errorData = await res.json();
        return rejectWithValue(
          errorData.message || "Authentication failed"
        );
      }

      // Dacă totul e ok, convertim răspunsul în JSON.
      const result = await res.json();

      // Returnăm datele către authSlice → fulfilled.
      return result;

    } catch (err) {
      // Dacă fetch-ul eșuează (ex: probleme de rețea)
      return rejectWithValue("Unable to connect to server");
    }
  }
);
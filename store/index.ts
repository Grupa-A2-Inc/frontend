// Importăm configureStore pentru a crea store-ul Redux.
import { configureStore } from "@reduxjs/toolkit";

// Importăm reducer-ul pentru autentificare.
import authReducer from "./slices/authSlice";

// Creăm store-ul principal al aplicației.
export const store = configureStore({
  reducer: {
    auth: authReducer // reducer-ul pentru login/logout
  }
});

// Tipul complet al stării globale.
// RootState este folosit în useSelector pentru a avea autocomplete corect.
export type RootState = ReturnType<typeof store.getState>;

// Tipul pentru dispatch-ul Redux.
// AppDispatch este folosit în useAppDispatch pentru a tipa corect acțiunile.
export type AppDispatch = typeof store.dispatch;
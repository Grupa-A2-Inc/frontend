import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/store/slices/authSlice";

// Store-ul principal Redux Toolkit
export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

// Tipuri derivate din store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

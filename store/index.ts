import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/store/slices/authSlice";
import classesReducer from "@/store/slices/classesSlice";

// Store-ul principal Redux Toolkit
export const store = configureStore({
  reducer: {
    auth: authReducer,
    classes: classesReducer,
  },
});

// Tipuri derivate din store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

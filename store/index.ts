import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/store/slices/authSlice";
import classesReducer from "@/store/slices/classesSlice";
import usersReducer from "@/store/slices/usersSlice";
import coursesReducer from "@/store/slices/coursesSlice";

// Store-ul principal Redux Toolkit
export const store = configureStore({
  reducer: {
    auth: authReducer,
    classes: classesReducer,
    users: usersReducer,
    courses: coursesReducer,
  },
});

// Tipuri derivate din store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

import { configureStore } from "@reduxjs/toolkit";

import authReducer from "@/store/slices/authSlice";
import classesReducer from "@/store/slices/classesSlice";
import usersReducer from "@/store/slices/usersSlice";
import testDraftReducer from "@/store/slices/testDraftSlice";
import courseManagementReducer from "@/store/slices/courseManagementSlice";
import coursesReducer from "@/store/slices/coursesSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    classes: classesReducer,
    users: usersReducer,
    testDraft: testDraftReducer,
    courseManagement: courseManagementReducer,
    courses: coursesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
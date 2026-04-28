import { configureStore } from "@reduxjs/toolkit";

import authReducer from "@/store/slices/authSlice";
import classesReducer from "@/store/slices/classesSlice";
import usersReducer from "@/store/slices/usersSlice";
<<<<<<< HEAD
import testDraftReducer from "@/store/slices/testDraftSlice";
=======
import courseManagementReducer from "@/store/slices/courseManagementSlice";
import coursesReducer from "@/store/slices/coursesSlice";
>>>>>>> 6db640c55172b9d6d43a57d9728ae9253ee62c3a

export const store = configureStore({
  reducer: {
    auth: authReducer,
    classes: classesReducer,
    users: usersReducer,
<<<<<<< HEAD
    testDraft: testDraftReducer,
=======
    courseManagement: courseManagementReducer,
    courses: coursesReducer,
>>>>>>> 6db640c55172b9d6d43a57d9728ae9253ee62c3a
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
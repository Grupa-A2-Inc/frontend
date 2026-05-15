import { configureStore } from "@reduxjs/toolkit";

import { baseApi } from "@/store/api/baseApi";
import authReducer from "@/store/slices/authSlice";
import adaptiveReducer from "@/store/slices/adaptiveSlice";
import customerSupportReducer from "@/store/slices/customerSupportSlice";

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authReducer,
    adaptive: adaptiveReducer,
    customerSupport: customerSupportReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

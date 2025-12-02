import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import requestsReducer from "./requestSlice";
import chatReducer from "./chatSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    requests: requestsReducer,
    chat: chatReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

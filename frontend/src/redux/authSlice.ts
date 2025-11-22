import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { LoginResponse } from "../types/resources";

type AuthState = {
  token: LoginResponse | null;
};

const initialState: AuthState = {
  token: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<LoginResponse>) {
      state.token = action.payload;
    },
    clearToken(state) {
      state.token = null;
    },
  },
});

export const { setCredentials, clearToken } = authSlice.actions;
export default authSlice.reducer;

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type AuthState = {
  token: string | null;
};

const initialState: AuthState = {
  token: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ token: string }>) {
      state.token = action.payload.token;
    },
    clearToken(state) {
      state.token = null;
    },
  },
});

export const { setCredentials, clearToken } = authSlice.actions;
export default authSlice.reducer;

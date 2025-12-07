import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Employee, LoginResponse, Manager } from "../types/resources";

export type User = Employee | Manager;

type AuthState = {
  token: LoginResponse | null;
  user: User | null;
};

const initialState: AuthState = {
  token: null,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // nach /login oder /register
    setCredentials(state, action: PayloadAction<LoginResponse>) {
      state.token = action.payload;
    },
    // nach /me
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },
    clearToken(state) {
      state.token = null;
      state.user = null;
    },
  },
});

export const { setCredentials, clearToken, setUser } = authSlice.actions;
export default authSlice.reducer;

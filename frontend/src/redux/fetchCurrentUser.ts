import { clearToken, setUser } from "@/src/redux/authSlice";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { User } from "../types/resources";

const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export const fetchCurrentUser = createAsyncThunk<
  User | null,
  string,
  { rejectValue: string }
>("auth/fetchCurrentUser", async (token, { dispatch, rejectWithValue }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Unauthorized");
    }

    const data = (await response.json()) as User;

    dispatch(setUser(data));
    return data;
  } catch (err) {
    dispatch(clearToken());
    return rejectWithValue("Unauthorized");
  }
});

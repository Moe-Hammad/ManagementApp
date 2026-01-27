import { clearToken, setUser } from "@/src/redux/authSlice";
import { refreshTokens } from "@/src/services/api";
import { clearTokens } from "@/src/services/authSession";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { User } from "../types/resources";

const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export const fetchCurrentUser = createAsyncThunk<
  User | null,
  string,
  { rejectValue: string }
>("auth/fetchCurrentUser", async (token, { dispatch, rejectWithValue }) => {
  try {
    let response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        const refreshed = await refreshTokens().catch(() => null);
        if (refreshed?.accessToken) {
          response = await fetch(`${API_BASE_URL}/api/auth/me`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${refreshed.accessToken}`,
            },
          });
        }
      }
    }

    if (!response.ok) {
      throw new Error("Unauthorized");
    }

    const data = (await response.json()) as User;

    dispatch(setUser(data));
    return data;
  } catch (err) {
    await clearTokens();
    dispatch(clearToken());
    return rejectWithValue("Unauthorized");
  }
});

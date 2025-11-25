import { clearToken, setUser } from "@/src/redux/authSlice";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { User } from "../../types/resources";

export const fetchCurrentUser = createAsyncThunk<
  User | null,
  string,
  { rejectValue: string }
>("auth/fetchCurrentUser", async (token, { dispatch, rejectWithValue }) => {
  try {
    const response = await fetch("http://192.168.0.128:8080/api/auth/me", {
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

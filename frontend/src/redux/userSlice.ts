// src/redux/userSlice.ts
import { User } from "@/src/types/resources";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";

const API = process.env.EXPO_PUBLIC_BACKEND_URL;

// ===== Thunk: User laden =====
export const fetchUserById = createAsyncThunk<
  User,
  string,
  { state: RootState; rejectValue: string }
>("users/fetchById", async (id, { getState, rejectWithValue }) => {
  try {
    const token = getState().auth.token?.token;

    const response = await fetch(`${API}/api/users/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return rejectWithValue("Failed to fetch user");
    }

    return (await response.json()) as User;
  } catch (err) {
    return rejectWithValue("Network error");
  }
});

// ===== State =====
type UsersState = {
  userMap: Record<string, User>;
  loading: boolean;
  error: string | null;
};

const initialState: UsersState = {
  userMap: {},
  loading: false,
  error: null,
};

// ===== Slice =====
export const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        fetchUserById.fulfilled,
        (state, action: PayloadAction<User>) => {
          state.loading = false;
          state.error = null;
          state.userMap[action.payload.id] = action.payload;
        }
      )
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Unknown error";
      });
  },
});

export default userSlice.reducer;

// ===== Selector =====
export const selectUserById = (state: RootState, id?: string) =>
  id ? state.users.userMap[id] : undefined;

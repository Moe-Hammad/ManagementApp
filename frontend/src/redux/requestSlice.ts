import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  createRequestApi,
  fetchUnassignedEmployees,
  listRequestsForEmployee,
  listRequestsForManager,
  updateRequestStatusApi,
} from "@/src/services/api";
import { RequestItem, RequestStatus, UserRole } from "@/src/types/resources";
import { RootState } from "./store";
import { clearToken } from "./authSlice";

type RequestsState = {
  items: RequestItem[];
  loading: boolean;
  error: string | null;
  unassigned: any[];
};

const initialState: RequestsState = {
  items: [],
  loading: false,
  error: null,
  unassigned: [],
};

export const fetchRequests = createAsyncThunk<
  RequestItem[],
  { userId: string; role: UserRole; token: string }
>("requests/fetch", async ({ userId, role, token }) => {
  if (role === UserRole.MANAGER) {
    return listRequestsForManager(userId, token);
  }
  return listRequestsForEmployee(userId, token);
});

export const createRequest = createAsyncThunk<
  RequestItem,
  { employeeId: string; managerId: string; message?: string; token: string }
>("requests/create", async ({ employeeId, managerId, message, token }) =>
  createRequestApi({ employeeId, managerId, message }, token)
);

export const updateRequestStatus = createAsyncThunk<
  RequestItem,
  { requestId: string; status: RequestStatus; token: string }
>("requests/updateStatus", async ({ requestId, status, token }) =>
  updateRequestStatusApi(requestId, status, token)
);

export const fetchUnassigned = createAsyncThunk<
  any[],
  { query: string; token: string }
>("requests/unassigned", async ({ query, token }) =>
  fetchUnassignedEmployees(query, token)
);

const requestsSlice = createSlice({
  name: "requests",
  initialState,
  reducers: {
    clearRequests: () => initialState,
    upsertRequest(state, action: PayloadAction<RequestItem>) {
      const idx = state.items.findIndex((r) => r.id === action.payload.id);
      if (idx >= 0) {
        state.items[idx] = action.payload;
      } else {
        state.items.unshift(action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Fehler beim Laden";
      })
      .addCase(createRequest.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateRequestStatus.fulfilled, (state, action) => {
        const idx = state.items.findIndex((r) => r.id === action.payload.id);
        if (idx >= 0) {
          state.items[idx] = action.payload;
        }
      })
      .addCase(fetchUnassigned.fulfilled, (state, action) => {
        state.unassigned = action.payload;
      })
      .addCase(clearToken, () => initialState);
  },
});

export const { clearRequests, upsertRequest } = requestsSlice.actions;
export const selectRequests = (state: RootState) => state.requests.items;
export const selectRequestsLoading = (state: RootState) => state.requests.loading;
export const selectUnassigned = (state: RootState) => state.requests.unassigned;

export default requestsSlice.reducer;

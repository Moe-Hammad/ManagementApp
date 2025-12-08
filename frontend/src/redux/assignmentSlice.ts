import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AssignmentStatus, TaskAssignment } from "../types/resources";
import { RootState } from "./store";
import { clearToken } from "./authSlice";

type AssignmentState = {
  items: TaskAssignment[];
};

const initialState: AssignmentState = {
  items: [],
};

const assignmentSlice = createSlice({
  name: "assignments",
  initialState,
  reducers: {
    upsertAssignment(state, action: PayloadAction<TaskAssignment>) {
      const idx = state.items.findIndex((a) => a.id === action.payload.id);
      if (idx >= 0) {
        state.items[idx] = action.payload;
      } else {
        state.items.unshift(action.payload);
      }
    },
    clearAssignments(state) {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(clearToken, () => initialState);
  },
});

export const { upsertAssignment, clearAssignments } = assignmentSlice.actions;
export const selectAssignments = (state: RootState) => state.assignments.items;
export default assignmentSlice.reducer;

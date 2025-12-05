import { useAppDispatch, useAppSelector } from "@/src/hooks/useRedux";
import { upsertAssignment } from "@/src/redux/assignmentSlice";
import { subscribeUserAssignments } from "@/src/services/wsClient";
import { useEffect } from "react";

export function useAssignments() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.token?.token);
  const assignments = useAppSelector((s) => s.assignments.items);

  useEffect(() => {
    if (!token) return;
    const sub = subscribeUserAssignments(
      token,
      (payload) => {
        const dto = payload?.payload ?? payload;
        if (dto) dispatch(upsertAssignment(dto));
      },
      () => {}
    );
    return () => sub.disconnect();
  }, [token, dispatch]);

  return { assignments };
}

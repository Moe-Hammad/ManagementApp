import { useAppDispatch, useAppSelector } from "@/src/hooks/useRedux";
import { upsertAssignment } from "@/src/redux/assignmentSlice";
import { updateAssignmentStatusApi } from "@/src/services/api";
import { subscribeUserAssignments } from "@/src/services/wsClient";
import { AssignmentStatus } from "@/src/types/resources";
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

  const updateStatus = async (id: string, status: AssignmentStatus) => {
    if (!token) return;
    try {
      const updated = await updateAssignmentStatusApi(id, status, token);
      dispatch(upsertAssignment(updated));
      return updated;
    } catch (err: any) {
      alert(err?.message || "Assignment konnte nicht aktualisiert werden.");
      throw err;
    }
  };

  const acceptAssignment = (id: string) =>
    updateStatus(id, AssignmentStatus.ACCEPTED);
  const declineAssignment = (id: string) =>
    updateStatus(id, AssignmentStatus.DECLINED);

  return { assignments, acceptAssignment, declineAssignment };
}

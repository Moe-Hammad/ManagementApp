import { fetchUserById, selectUserById } from "@/src/redux/userSlice";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./useRedux";

export function useUser(userId?: string) {
  const dispatch = useAppDispatch();

  const user = useAppSelector((s) =>
    userId ? selectUserById(s, userId) : undefined
  );

  useEffect(() => {
    if (userId && !user) {
      dispatch(fetchUserById(userId));
    }
  }, [userId, user, dispatch]);

  return user;
}

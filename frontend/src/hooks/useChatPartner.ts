import { fetchUserById, selectUserById } from "@/src/redux/userSlice";
import { ChatRoom } from "@/src/types/resources";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./useRedux";

export function useChatPartner(room: ChatRoom | undefined) {
  const dispatch = useAppDispatch();
  const currentUserId = useAppSelector((s) => s.auth.user?.id);
  const partnerId = room?.memberIds.find((id) => id !== currentUserId);
  const partner = useAppSelector((s) => selectUserById(s, partnerId));

  useEffect(() => {
    if (partnerId && !partner) {
      dispatch(fetchUserById(partnerId));
    }
  }, [partnerId, partner, dispatch]);

  return { partner, partnerId };
}

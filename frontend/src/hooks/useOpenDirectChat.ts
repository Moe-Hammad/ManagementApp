import { createDirectChat } from "@/src/redux/chatSlice";
import { RootState } from "@/src/redux/store";
import { ChatRoom, UserRole } from "@/src/types/resources";
import { useAppDispatch, useAppSelector } from "./useRedux";

/**
 * useOpenDirectChat
 * ---------------------------------------------------------
 * Öffnet (oder erstellt) einen Direkt-Chat zwischen dem
 * aktuell eingeloggten User und targetUserId.
 *
 * - Wenn bereits ein DIRECT-Chat existiert → diesen zurückgeben
 * - Sonst → neuen Chat per createDirectChat anlegen
 *
 * Navigation machst du im aufrufenden Component:
 *   const openDirectChat = useOpenDirectChat();
 *   const room = await openDirectChat(targetId);
 *   if (room) navigation.navigate("Chat", { id: room.id });
 */
export function useOpenDirectChat() {
  const dispatch = useAppDispatch();

  const currentUser = useAppSelector((s: RootState) => s.auth.user);
  const token = useAppSelector((s: RootState) => s.auth.token?.token);
  const rooms = useAppSelector((s: RootState) => s.chat.rooms);

  return async (targetUserId: string): Promise<ChatRoom | undefined> => {
    if (!currentUser || !token) return;

    const currentUserId = currentUser.id;

    // 1. Prüfen, ob schon ein DIRECT-Chat mit dieser Person existiert
    const existing = rooms.find(
      (room) =>
        room.type === "DIRECT" &&
        room.memberIds.includes(currentUserId) &&
        room.memberIds.includes(targetUserId)
    );

    if (existing) {
      // ✅ Bereits vorhandener Chat – einfach zurückgeben
      return existing;
    }

    // 2. Neuen Direktchat anlegen – Manager/Employee korrekt setzen
    let managerId: string;
    let employeeId: string;

    if (currentUser.role === UserRole.MANAGER) {
      managerId = currentUserId;
      employeeId = targetUserId;
    } else {
      managerId = targetUserId;
      employeeId = currentUserId;
    }

    const resultAction = await dispatch(
      createDirectChat({ managerId, employeeId, token })
    );

    if (createDirectChat.fulfilled.match(resultAction)) {
      const newRoom = resultAction.payload as ChatRoom;
      return newRoom;
    } else {
      // Optional: Error-Handling
      return undefined;
    }
  };
}

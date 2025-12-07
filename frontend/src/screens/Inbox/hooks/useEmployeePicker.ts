import { useAppSelector } from "@/src/hooks/useRedux";
import { Employee, Manager, UserRole } from "@/src/types/resources";
import { useMemo, useState } from "react";

/**
 * useEmployeePicker
 * ---------------------------------------------------------
 * Dieser Hook verwaltet alles rund um den Mitarbeiter-Picker:
 * - Öffnen und Schließen des Popups
 * - Zusammenstellen der Mitarbeiterliste (Direkt + Approved)
 * - Entfernen von Duplikaten
 * - Auslösen eines neuen Direkt-Chats bei Auswahl
 *
 * Dadurch wird die RequestsScreen-Komponente deutlich entlastet,
 * denn die gesamte Picker-Logik liegt sauber und isoliert hier.
 *
 * @param chatActions Objekt mit Aktionen aus useChat,
 *                    insbesondere startDirectChat().
 *
 * @returns Ein Objekt mit:
 *  - visible: Steuert Sichtbarkeit des Pickers
 *  - open(): Öffnet das Picker-Popup
 *  - close(): Schließt das Picker-Popup
 *  - pick(employeeId): Startet einen Chat mit Employee
 *  - options: Die berechneten Mitarbeiter, die ausgewählt werden können
 */

export function useEmployeePicker(chatActions: {
  startDirectChat: (managerId: string, employeeId: string) => void;
}) {
  const user = useAppSelector((s) => s.auth.user);
  const userId = useAppSelector((s) => s.auth.user?.id);
  const role = useAppSelector((s) => s.auth.user?.role);
  const isManager = role === UserRole.MANAGER;

  const requests = useAppSelector((s) => s.requests.items);

  const [visible, setVisible] = useState(false);

  // ==== Employees directly managed by Manager ===============================
  const managedEmployees: Employee[] = useMemo(() => {
    if (!isManager || !user) return [];
    const manager = user as Manager;

    return Array.isArray(manager.employees) ? manager.employees : [];
  }, [isManager, user]);

  // ==== Approved employees from requests ===================================
  const approvedEmployees: Employee[] = useMemo(() => {
    if (!isManager || !userId) return [];

    return requests
      .filter((r: any) => r.managerId === userId && !!r.employee)
      .map((r: any) => r.employee);
  }, [requests, isManager, userId]);

  // ==== Unique employee list ===============================================
  const options = useMemo(() => {
    if (!isManager) return [];

    // Merge: direct employees + approved employees
    const merged = [...managedEmployees, ...approvedEmployees];

    // Remove duplicates by ID
    const map = new Map(merged.map((e) => [e.id, e]));
    return Array.from(map.values());
  }, [isManager, managedEmployees, approvedEmployees]);

  // ==== Actions ==============================================================
  const open = () => setVisible(true);
  const close = () => setVisible(false);

  const pick = (empId: string) => {
    if (!userId) return;

    chatActions.startDirectChat(userId, empId);
    close();
  };

  return {
    visible,
    open,
    close,
    pick,
    options,
  };
}

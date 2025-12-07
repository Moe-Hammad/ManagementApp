import { useAppSelector } from "@/src/hooks/useRedux";
import { UserRole } from "@/src/types/resources";
import { useMemo, useState } from "react";

/**
 * useInboxTabs
 * ---------------------------------------------------------
 * Dieser Hook verwaltet ausschließlich die Tab-Navigation
 * innerhalb des Inbox-/Request-Bereichs.
 *
 * Verantwortlichkeiten:
 * - Aktives Tab speichern ("chats", "requests", optional "search")
 * - Tabs abhängig von der Rolle (Manager → extra "Search"-Tab)
 * - Zustand & Wechsel des Tabs steuern
 *
 * Warum existiert dieser Hook?
 * - Entlastet RequestsScreen von UI-Zustandslogik
 * - Kapselt Navigation an einem einzigen Ort
 *
 * @returns Ein Objekt mit:
 *  - activeTab: Aktuell ausgewählter Tab
 *  - setActiveTab(): Tab ändern
 *  - tabs: Berechnete Tab-Liste basierend auf User-Rolle
 */

export function useInboxTabs() {
  const role = useAppSelector((s) => s.auth.user?.role);

  const [activeTab, setActiveTab] = useState<"chats" | "requests" | "search">(
    "chats"
  );

  const tabs = useMemo(() => {
    const base = [
      { key: "chats", label: "Chats" },
      { key: "requests", label: "Requests" },
    ];
    if (role === UserRole.MANAGER) {
      base.push({ key: "search", label: "Search" });
    }
    return base;
  }, [role]);

  return {
    activeTab,
    setActiveTab,
    tabs,
  };
}

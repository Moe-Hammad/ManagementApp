import { useAppDispatch, useAppSelector } from "@/src/hooks/useRedux";
import {
  createRequest,
  fetchRequests,
  fetchUnassigned,
  selectRequests,
  upsertRequest,
} from "@/src/redux/requestSlice";
import { subscribeUserRequests } from "@/src/services/wsClient";
import { useThemeMode } from "@/src/theme/ThemeProvider";
import { DarkColors, LightColors } from "@/src/theme/colors";
import { makeStyles } from "@/src/theme/styles";
import { RequestStatus, UserRole } from "@/src/types/resources";
import { useEffect, useMemo, useState } from "react";

/**
 * useRequests
 * ---------------------------------------------------------
 * Dieser Hook kapselt die gesamte Logik rund um Requests:
 *
 * Verantwortlichkeiten:
 * - Requests aus der API laden
 * - WS-basierte Live-Updates empfangen (approve/reject)
 * - Unassigned Employees für Manager laden
 * - Request senden
 * - Styles + Farben bereitstellen
 * - Suchfeld für Mitarbeiter verwalten
 *
 * Ziel:
 * RequestsScreen deutlich entlasten und es ermöglichen,
 * reine UI-Komponenten zu bauen, ohne Logik darin.
 *
 * @returns Objekt mit:
 *  - requestsState: Styles, Status, Daten, Suchtext usw.
 *  - actions: setEmployeeSearch(), sendRequest()
 */

export function useRequests() {
  const dispatch = useAppDispatch();

  // ==== Theme ===============================================================
  const { isDark } = useThemeMode();
  const styles = makeStyles(isDark);
  const palette = isDark ? DarkColors : LightColors;

  // ==== Auth ================================================================
  const token = useAppSelector((s) => s.auth.token?.token);
  const userId = useAppSelector((s) => s.auth.user?.id);
  const user = useAppSelector((s) => s.auth.user);
  const role = useAppSelector((s) => s.auth.user?.role);
  const isManager = role === UserRole.MANAGER;

  // ==== Daten aus Redux =====================================================
  const requests = useAppSelector(selectRequests);
  const unassigned = useAppSelector((s) => s.requests.unassigned);

  // ==== Lokaler UI-State ====================================================
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [wsStatus, setWsStatus] = useState<"idle" | "connected" | "error">(
    "idle"
  );

  // ==== WS: Live-Updates für Requests =======================================
  useEffect(() => {
    if (!token) return;

    const sub = subscribeUserRequests(
      token,
      (payload) => {
        if (payload?.payload) {
          dispatch(upsertRequest(payload.payload));
        }
        setWsStatus("connected");
      },
      () => setWsStatus("error")
    );

    return () => {
      sub.disconnect();
      setWsStatus("idle");
    };
  }, [token, dispatch]);

  // ==== Requests laden ======================================================
  useEffect(() => {
    if (!token || !userId || !role) return;

    dispatch(fetchRequests({ userId, role, token }));
  }, [token, userId, role, dispatch]);

  // ==== Unassigned Employees (Manager only) =================================
  useEffect(() => {
    if (!isManager || !token) return;

    const handler = setTimeout(() => {
      dispatch(fetchUnassigned({ query: employeeSearch.trim(), token }));
    }, 300);

    return () => clearTimeout(handler);
  }, [employeeSearch, isManager, token, dispatch]);

  // ==== IDs aller approved Employees ========================================
  const approvedEmployeeIds = useMemo(() => {
    if (!userId) return [];

    return requests
      .filter(
        (r) =>
          r.status === RequestStatus.APPROVED &&
          r.managerId === userId &&
          !!r.employeeId
      )
      .map((r) => r.employeeId);
  }, [requests, userId]);

  // ==== Request senden (Manager → Employee) =================================
  const sendRequest = async (employeeId: string) => {
    if (!isManager || !token || !userId) {
      alert("Nur Manager können Anfragen senden.");
      return;
    }

    try {
      await dispatch(
        createRequest({ employeeId, managerId: userId, token })
      ).unwrap();

      alert("Anfrage wurde gesendet.");
    } catch (err: any) {
      alert(err.message || "Anfrage konnte nicht gesendet werden.");
    }
  };

  return {
    requestsState: {
      styles,
      palette,
      isManager,
      wsStatus,
      unassigned,
      requests,
      employeeSearch,
      approvedEmployeeIds,
      user,
    },
    actions: {
      setEmployeeSearch,
      sendRequest,
    },
  };
}

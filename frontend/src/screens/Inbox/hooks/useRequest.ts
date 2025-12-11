import { useAppDispatch, useAppSelector } from "@/src/hooks/useRedux";
import {
  createRequest,
  fetchRequests,
  fetchUnassigned,
  selectRequests,
  upsertRequest,
  updateRequestStatus,
} from "@/src/redux/requestSlice";
import { fetchCurrentUser } from "@/src/redux/fetchCurrentUser";
import { subscribeUserRequests } from "@/src/services/wsClient";
import { useThemeMode } from "@/src/theme/ThemeProvider";
import { DarkColors, LightColors } from "@/src/theme/colors";
import { makeStyles } from "@/src/theme/styles";
import { upsertAssignment } from "@/src/redux/assignmentSlice";
import { subscribeUserAssignments } from "@/src/services/wsClient";
import { RequestStatus, UserRole } from "@/src/types/resources";
import { fetchAssignmentsForEmployee } from "@/src/services/api";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { Alert } from "react-native";

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
  const [wsAssignmentsStatus, setWsAssignmentsStatus] = useState<
    "idle" | "connected" | "error"
  >("idle");
  const assignments = useAppSelector((s) => s.assignments.items);

  const refreshUser = () => {
    if (!token) return;
    dispatch(fetchCurrentUser(token));
  };

  const pendingRequests = useMemo(
    () => requests.filter((r) => r.status === RequestStatus.PENDING),
    [requests]
  );

  // ==== WS: Live-Updates für Requests =======================================
  useEffect(() => {
    if (!token) return;

    const sub = subscribeUserRequests(
      token,
      (payload) => {
        const req = payload?.payload ?? payload;
        if (req) {
          dispatch(upsertRequest(req));
          refreshUser();
          setWsStatus("connected");
        }
      },
      () => setWsStatus("error")
    );
    setWsStatus("connected");

    return () => {
      sub.disconnect();
      setWsStatus("idle");
    };
  }, [token, dispatch]);

  // ==== Initial Assignments laden (Employee) ================================
  useEffect(() => {
    if (!token || role !== UserRole.EMPLOYEE || !userId) return;
    (async () => {
      try {
        const data = await fetchAssignmentsForEmployee(userId, token);
        data.forEach((dto) => dispatch(upsertAssignment(dto)));
      } catch (err) {
        // ignore errors silently
      }
    })();
  }, [token, role, userId, dispatch]);

  // ==== WS: Live-Updates fr Assignments ====================================
  useEffect(() => {
    if (!token) return;

    const sub = subscribeUserAssignments(
      token,
      (payload) => {
        const dto = payload?.payload ?? payload;
        if (dto) {
          dispatch(upsertAssignment(dto));
          setWsAssignmentsStatus("connected");
        }
      },
      () => setWsAssignmentsStatus("error")
    );

    return () => {
      sub.disconnect();
      setWsAssignmentsStatus("idle");
    };
  }, [token, dispatch]);

  // ==== Requests laden ======================================================
  useEffect(() => {
    if (!token || !userId || !role) return;

    dispatch(fetchRequests({ userId, role, token }));
  }, [token, userId, role, dispatch]);

  // Refresh on screen focus to ensure latest state without navigation hacks
  useFocusEffect(
    useCallback(() => {
      if (!token || !userId || !role) return;
      dispatch(fetchRequests({ userId, role, token }));
      if (role === UserRole.EMPLOYEE) {
        fetchAssignmentsForEmployee(userId, token)
          .then((list) => list.forEach((dto) => dispatch(upsertAssignment(dto))))
          .catch(() => {});
      }
    }, [token, userId, role, dispatch])
  );

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
  const sendRequest = async (employeeId: string, message?: string) => {
    if (!isManager || !token || !userId) {
      alert("Nur Manager können Anfragen senden.");
      return;
    }

    // Debug-Alert + Log: was wird gesendet, an wen?
    Alert.alert(
      "Request senden (Debug)",
      `destination: /api/requests\nmanagerId: ${userId}\nemployeeId: ${employeeId}\nmessage: ${message ?? "-"}`
    );
    console.log("[Request][SEND]", {
      destination: "/api/requests",
      managerId: userId,
      employeeId,
      message,
    });

    try {
      await dispatch(
        createRequest({ employeeId, managerId: userId, message, token })
      ).unwrap();

      refreshUser();
      alert("Anfrage wurde gesendet.");
    } catch (err: any) {
      alert(err.message || "Anfrage konnte nicht gesendet werden.");
    }
  };

  const acceptRequest = async (requestId: string) => {
    if (!token) return;

    try {
      await dispatch(
        updateRequestStatus({
          requestId,
          status: RequestStatus.APPROVED,
          token,
        })
      ).unwrap();
      refreshUser();
    } catch (err: any) {
      alert(err.message || "Request konnte nicht akzeptiert werden.");
    }
  };

  const rejectRequest = async (requestId: string) => {
    if (!token) return;

    try {
      await dispatch(
        updateRequestStatus({
          requestId,
          status: RequestStatus.REJECTED,
          token,
        })
      ).unwrap();
      refreshUser();
    } catch (err: any) {
      alert(err.message || "Request konnte nicht abgelehnt werden.");
    }
  };

  return {
    requestsState: {
      styles,
      palette,
      isManager,
      wsStatus,
      wsAssignmentsStatus,
      unassigned,
      requests,
      pendingRequests,
      employeeSearch,
      approvedEmployeeIds,
      user,
      assignments,
    },
    actions: {
      setEmployeeSearch,
      sendRequest,
      acceptRequest,
      rejectRequest,
    },
  };
}

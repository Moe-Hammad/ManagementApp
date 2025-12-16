import { useAppDispatch, useAppSelector } from "@/src/hooks/useRedux";
import { fetchUserById } from "@/src/redux/userSlice";
import {
  AssignmentStatus,
  Employee,
  Manager,
  RequestItem,
  RequestStatus,
  TaskAssignment,
  UserRole,
} from "@/src/types/resources";
import { useEffect, useMemo } from "react";
import { FlatList, Pressable, Text, View } from "react-native";

type ListItem =
  | { type: "header"; key: string; title: string }
  | { type: "empty"; key: string; text: string }
  | { type: "request"; key: string; req: RequestItem }
  | { type: "assignment"; key: string; assignment: TaskAssignment };

export default function RequestsTab({
  styles,
  palette,
  requests,
  user,
  assignments = [],
  onAccept,
  onReject,
  onAcceptAssignment,
  onRejectAssignment,
}: {
  styles: any;
  palette: any;
  requests: RequestItem[];
  user: Manager | Employee;
  assignments?: TaskAssignment[];
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onAcceptAssignment?: (id: string) => void;
  onRejectAssignment?: (id: string) => void;
}) {
  const dispatch = useAppDispatch();
  const isManager = user.role === UserRole.MANAGER;
  const isEmployee = user.role === UserRole.EMPLOYEE;
  const userMap = useAppSelector((s) => s.users.userMap);
  const token = useAppSelector((s) => s.auth.token?.token);

  const employeeMap = isManager
    ? Object.fromEntries((user as Manager).employees.map((e) => [e.id, e]))
    : {};

  // Manager-Daten vorladen (nur für Employees)
  useEffect(() => {
    if (!isEmployee || !token) return;

    const managerIds = Array.from(
      new Set([
        ...requests.map((r) => r.managerId),
        ...assignments.map((a) => a.managerId),
      ])
    );
    managerIds.forEach((id) => {
      if (!userMap[id]) {
        dispatch(fetchUserById(id));
      }
    });
  }, [isEmployee, requests, assignments, userMap, dispatch, token]);

  // Employee-Daten vorladen (nur für Manager)
  useEffect(() => {
    if (!isManager || !token) return;

    const missing = Array.from(
      new Set(
        [
          ...requests.map((r) => r.employeeId),
          ...assignments.map((a) => a.employeeId),
        ].filter((id) => id && !employeeMap[id] && !userMap[id])
      )
    );

    missing.forEach((id) => {
      dispatch(fetchUserById(id));
    });
  }, [isManager, requests, assignments, employeeMap, userMap, dispatch, token]);

  const uniqueRequests = useMemo(
    () => Array.from(new Map(requests.map((r) => [r.id, r])).values()),
    [requests]
  );

  // Zeige PENDING + APPROVED REJECTED
  const visibleRequests = useMemo(
    () =>
      uniqueRequests.filter(
        (r) =>
          r.status === RequestStatus.PENDING ||
          r.status === RequestStatus.REJECTED ||
          r.status === RequestStatus.APPROVED
      ),
    [uniqueRequests]
  );

  const uniqueAssignments = useMemo(
    () => Array.from(new Map(assignments.map((a) => [a.id, a])).values()),
    [assignments]
  );

  // Fehlende Nutzer für Anzeige nachladen (Manager/Employee)
  useEffect(() => {
    if (!token) return;
    const ids = new Set<string>();

    if (isManager) {
      uniqueRequests.forEach((r) => r.employeeId && ids.add(r.employeeId));
      uniqueAssignments.forEach((a) => a.employeeId && ids.add(a.employeeId));
    } else {
      uniqueRequests.forEach((r) => r.managerId && ids.add(r.managerId));
      uniqueAssignments.forEach((a) => a.managerId && ids.add(a.managerId));
    }

    ids.forEach((id) => {
      if (id && !userMap[id]) {
        dispatch(fetchUserById(id));
      }
    });
  }, [uniqueRequests, uniqueAssignments, isManager, token, userMap, dispatch]);

  const resolveUserName = (id: string | undefined) => {
    if (!id) return "Unbekannter Nutzer";
    const cached = userMap[id];
    if (cached) return `${cached.firstName} ${cached.lastName}`;
    if (employeeMap[id]) {
      const e = employeeMap[id];
      return `${e.firstName} ${e.lastName}`;
    }
    return "Unbekannter Nutzer";
  };

  const listData: ListItem[] = useMemo(() => {
    const items: ListItem[] = [];

    items.push({ type: "header", key: "requests-header", title: "Requests" });
    if (visibleRequests.length === 0) {
      items.push({
        type: "empty",
        key: "requests-empty",
        text: "Keine Requests vorhanden.",
      });
    } else {
      visibleRequests.forEach((req) =>
        items.push({ type: "request", key: `req-${req.id}`, req })
      );
    }

    items.push({
      type: "header",
      key: "assignments-header",
      title: "Assignments",
    });
    if (uniqueAssignments.length === 0) {
      items.push({
        type: "empty",
        key: "assignments-empty",
        text: "Keine Assignments vorhanden.",
      });
    } else {
      uniqueAssignments.forEach((assignment) =>
        items.push({
          type: "assignment",
          key: `assign-${assignment.id}`,
          assignment,
        })
      );
    }

    return items;
  }, [uniqueRequests, uniqueAssignments]);

  const renderRequestCard = (req: RequestItem) => {
    let displayName = "";

    if (isManager) {
      const emp = employeeMap[req.employeeId];
      const cached = userMap[req.employeeId];
      displayName = emp
        ? `${emp.firstName} ${emp.lastName}`
        : cached
        ? `${cached.firstName} ${cached.lastName}`
        : "Lade Mitarbeiter...";
    }

    if (isEmployee) {
      const manager = userMap[req.managerId];
      displayName = manager
        ? `${manager.firstName} ${manager.lastName}`
        : "Manager wird geladen...";
    }

    const statusColor =
      req.status === RequestStatus.APPROVED
        ? palette.success
        : req.status === RequestStatus.REJECTED
        ? palette.danger
        : palette.secondary;

    return (
      <View style={[styles.requestItem, styles.requestItemWrapper]}>
        <View style={styles.requestInfo}>
          {isManager ? (
            <Text style={styles.text}>
              Gesendet an:{" "}
              <Text style={{ fontWeight: "700" }}>{displayName}</Text>
            </Text>
          ) : (
            <Text style={styles.text}>
              Von Manager:{" "}
              <Text style={{ fontWeight: "700" }}>{displayName}</Text>
            </Text>
          )}

          {req.message && (
            <Text
              style={[
                styles.requestsNote,
                { color: palette.text, marginTop: 4 },
              ]}
            >
              {req.message}
            </Text>
          )}

          <Text
            style={[styles.requestsNote, { color: statusColor, marginTop: 4 }]}
          >
            {req.status}
          </Text>
        </View>

        {isEmployee && req.status === RequestStatus.PENDING && (
          <View style={styles.requestActions}>
            <Pressable
              style={styles.requestActionApprove}
              onPress={() => onAccept(req.id)}
            >
              <Text style={styles.requestActionText}>V</Text>
            </Pressable>

            <Pressable
              style={styles.requestActionReject}
              onPress={() => onReject(req.id)}
            >
              <Text style={styles.requestActionText}>?</Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  };

  const renderAssignmentCard = (as: TaskAssignment) => {
    const statusColor =
      as.status === AssignmentStatus.ACCEPTED
        ? palette.success
        : as.status === AssignmentStatus.DECLINED
        ? palette.danger
        : as.status === AssignmentStatus.EXPIRED
        ? palette.secondary
        : palette.warning;

    const displayName = resolveUserName(
      isManager ? as.employeeId : as.managerId
    );

    return (
      <View style={[styles.requestItem, styles.requestItemWrapper]}>
        <View style={styles.requestInfo}>
          <Text style={styles.text}>
            Assignment: <Text style={{ fontWeight: "700" }}>{displayName}</Text>
          </Text>
          <Text
            style={[styles.requestsNote, { color: statusColor, marginTop: 4 }]}
          >
            {as.status}
          </Text>
        </View>

        {isEmployee && as.status === AssignmentStatus.PENDING && (
          <View style={styles.requestActions}>
            <Pressable
              style={styles.requestActionApprove}
              onPress={() => onAcceptAssignment?.(as.id)}
            >
              <Text style={styles.requestActionText}>V</Text>
            </Pressable>

            <Pressable
              style={styles.requestActionReject}
              onPress={() => onRejectAssignment?.(as.id)}
            >
              <Text style={styles.requestActionText}>?</Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  };

  const renderItem = ({ item }: { item: ListItem }) => {
    switch (item.type) {
      case "header":
        return (
          <Text style={[styles.widgetTitle, styles.requestItemWrapper]}>
            {item.title}
          </Text>
        );
      case "empty":
        return (
          <Text
            style={[
              styles.text,
              styles.requestsNote,
              styles.requestItemWrapper,
            ]}
          >
            {item.text}
          </Text>
        );
      case "request":
        return renderRequestCard(item.req);
      case "assignment":
        return renderAssignmentCard(item.assignment);
      default:
        return null;
    }
  };

  return (
    <View style={[styles.widget, styles.requestsBodyCard, { flex: 1 }]}>
      <FlatList
        data={listData}
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          { paddingVertical: 4 },
          styles.requestsListContent,
        ]}
        style={{ flex: 1 }}
      />
    </View>
  );
}

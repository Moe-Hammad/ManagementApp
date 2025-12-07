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
import { useEffect } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

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

  // Employee-Daten vorladen (nur für Manager, z. B. pending Requests)
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

  return (
    <View style={[styles.widget, styles.requestsBodyCard]}>
      <Text style={styles.widgetTitle}>Requests</Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {requests.length === 0 ? (
          <Text style={[styles.text, styles.requestsNote]}>
            Keine Requests vorhanden.
          </Text>
        ) : (
          requests.map((req) => {
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
              <View key={req.id} style={styles.requestItem}>
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
                    style={[
                      styles.requestsNote,
                      { color: statusColor, marginTop: 4 },
                    ]}
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
                      <Text style={styles.requestActionText}>✓</Text>
                    </Pressable>

                    <Pressable
                      style={styles.requestActionReject}
                      onPress={() => onReject(req.id)}
                    >
                      <Text style={styles.requestActionText}>✕</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            );
          })
        )}

        <View style={{ height: 16 }} />
        <Text style={styles.widgetTitle}>Assignments</Text>
        {assignments.length === 0 ? (
          <Text style={[styles.text, styles.requestsNote]}>
            Keine Assignments vorhanden.
          </Text>
        ) : (
          assignments.map((as) => {
            const statusColor =
              as.status === AssignmentStatus.ACCEPTED
                ? palette.success
                : as.status === AssignmentStatus.DECLINED
                ? palette.danger
                : as.status === AssignmentStatus.EXPIRED
                ? palette.secondary
                : palette.warning;

            const displayName = (() => {
              const id = isManager ? as.employeeId : as.managerId;
              const cached = userMap[id];
              if (cached) return `${cached.firstName} ${cached.lastName}`;
              return id;
            })();

            return (
              <View key={as.id} style={styles.requestItem}>
                <View style={styles.requestInfo}>
                  <Text style={styles.text}>
                    Assignment:{" "}
                    <Text style={{ fontWeight: "700" }}>{displayName}</Text>
                  </Text>
                  <Text
                    style={[
                      styles.requestsNote,
                      { color: statusColor, marginTop: 4 },
                    ]}
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
                      <Text style={styles.requestActionText}>✓</Text>
                    </Pressable>

                    <Pressable
                      style={styles.requestActionReject}
                      onPress={() => onRejectAssignment?.(as.id)}
                    >
                      <Text style={styles.requestActionText}>✕</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

import { useOpenDirectChat } from "@/src/hooks/useOpenDirectChat";
import { useAppDispatch, useAppSelector } from "@/src/hooks/useRedux";
import { fetchUserById } from "@/src/redux/userSlice";
import {
  Employee,
  Manager,
  RequestItem,
  RequestStatus,
  UserRole,
} from "@/src/types/resources";
import { useEffect } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function RequestsTab({
  styles,
  palette,
  requests,
  user,
  onAccept,
  onReject,
}: {
  styles: any;
  palette: any;
  requests: RequestItem[];
  user: Manager | Employee;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const dispatch = useAppDispatch();
  const openDirectChat = useOpenDirectChat();

  const isManager = user.role === UserRole.MANAGER;
  const isEmployee = user.role === UserRole.EMPLOYEE;

  const employeeMap = isManager
    ? Object.fromEntries((user as Manager).employees.map((e) => [e.id, e]))
    : {};

  const userMap = useAppSelector((s) => s.users.userMap);
  const token = useAppSelector((s) => s.auth.token?.token);

  // Manager-Daten vorladen (nur für Employees)
  useEffect(() => {
    if (!isEmployee || !token) return;

    const managerIds = Array.from(new Set(requests.map((r) => r.managerId)));
    managerIds.forEach((id) => {
      if (!userMap[id]) {
        dispatch(fetchUserById(id));
      }
    });
  }, [isEmployee, requests, userMap, dispatch, token]);

  // Employee-Daten vorladen (nur für Manager, z. B. pending Requests)
  useEffect(() => {
    if (!isManager || !token) return;

    const missing = Array.from(
      new Set(
        requests
          .map((r) => r.employeeId)
          .filter((id) => id && !employeeMap[id] && !userMap[id])
      )
    );

    missing.forEach((id) => {
      dispatch(fetchUserById(id));
    });
  }, [isManager, requests, employeeMap, userMap, dispatch, token]);

  const handleAccept = async (requestId: string, managerId: string) => {
    onAccept(requestId);
    await openDirectChat(managerId);
  };

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
                      onPress={() => handleAccept(req.id, req.managerId)}
                    >
                      <Text style={styles.requestActionText}>✔</Text>
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
      </ScrollView>
    </View>
  );
}

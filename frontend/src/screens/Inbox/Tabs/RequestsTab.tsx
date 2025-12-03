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

/**
 * RequestsTab
 * ---------------------------------------------------------
 * - Zeigt Requests für Manager & Employees
 * - Lädt Manager-Daten für Employees automatisch
 * - Beim ANNEHMEN wird automatisch ein DirectChat geöffnet (Step 1.5)
 */

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

  // Map der Mitarbeiter für Manager
  const employeeMap = isManager
    ? Object.fromEntries((user as Manager).employees.map((e) => [e.id, e]))
    : {};

  const userMap = useAppSelector((s) => s.users.userMap);
  const token = useAppSelector((s) => s.auth.token?.token);

  /**
   * 📌 Manager-Daten vorladen (nur für Employees)
   */
  useEffect(() => {
    if (!isEmployee) return;
    if (!token) return;

    const managerIds = Array.from(new Set(requests.map((r) => r.managerId)));

    managerIds.forEach((id) => {
      if (!userMap[id]) {
        dispatch(fetchUserById(id));
      }
    });
  }, [isEmployee, requests, userMap, dispatch, token]);

  /**
   * 📌 DirectChat öffnen, nachdem Employee ACCEPT gedrückt hat
   */
  const handleAccept = async (requestId: string, managerId: string) => {
    onAccept(requestId);

    // DirectChat öffnen
    const room = await openDirectChat(managerId);
    // ChatScreen Navigation erfolgt im Hook/ChatsTab
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
            // 🔍 Namen auflösen
            let displayName = "";

            // Manager → Employee anzeigen
            if (isManager) {
              const emp = employeeMap[req.employeeId];
              displayName = emp
                ? `${emp.firstName} ${emp.lastName}`
                : req.employeeId;
            }

            // Employee → Manager anzeigen
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
                {/* LEFT SIDE */}
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

                {/* Employee kann ACCEPT/REJECT */}
                {isEmployee && req.status === RequestStatus.PENDING && (
                  <View style={styles.requestActions}>
                    {/* ACCEPT */}
                    <Pressable
                      style={styles.requestActionApprove}
                      onPress={() => handleAccept(req.id, req.managerId)}
                    >
                      <Text style={styles.requestActionText}>✔</Text>
                    </Pressable>

                    {/* REJECT */}
                    <Pressable
                      style={styles.requestActionReject}
                      onPress={() => onReject(req.id)}
                    >
                      <Text style={styles.requestActionText}>✖</Text>
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

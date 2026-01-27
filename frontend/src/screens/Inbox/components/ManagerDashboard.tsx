import { useAppDispatch, useAppSelector } from "@/src/hooks/useRedux";
import { fetchCurrentUser } from "@/src/redux/fetchCurrentUser";
import { removeEmployeeFromManager } from "@/src/services/api";
import { useThemeMode } from "@/src/theme/ThemeProvider";
import { makeStyles } from "@/src/theme/styles";
import { Manager } from "@/src/types/resources";
import { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type Props = {
  manager: Manager;
  totalEmployees: number;
  availableEmployees: number;
};

export default function ManagerDashboard({
  manager,
  totalEmployees,
  availableEmployees,
}: Props) {
  const { isDark } = useThemeMode();
  const styles = makeStyles(isDark);
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.token?.accessToken);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const topEmployees = manager.employees;

  const handleRemoveEmployee = (employeeId: string) => {
    if (!token || removingId) return;
    Alert.alert(
      "Mitarbeiter entfernen?",
      "Der Mitarbeiter wird aus allen kuenftigen Tasks entfernt und ein Ersatz wird gesucht.",
      [
        { text: "Abbrechen", style: "cancel" },
        {
          text: "Entfernen",
          style: "destructive",
          onPress: async () => {
            try {
              setRemovingId(employeeId);
              await removeEmployeeFromManager(manager.id, employeeId, token);
              await dispatch(fetchCurrentUser(token));
            } catch (err: any) {
              Alert.alert(
                "Fehler",
                err?.message || "Mitarbeiter konnte nicht entfernt werden."
              );
            } finally {
              setRemovingId(null);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.screen}>
      <View style={styles.section}>
        <Text style={styles.titles}>Hallo {manager.firstName}!</Text>
        <Text style={[styles.text, { opacity: 0.6 }]}>
          Manager Overview – {manager.employees.length} Mitarbeiter im Team
        </Text>
      </View>

      <View style={styles.row}>
        <View style={[styles.widget, styles.col]}>
          <Text style={styles.widgetTitle}>Verfügbar</Text>
          <Text style={styles.widgetValue}>{availableEmployees}</Text>
        </View>

        <View style={[styles.widget, styles.col]}>
          <Text style={styles.widgetTitle}>Teamgröße</Text>
          <Text style={styles.widgetValue}>{totalEmployees}</Text>
        </View>
      </View>

      <View style={[styles.widget, { marginTop: 16 }]}>
        <Text style={styles.widgetTitle}>Team Status</Text>
        {topEmployees.map((emp) => (
          <View
            key={emp.id}
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text style={styles.text}>
              {emp.firstName} {emp.lastName}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <Text
                style={[
                  styles.text,
                  { color: emp.availability ? "#22c55e" : "#ef4444" },
                ]}
              >
                {emp.availability ? "frei" : "belegt"}
              </Text>
              <Pressable
                onPress={() => handleRemoveEmployee(emp.id)}
                disabled={removingId === emp.id}
              >
                <MaterialCommunityIcons
                  name="trash-can-outline"
                  size={18}
                  color={removingId === emp.id ? "#ef4444" : "#ef4444"}
                />
              </Pressable>
            </View>
          </View>
        ))}
        {topEmployees.length === 0 && (
          <Text style={[styles.text, { opacity: 0.6 }]}>
            Keine Mitarbeiter gefunden.
          </Text>
        )}
      </View>
    </View>
  );
}

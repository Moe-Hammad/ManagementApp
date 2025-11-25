import { useThemeMode } from "@/src/theme/ThemeProvider";
import { makeStyles } from "@/src/theme/styles";
import { Manager } from "@/src/types/resources";
import { Text, View } from "react-native";

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

  const topEmployees = manager.employees.slice(0, 3);

  return (
    <View style={styles.screen}>
      <View style={styles.section}>
        <Text style={styles.titles}>Hello {manager.firstName} 👋</Text>
        <Text style={[styles.text, { opacity: 0.6 }]}>
          Manager Overview – {manager.employees.length} Mitarbeiter im Team
        </Text>
      </View>

      <View style={styles.row}>
        <View style={[styles.widget, styles.col]}>
          <Text style={styles.widgetTitle}>Verfügbar</Text>
          <Text style={styles.widgetValue}>
            {availableEmployees} / {totalEmployees}
          </Text>
        </View>

        <View style={[styles.widget, styles.col]}>
          <Text style={styles.widgetTitle}>Teamgröße</Text>
          <Text style={styles.widgetValue}>{totalEmployees}</Text>
        </View>
      </View>

      <View style={[styles.widget, { marginTop: 16 }]}>
        <Text style={styles.widgetTitle}>Team Status (Top 3)</Text>
        {topEmployees.map((emp) => (
          <View
            key={emp.id}
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text style={styles.text}>
              {emp.firstName} {emp.lastName}
            </Text>
            <Text
              style={[
                styles.text,
                { color: emp.availability ? "#22c55e" : "#ef4444" },
              ]}
            >
              {emp.availability ? "frei" : "belegt"}
            </Text>
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

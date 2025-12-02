import { useThemeMode } from "@/src/theme/ThemeProvider";
import { makeStyles } from "@/src/theme/styles";
import { Employee } from "@/src/types/resources";
import { Text, View } from "react-native";

type Props = {
  employee: Employee;
};

export default function EmployeeDashboard({ employee }: Props) {
  const { isDark } = useThemeMode();
  const styles = makeStyles(isDark);

  const availabilityText = employee.availability ? "Verfügbar" : "Beschäftigt";

  return (
    <View style={styles.screen}>
      <View style={styles.section}>
        <Text style={styles.titles}>Hey {employee.firstName}!</Text>
        <Text style={[styles.text, { opacity: 0.6 }]}>
          Deine aktuelle Rolle: Employee
        </Text>
      </View>

      <View style={[styles.widget, { marginTop: 8 }]}>
        <Text style={styles.widgetTitle}>Status</Text>
        <Text
          style={[
            styles.widgetValue,
            { color: employee.availability ? "#22c55e" : "#ef4444" },
          ]}
        >
          {availabilityText}
        </Text>
      </View>

      <View style={[styles.widget, { marginTop: 16 }]}>
        <Text style={styles.widgetTitle}>Stundensatz</Text>
        <Text style={styles.widgetValue}>
          {employee.hourlyRate ? `${employee.hourlyRate} €` : "-"}
        </Text>
      </View>

      <View style={[styles.widget, { marginTop: 16 }]}>
        <Text style={styles.widgetTitle}>Manager</Text>
        <Text style={styles.text}>
          {employee.managerId ? employee.managerId : "Noch kein Manager zugeordnet"}
        </Text>
      </View>
    </View>
  );
}

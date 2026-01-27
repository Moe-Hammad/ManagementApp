import { Pressable, Text, TouchableOpacity, View } from "react-native";

export type TaskDashboardProps = {
  finishedCount: number;
  openCount: number;
  runningCount: number;
  onCreatePress: () => void;
  activeStatus?: "ALL" | "OPEN" | "RUNNING" | "DONE";
  onSelectStatus?: (status: "ALL" | "OPEN" | "RUNNING" | "DONE") => void;
  styles: any;
};

export default function TaskDashboard({
  finishedCount,
  openCount,
  runningCount,
  onCreatePress,
  activeStatus = "ALL",
  onSelectStatus,
  styles,
}: TaskDashboardProps) {
  const kpis = [
    { key: "OPEN" as const, label: "Offen", value: openCount },
    { key: "RUNNING" as const, label: "Laufend", value: runningCount },
    { key: "DONE" as const, label: "Fertig", value: finishedCount },
  ];

  return (
    <View style={styles.taskDashboardContainer}>
      <View style={styles.taskKpiRow}>
        {kpis.map((item) => {
          const active = activeStatus === item.key;
          return (
            <Pressable
              key={item.key}
              style={[
                styles.taskKpiCard,
                active ? styles.taskKpiCardActive : styles.taskKpiCardIdle,
              ]}
              onPress={() => onSelectStatus?.(item.key)}
            >
              <Text style={styles.taskKpiValue}>{item.value}</Text>
              <Text style={styles.taskKpiLabel}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable style={styles.taskPrimaryButton} onPress={onCreatePress}>
        <Text style={styles.taskPrimaryButtonText}>Task erstellen</Text>
      </Pressable>
    </View>
  );
}

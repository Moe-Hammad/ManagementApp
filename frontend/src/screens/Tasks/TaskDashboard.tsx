import { Text, Pressable, View } from "react-native";

export type TaskDashboardProps = {
  finishedCount: number;
  openCount: number;
  runningCount: number;
  showOpenTasksList: boolean;
  onCreatePress: () => void;
  onToggleOpenTasks: () => void;
  styles: any;
};

export default function TaskDashboard({
  finishedCount,
  openCount,
  runningCount,
  showOpenTasksList,
  onCreatePress,
  onToggleOpenTasks,
  styles,
}: TaskDashboardProps) {
  return (
    <>
      <View style={styles.taskHubGrid}>
        <View style={styles.taskHubCard}>
          <Text style={styles.taskHubCardTitle}>Fertige Tasks</Text>
          <Text style={styles.taskHubCardValue}>{finishedCount}</Text>
        </View>
        <View style={styles.taskHubCard}>
          <Text style={styles.taskHubCardTitle}>Offene Tasks</Text>
          <Text style={styles.taskHubCardValue}>{openCount}</Text>
        </View>
        <View style={styles.taskHubCard}>
          <Text style={styles.taskHubCardTitle}>Laufende Tasks</Text>
          <Text style={styles.taskHubCardValue}>{runningCount}</Text>
        </View>
      </View>

      <Pressable style={styles.taskHubButton} onPress={onCreatePress}>
        <Text style={styles.taskHubButtonTextPrimary}>Task erstellen</Text>
      </Pressable>

      <Pressable
        style={styles.taskHubButtonSecondary}
        onPress={onToggleOpenTasks}
      >
        <Text style={styles.taskHubButtonTextSecondary}>
          {showOpenTasksList ? "Offene Tasks verbergen" : "Offene Tasks ansehen"}
        </Text>
      </Pressable>
    </>
  );
}

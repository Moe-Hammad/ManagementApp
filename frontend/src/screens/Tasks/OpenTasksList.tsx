import { Pressable, Text, View } from "react-native";
import { Task } from "@/src/types/resources";

type Props = {
  tasksLoading: boolean;
  unassignedTasks: Task[];
  renderTaskCard: (t: Task, idx: number) => React.ReactNode;
  onRefresh: () => void;
  styles: any;
  palette: any;
};

export default function OpenTasksList({
  tasksLoading,
  unassignedTasks,
  renderTaskCard,
  onRefresh,
  styles,
  palette,
}: Props) {
  return (
    <View
      style={[
        styles.card,
        { marginBottom: 16, borderColor: palette.border },
      ]}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <Text style={[styles.title, styles.createHeader]}>
          Offene Tasks (ohne Mitarbeiter)
        </Text>
        <Pressable onPress={onRefresh}>
          <Text style={{ color: palette.primary }}>Aktualisieren</Text>
        </Pressable>
      </View>

      {tasksLoading && unassignedTasks.length === 0 ? (
        <Text style={{ color: palette.secondary }}>Tasks werden geladen...</Text>
      ) : unassignedTasks.length === 0 ? (
        <Text style={{ color: palette.secondary }}>Keine offenen Tasks.</Text>
      ) : (
        unassignedTasks.map((t, idx) => renderTaskCard(t, idx))
      )}
    </View>
  );
}

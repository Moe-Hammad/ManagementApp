import { useAppSelector } from "@/src/hooks/useRedux";
import TaskDashboard from "@/src/screens/Tasks/TaskDashboard";
import {
  fetchAssignmentsForTask,
  fetchTasksForManager,
  deleteTaskApi,
  listEmployeesUnderManager,
} from "@/src/services/api";
import { useThemeMode } from "@/src/theme/ThemeProvider";
import { makeStyles } from "@/src/theme/styles";
import {
  AssignmentStatus,
  Employee,
  Task,
  TaskAssignment,
  UserRole,
} from "@/src/types/resources";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type AssignmentMap = Record<string, TaskAssignment[]>;
type StatusFilter = "ALL" | "OPEN" | "RUNNING" | "DONE";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const formatTimeRange = (startIso: string, endIso: string) => {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const pad = (v: number) => v.toString().padStart(2, "0");
  return `${pad(start.getHours())}:${pad(start.getMinutes())} - ${pad(
    end.getHours()
  )}:${pad(end.getMinutes())}`;
};

export default function TasksIndex() {
  const token = useAppSelector((s) => s.auth.token?.token);
  const role = useAppSelector((s) => s.auth.user?.role);
  const managerId = useAppSelector((s) => s.auth.user?.id);

  const { isDark } = useThemeMode();
  const styles = makeStyles(isDark);
  const router = useRouter();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [userFilter, setUserFilter] = useState<string>("ALL");

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [assignmentsByTask, setAssignmentsByTask] = useState<AssignmentMap>({});
  const [tasksLoading, setTasksLoading] = useState(false);

  const activeAssignments = useCallback(
    (taskId: string) =>
      (assignmentsByTask[taskId] || []).filter(
        (a) =>
          a.status === AssignmentStatus.PENDING ||
          a.status === AssignmentStatus.ACCEPTED
      ),
    [assignmentsByTask]
  );

  const openSlotsForTask = useCallback(
    (task: Task) =>
      Math.max(task.requiredEmployees - activeAssignments(task.id).length, 0),
    [activeAssignments]
  );

  const deriveStatus = useCallback(
    (task: Task): Exclude<StatusFilter, "ALL"> => {
      const now = Date.now();
      const end = new Date(task.end).getTime();
      const start = new Date(task.start).getTime();
      if (end < now) return "DONE";
      if (start <= now && now <= end) return "RUNNING";
      return openSlotsForTask(task) > 0 ? "OPEN" : "RUNNING";
    },
    [openSlotsForTask]
  );

  const finishedCount = useMemo(
    () => tasks.filter((t) => deriveStatus(t) === "DONE").length,
    [tasks, deriveStatus]
  );
  const runningCount = useMemo(
    () => tasks.filter((t) => deriveStatus(t) === "RUNNING").length,
    [tasks, deriveStatus]
  );
  const openCount = useMemo(
    () => tasks.filter((t) => deriveStatus(t) === "OPEN").length,
    [tasks, deriveStatus]
  );

  const users = useMemo(
    () => [
      { id: "ALL", name: "Alle" },
      ...employees.map((e) => ({
        id: e.id,
        name: `${e.firstName} ${e.lastName}`,
      })),
    ],
    [employees]
  );

  const filteredTasks = useMemo(
    () =>
      tasks.filter((task) => {
        const status = deriveStatus(task);
        const statusMatch = statusFilter === "ALL" || status === statusFilter;
        const userMatch =
          userFilter === "ALL" ||
          (assignmentsByTask[task.id] || []).some(
            (a) => a.employeeId === userFilter
          );
        return statusMatch && userMatch;
      }),
    [tasks, deriveStatus, statusFilter, userFilter, assignmentsByTask]
  );

  // Guards -------------------------------------------------------------------
  if (role !== UserRole.MANAGER) {
    return (
      <SafeAreaView style={styles.taskHubSafeArea}>
        <Text style={styles.title}>Tasks</Text>
        <Text style={styles.taskHubNotice}>
          Nur Manager können Tasks anlegen.
        </Text>
      </SafeAreaView>
    );
  }

  // Data loading -------------------------------------------------------------
  useEffect(() => {
    if (!token || !managerId) return;
    (async () => {
      try {
        const emps = await listEmployeesUnderManager(managerId, token);
        setEmployees(emps);
      } catch {
        // ignore for now
      }
    })();
  }, [token, managerId]);

  const loadTasks = useCallback(async () => {
    if (!token || !managerId) return;
    setTasksLoading(true);
    try {
      const fetchedTasks = await fetchTasksForManager(managerId, token);
      setTasks(fetchedTasks);

      const pairs = await Promise.all(
        fetchedTasks.map((t) =>
          fetchAssignmentsForTask(t.id, token)
            .then((res) => [t.id, res] as [string, TaskAssignment[]])
            .catch(() => [t.id, []] as [string, TaskAssignment[]])
        )
      );
      const map: AssignmentMap = {};
      pairs.forEach(([id, list]) => {
        map[id] = list;
      });
      setAssignmentsByTask(map);
    } finally {
      setTasksLoading(false);
    }
  }, [token, managerId]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const renderTaskCard = (task: Task, index: number) => {
    const active = activeAssignments(task.id);
    const assignments = assignmentsByTask[task.id] || [];
    const pendingCount = assignments.filter((a) => a.status === AssignmentStatus.PENDING).length;
    const openSlots = openSlotsForTask(task);
    const status = deriveStatus(task);
    const isDone = status === "DONE";
    const isFuture = new Date(task.start).getTime() > Date.now();

    const confirmDelete = () => {
      if (!token || !managerId) return;
      Alert.alert(
        "Task löschen?",
        "Kommende Tasks werden entfernt und verschwinden aus dem Kalender.",
        [
          { text: "Abbrechen", style: "cancel" },
          {
            text: "Löschen",
            style: "destructive",
            onPress: async () => {
              try {
                setTasksLoading(true);
                await deleteTaskApi(task.id, token);
                await loadTasks();
              } catch (err: any) {
                Alert.alert("Fehler", err?.message || "Task konnte nicht gelöscht werden.");
              } finally {
                setTasksLoading(false);
              }
            },
          },
        ]
      );
    };

    return (
      <Pressable
        key={task.id}
        style={[
          styles.taskCardSurface,
          styles.taskCardContainer,
          isDone ? styles.taskCardDone : styles.taskCardCollapsed,
        ]}
        onPress={() =>
          router.push({
            pathname: "/tasks/[id]",
            params: { id: task.id },
          })
        }
      >
        <View style={styles.taskCardHeader}>
          <Text
            style={[styles.title, styles.taskCardTitle, styles.taskCardTitleEllipsis]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            #{index + 1} {task.company}
          </Text>
          {isFuture && !isDone && (
            <Pressable onPress={confirmDelete} style={{ marginRight: 8 }}>
              <Text style={[styles.taskListAction, { color: "#ef4444" }]}>
                Löschen
              </Text>
            </Pressable>
          )}
          <Text
            style={[
              styles.taskCardStatus,
              status === "DONE"
                ? styles.taskCardStatusDone
                : status === "RUNNING"
                ? styles.taskCardStatusRunning
                : styles.taskCardStatusOpen,
            ]}
          >
            {status === "OPEN"
              ? "Offen"
              : status === "RUNNING"
              ? "Laufend"
              : "Fertig"}
          </Text>
        </View>
        <Text style={styles.taskCardLocation}>{task.location}</Text>
        <Text style={styles.taskCardMeta}>
          {formatDate(task.start)} | {formatTimeRange(task.start, task.end)}
        </Text>
        <Text style={[styles.taskCardMeta, styles.taskCardMetaSpacer]}>
          Bedarf: {task.requiredEmployees} | Zugewiesen: {active.length} | Offen: {openSlots} | Pending: {pendingCount}
        </Text>

        <View style={styles.doneAssignmentsContainer}>
          <Text style={styles.taskAssignLabel}>Mitarbeiter</Text>
          {assignments.length === 0 ? (
            <Text style={styles.taskAssignBusy}>Keine Zuweisungen</Text>
          ) : (
            assignments.map((a) => {
              const emp = employees.find((e) => e.id === a.employeeId);
              return (
                <View key={a.id} style={styles.doneAssignmentRow}>
                  <Text style={styles.doneAssignmentName}>
                    {emp ? `${emp.firstName} ${emp.lastName}` : a.employeeId}
                  </Text>
                  <Text style={styles.doneAssignmentStatus}>
                    Status: {a.status}
                  </Text>
                </View>
              );
            })
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.taskHubSafeArea}>
      <View style={styles.taskScreenContent}>
        <TaskDashboard
          finishedCount={finishedCount}
          openCount={openCount}
          runningCount={runningCount}
          onCreatePress={() =>
            router.push({
              pathname: "/tasks/create",
            })
          }
          activeStatus={statusFilter}
          onSelectStatus={(s) => setStatusFilter(s)}
          styles={styles}
        />

        <View style={styles.taskFilterSection}>
          <Text style={styles.taskFilterTitle}>Status</Text>
          <View style={styles.statusFilterRow}>
            {[
              { key: "ALL", label: "Alle" },
              { key: "OPEN", label: "Offen" },
              { key: "RUNNING", label: "Laufend" },
              { key: "DONE", label: "Fertig" },
            ].map((item) => (
              <Pressable
                key={item.key}
                onPress={() => setStatusFilter(item.key as StatusFilter)}
                style={[
                  styles.requestsSegmentTab,
                  styles.statusFilterChip,
                  statusFilter === item.key
                    ? styles.requestsSegmentTabActive
                    : styles.requestsSegmentTabInactive,
                ]}
              >
                <Text
                  style={
                    statusFilter === item.key
                      ? styles.requestsSegmentTextActive
                      : styles.requestsSegmentText
                  }
                >
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View
          style={[styles.taskFilterSection, styles.taskFilterSectionSpacing]}
        >
          <Text style={styles.taskFilterTitle}>Mitarbeiter</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.employeeFilterContent}
          >
            {users.map((user) => (
              <Pressable
                key={user.id}
                onPress={() => setUserFilter(user.id)}
                style={[
                  styles.requestsSegmentTab,
                  styles.employeeFilterChip,
                  userFilter === user.id
                    ? styles.requestsSegmentTabActive
                    : styles.requestsSegmentTabInactive,
                ]}
              >
                <Text
                  style={
                    userFilter === user.id
                      ? styles.requestsSegmentTextActive
                      : styles.requestsSegmentText
                  }
                >
                  {user.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <ScrollView
          style={styles.taskListScroll}
          contentContainerStyle={styles.taskListContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.taskListHeader}>
            <Text style={styles.taskListTitle}>Tasks</Text>
            <Pressable onPress={loadTasks}>
              <Text style={styles.taskListAction}>Aktualisieren</Text>
            </Pressable>
          </View>
          {tasksLoading && filteredTasks.length === 0 ? (
            <Text style={styles.taskListEmptyText}>
              Tasks werden geladen...
            </Text>
          ) : filteredTasks.length === 0 ? (
            <Text style={styles.taskListEmptyText}>
              Keine Tasks für diesen Filter.
            </Text>
          ) : (
            filteredTasks.map((t, idx) => renderTaskCard(t, idx))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

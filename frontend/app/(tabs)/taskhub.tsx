import { useAppSelector } from "@/src/hooks/useRedux";
import TaskDashboard from "@/src/screens/Tasks/TaskDashboard";
import {
  assignEmployeeToTask,
  fetchAssignmentsForTask,
  fetchManagerCalendarEvents,
  fetchTasksForManager,
  listEmployeesUnderManager,
} from "@/src/services/api";
import { useThemeMode } from "@/src/theme/ThemeProvider";
import { DarkColors, LightColors } from "@/src/theme/colors";
import { makeStyles } from "@/src/theme/styles";
import {
  AssignmentStatus,
  CalendarEvent,
  Employee,
  Task,
  TaskAssignment,
  UserRole,
} from "@/src/types/resources";
import { MaterialCommunityIcons } from "@expo/vector-icons";
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

const overlaps = (startA: number, endA: number, startB: number, endB: number) =>
  startA < endB && endA > startB;

export default function TaskHub() {
  const token = useAppSelector((s) => s.auth.token?.token);
  const role = useAppSelector((s) => s.auth.user?.role);
  const managerId = useAppSelector((s) => s.auth.user?.id);

  const { isDark } = useThemeMode();
  const styles = makeStyles(isDark);
  const palette = isDark ? DarkColors : LightColors;
  const router = useRouter();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [userFilter, setUserFilter] = useState<string>("ALL");
  const [showStatus, setShowStatus] = useState(true);
  const [showEmployees, setShowEmployees] = useState(true);
  const [showTasks, setShowTasks] = useState(true);

  // --- Data state -----------------------------------------------------------
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [assignmentsByTask, setAssignmentsByTask] = useState<AssignmentMap>({});
  const [tasksLoading, setTasksLoading] = useState(false);

  // --- Selection for assigning ---------------------------------------------
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedTaskEmployees, setSelectedTaskEmployees] = useState<string[]>(
    []
  );
  const [assigningTaskId, setAssigningTaskId] = useState<string | null>(null);

  const busyEventFor = useCallback(
    (employeeId: string, startIso: string, endIso: string) => {
      const s = new Date(startIso).getTime();
      const e = new Date(endIso).getTime();
      return events.find((ev) => {
        if (ev.employeeId !== employeeId) return false;
        const es = new Date(ev.start).getTime();
        const ee = new Date(ev.end).getTime();
        return overlaps(es, ee, s, e);
      });
    },
    [events]
  );

  const selectedTask = useMemo(
    () => tasks.find((t) => t.id === selectedTaskId) || null,
    [tasks, selectedTaskId]
  );

  // Helpers ------------------------------------------------------------------
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

  const now = Date.now();
  const deriveStatus = useCallback(
    (task: Task): Exclude<StatusFilter, "ALL"> => {
      const end = new Date(task.end).getTime();
      const start = new Date(task.start).getTime();
      if (end < now) return "DONE";
      if (start <= now && now <= end) return "RUNNING";
      return openSlotsForTask(task) > 0 ? "OPEN" : "RUNNING";
    },
    [now, openSlotsForTask]
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
          activeAssignments(task.id).some((a) => a.employeeId === userFilter);
        return statusMatch && userMatch;
      }),
    [tasks, deriveStatus, statusFilter, userFilter, activeAssignments]
  );

  const availableEmployeesForTask = useCallback(
    (task: Task) => {
      return employees.map((emp, idx) => {
        const busy = busyEventFor(emp.id, task.start, task.end);
        return { emp, busy, colorIndex: idx };
      });
    },
    [employees, busyEventFor]
  );

  // Guards -------------------------------------------------------------------
  if (role !== UserRole.MANAGER) {
    return (
      <SafeAreaView style={styles.taskHubSafeArea}>
        <Text style={styles.title}>Create Task</Text>
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
        const [emps, evs] = await Promise.all([
          listEmployeesUnderManager(managerId, token),
          fetchManagerCalendarEvents(token),
        ]);
        setEmployees(emps);
        setEvents(evs);
      } catch {
        // ignore; form handles errors on submit
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

  useEffect(() => {
    setSelectedTaskEmployees([]);
  }, [selectedTaskId]);

  // Actions ------------------------------------------------------------------
  const handleAssignSelected = async () => {
    if (!token || !selectedTask || selectedTaskEmployees.length === 0) return;
    try {
      setAssigningTaskId(selectedTask.id);
      await Promise.all(
        selectedTaskEmployees.map((empId) =>
          assignEmployeeToTask(
            {
              taskId: selectedTask.id,
              employeeId: empId,
              status: AssignmentStatus.PENDING,
            },
            token
          )
        )
      );
      Alert.alert(
        "Anfrage gesendet",
        "Die ausgewählten Mitarbeiter erhalten eine Anfrage."
      );
      setSelectedTaskEmployees([]);
      setSelectedTaskId(null);
      loadTasks();
    } catch (err: any) {
      Alert.alert(
        "Fehler",
        err?.message || "Employee konnte nicht zugewiesen werden."
      );
    } finally {
      setAssigningTaskId(null);
    }
  };

  const renderTaskCard = (task: Task, index: number) => {
    const active = activeAssignments(task.id);
    const doneAssignments =
      (assignmentsByTask[task.id] || []).filter(
        (a) => a.status === AssignmentStatus.ACCEPTED
      ) || [];
    const openSlots = openSlotsForTask(task);
    const isExpanded = selectedTaskId === task.id;
    const employeesForTask = availableEmployeesForTask(task);
    const status = deriveStatus(task);
    const isDone = status === "DONE";

    return (
      <Pressable
        key={task.id}
        style={[
          styles.card,
          styles.taskCardContainer,
          isExpanded ? styles.taskCardExpanded : styles.taskCardCollapsed,
          isDone ? styles.taskCardDone : null,
        ]}
        onPress={() => {
          if (isDone) return;
          setSelectedTaskId((prev) => (prev === task.id ? null : task.id));
        }}
      >
        <View style={styles.taskCardHeader}>
          <Text style={[styles.title, styles.taskCardTitle]}>
            #{index + 1} {task.company}
          </Text>
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
          Bedarf: {task.requiredEmployees} · Zugewiesen: {active.length} ·
          Offen: {openSlots}
        </Text>

        {isExpanded && !isDone && (
          <View style={styles.taskAssignContainer}>
            <Text style={styles.taskAssignLabel}>Mitarbeiter wählen</Text>
            <ScrollView style={styles.taskAssignScroll}>
              {employeesForTask.map(({ emp, busy, colorIndex }) => {
                const selected = selectedTaskEmployees.includes(emp.id);
                const colors = [
                  "#4C8BFF",
                  "#8e44ad",
                  "#16a085",
                  "#e67e22",
                  "#e74c3c",
                ];
                const color = colors[colorIndex % colors.length];
                const limitReached =
                  selectedTaskEmployees.length >= openSlots && !selected;
                const disabled = !!busy || limitReached || openSlots === 0;

                return (
                  <Pressable
                    key={emp.id}
                    disabled={disabled}
                    onPress={() => {
                      if (selected) {
                        setSelectedTaskEmployees((prev) =>
                          prev.filter((id) => id !== emp.id)
                        );
                      } else if (openSlots > 0 && !limitReached) {
                        setSelectedTaskEmployees((prev) => [...prev, emp.id]);
                      }
                    }}
                    style={[
                      styles.createEmployeeRow,
                      styles.taskAssignRow,
                      selected ? styles.taskAssignRowSelected : null,
                      disabled ? styles.taskAssignRowDisabled : null,
                    ]}
                  >
                    <View
                    style={[
                      styles.createEmployeeSquare,
                      styles.taskAssignSquare,
                      selected ? { backgroundColor: color } : null,
                    ]}
                    />
                    <View style={styles.taskAssignRowTextWrap}>
                      <Text style={styles.taskAssignName}>
                        {emp.firstName} {emp.lastName}
                      </Text>
                      {busy && (
                        <Text style={styles.taskAssignBusy}>
                          (!) Belegt:{" "}
                          {busy.company || busy.location || busy.type || "Job"}
                        </Text>
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
            <Pressable
              style={[
                styles.button,
                (assigningTaskId === task.id ||
                  selectedTaskEmployees.length === 0 ||
                  openSlots === 0) &&
                  styles.buttonDisabled,
              ]}
              onPress={handleAssignSelected}
              disabled={
                assigningTaskId === task.id ||
                selectedTaskEmployees.length === 0 ||
                openSlots === 0
              }
            >
              <Text style={styles.buttonText}>
                {assigningTaskId === task.id
                  ? "Sende..."
                  : "Mitarbeiter anfragen"}
              </Text>
            </Pressable>
          </View>
        )}

        {isDone && doneAssignments.length > 0 && (
          <View style={styles.doneAssignmentsContainer}>
            <Text style={styles.taskAssignLabel}>Mitarbeiter</Text>
            {doneAssignments.map((a) => {
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
            })}
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.taskHubSafeArea}>
      <ScrollView>
        <TaskDashboard
          finishedCount={finishedCount}
          openCount={openCount}
          runningCount={runningCount}
          showOpenTasksList
          onCreatePress={() => router.push("/task-create")}
          onToggleOpenTasks={() => {}}
          styles={styles}
        />

        {/* Status Filter */}
        <View style={[styles.widget, styles.widgetSpacingSm, styles.widgetGap]}>
          <Pressable
            style={styles.accordionHeader}
            onPress={() => setShowStatus((v) => !v)}
          >
            <Text style={styles.widgetTitle}>Status</Text>
            <MaterialCommunityIcons
              name={showStatus ? "chevron-up" : "chevron-down"}
              size={22}
              color={palette.text}
            />
          </Pressable>
          {showStatus && (
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
          )}
        </View>

        {/* Employee Filter */}
        <View style={[styles.widget, styles.widgetSpacingSm, styles.widgetGap]}>
          <Pressable
            style={styles.accordionHeader}
            onPress={() => setShowEmployees((v) => !v)}
          >
            <Text style={styles.widgetTitle}>Mitarbeiter</Text>
            <MaterialCommunityIcons
              name={showEmployees ? "chevron-up" : "chevron-down"}
              size={22}
              color={palette.text}
            />
          </Pressable>
          {showEmployees && (
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
          )}
        </View>

        {/* Task Liste */}
        <View style={[styles.card, styles.widgetSpacingSm, styles.taskListCard]}>
          <Pressable
            style={styles.accordionHeader}
            onPress={() => setShowTasks((v) => !v)}
          >
            <Text style={styles.taskListTitle}>Tasks</Text>
            <MaterialCommunityIcons
              name={showTasks ? "chevron-up" : "chevron-down"}
              size={22}
              color={palette.text}
            />
          </Pressable>
          {showTasks && (
            <>
              <View style={styles.requestsHeaderRow}>
                <View />
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
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

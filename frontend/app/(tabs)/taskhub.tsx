import { useAppSelector } from "@/src/hooks/useRedux";
import OpenTasksList from "@/src/screens/Tasks/OpenTasksList";
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
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type AssignmentMap = Record<string, TaskAssignment[]>;

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

export default function CreateHub() {
  const token = useAppSelector((s) => s.auth.token?.token);
  const role = useAppSelector((s) => s.auth.user?.role);
  const managerId = useAppSelector((s) => s.auth.user?.id);

  const { isDark } = useThemeMode();
  const styles = makeStyles(isDark);
  const palette = isDark ? DarkColors : LightColors;
  const router = useRouter();

  const [showOpenTasksList, setShowOpenTasksList] = useState(false);

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

  const unassignedTasks = useMemo(
    () => tasks.filter((t) => openSlotsForTask(t) > 0),
    [tasks, openSlotsForTask]
  );

  const now = Date.now();
  const finishedCount = useMemo(
    () => tasks.filter((t) => new Date(t.end).getTime() < now).length,
    [tasks, now]
  );
  const runningCount = useMemo(
    () =>
      tasks.filter((t) => {
        const s = new Date(t.start).getTime();
        const e = new Date(t.end).getTime();
        return s <= now && now <= e;
      }).length,
    [tasks, now]
  );
  const openCount = useMemo(
    () => unassignedTasks.length,
    [unassignedTasks.length]
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
      <SafeAreaView style={[styles.screen, { paddingHorizontal: 16 }]}>
        <Text style={styles.title}>Create Task</Text>
        <Text style={{ color: palette.secondary }}>
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
      } catch (err) {
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
        err.message || "Employee konnte nicht zugewiesen werden."
      );
    } finally {
      setAssigningTaskId(null);
    }
  };

  const renderTaskCard = (task: Task, index: number) => {
    const active = activeAssignments(task.id);
    const openSlots = openSlotsForTask(task);
    const isExpanded = selectedTaskId === task.id;
    const employeesForTask = availableEmployeesForTask(task);

    return (
      <Pressable
        key={task.id}
        style={[
          styles.card,
          {
            marginBottom: 12,
            borderColor: isExpanded ? palette.primary : palette.border,
          },
        ]}
        onPress={() =>
          setSelectedTaskId((prev) => (prev === task.id ? null : task.id))
        }
      >
        <Text style={[styles.title, { fontSize: 18 }]}>
          #{index + 1} {task.company}
        </Text>
        <Text style={{ color: palette.text, marginBottom: 4 }}>
          {task.location}
        </Text>
        <Text style={{ color: palette.secondary }}>
          {formatDate(task.start)} | {formatTimeRange(task.start, task.end)}
        </Text>
        <Text style={{ color: palette.secondary, marginTop: 6 }}>
          Bedarf: {task.requiredEmployees} · Zugewiesen: {active.length} ·
          Offen: {openSlots}
        </Text>

        {isExpanded && (
          <View style={{ marginTop: 10 }}>
            <Text style={[styles.createTimeLabel, { marginBottom: 6 }]}>
              Mitarbeiter wählen
            </Text>
            <ScrollView style={{ maxHeight: 220, marginBottom: 10 }}>
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
                      {
                        borderColor: palette.border,
                        backgroundColor: selected
                          ? `${palette.primary}11`
                          : "transparent",
                        opacity: disabled ? 0.5 : 1,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.createEmployeeSquare,
                        {
                          borderWidth: 1,
                          borderColor: palette.border,
                          backgroundColor: selected ? color : "transparent",
                        },
                      ]}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: palette.text }}>
                        {emp.firstName} {emp.lastName}
                      </Text>
                      {busy && (
                        <Text style={{ color: "#e67e22", fontSize: 12 }}>
                          ⚠️ Belegt:{" "}
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
                {
                  opacity:
                    assigningTaskId === task.id ||
                    selectedTaskEmployees.length === 0 ||
                    openSlots === 0
                      ? 0.7
                      : 1,
                },
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
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={[styles.screen, { paddingHorizontal: 16 }]}>
      <ScrollView>
        <TaskDashboard
          finishedCount={finishedCount}
          openCount={openCount}
          runningCount={runningCount}
          showOpenTasksList={showOpenTasksList}
          onCreatePress={() => router.push("/task-create")}
          onToggleOpenTasks={() => setShowOpenTasksList((v) => !v)}
          styles={styles}
        />

        {/* Section: Unassigned Tasks */}
        {showOpenTasksList && (
          <OpenTasksList
            tasksLoading={tasksLoading}
            unassignedTasks={unassignedTasks}
            renderTaskCard={renderTaskCard}
            onRefresh={loadTasks}
            styles={styles}
            palette={palette}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

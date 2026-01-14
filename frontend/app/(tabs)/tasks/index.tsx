import { useAppSelector } from "@/src/hooks/useRedux";
import TaskDashboard from "@/src/screens/Tasks/TaskDashboard";
import {
  fetchAssignmentsForTask,
  fetchTasksForManager,
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
import { useFocusEffect } from "@react-navigation/native";
import moment from "moment";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type AssignmentMap = Record<string, TaskAssignment[]>;
type StatusFilter = "ALL" | "OPEN" | "RUNNING" | "DONE";
type DropdownOption = { value: string; label: string };

type FilterDropdownProps = {
  value: string;
  options: DropdownOption[];
  open: boolean;
  onToggle: () => void;
  onSelect: (value: string) => void;
  styles: ReturnType<typeof makeStyles>;
};

const FilterDropdown = ({
  value,
  options,
  open,
  onToggle,
  onSelect,
  styles,
}: FilterDropdownProps) => {
  const selectedLabel =
    options.find((option) => option.value === value)?.label ?? options[0]?.label;

  return (
    <View style={styles.dropdownWrapper}>
      <Pressable style={styles.dropdownTrigger} onPress={onToggle}>
        <Text style={styles.dropdownTriggerText}>{selectedLabel}</Text>
        <Text style={styles.dropdownTriggerIcon}>{open ? "^" : "v"}</Text>
      </Pressable>
      {open && (
        <View style={styles.dropdownMenu}>
          <ScrollView style={styles.dropdownMenuScroll} nestedScrollEnabled>
            {options.map((option, idx) => {
              const active = option.value === value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => onSelect(option.value)}
                  style={[
                    styles.dropdownItem,
                    idx === options.length - 1 && styles.dropdownItemLast,
                    active && styles.dropdownItemActive,
                  ]}
                >
                  <Text
                    style={
                      active
                        ? styles.dropdownItemTextActive
                        : styles.dropdownItemText
                    }
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

    </View>
  );
};

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
  const token = useAppSelector((s) => s.auth.token?.accessToken);
  const role = useAppSelector((s) => s.auth.user?.role);
  const managerId = useAppSelector((s) => s.auth.user?.id);

  const { isDark } = useThemeMode();
  const styles = makeStyles(isDark);
  const router = useRouter();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [userFilter, setUserFilter] = useState<string>("ALL");
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

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
      const now = moment();
      const start = moment(task.start);
      const end = moment(task.end);
      if (end.isBefore(now)) return "DONE";
      const isToday = now.isSame(start, "day");
      const isInRange = now.isBetween(start, end, undefined, "[]");
      if (isToday && isInRange) return "RUNNING";
      return "OPEN";
    },
    []
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

  const statusOptions = useMemo(
    () => [
      { value: "ALL", label: "Alle" },
      { value: "OPEN", label: "Offen" },
      { value: "RUNNING", label: "Laufend" },
      { value: "DONE", label: "Fertig" },
    ],
    []
  );

  const userOptions = useMemo(
    () => users.map((user) => ({ value: user.id, label: user.name })),
    [users]
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
      })
        .sort((a, b) => {
          const startDiff = moment(a.start).valueOf() - moment(b.start).valueOf();
          if (startDiff !== 0) return startDiff;
          return moment(a.end).valueOf() - moment(b.end).valueOf();
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

  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [loadTasks])
  );

  const renderTaskCard = (task: Task, index: number) => {
    const active = activeAssignments(task.id);
    const assignments = assignmentsByTask[task.id] || [];
    const pendingCount = assignments.filter((a) => a.status === AssignmentStatus.PENDING).length;
    const openSlots = openSlotsForTask(task);
    const status = deriveStatus(task);
    const isDone = status === "DONE";
    const isExpanded = expandedTaskId === task.id;
    const statusLabel =
      status === "OPEN" ? "Offen" : status === "RUNNING" ? "Laufend" : "Fertig";
    const statusCardStyle =
      status === "DONE"
        ? styles.taskCardSurfaceDone
        : status === "RUNNING"
        ? styles.taskCardSurfaceRunning
        : styles.taskCardSurfaceOpen;

    /*
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
    */

    return (
      <View
        key={task.id}
        style={[
          styles.taskCardSurface,
          styles.taskCardContainer,
          isDone ? styles.taskCardDone : styles.taskCardCollapsed,
          isExpanded ? styles.taskCardExpanded : null,
          statusCardStyle,
        ]}
      >
        <Pressable
          style={styles.taskCardHeader}
          onPress={() =>
            setExpandedTaskId((prev) => (prev === task.id ? null : task.id))
          }
        >
          <Text
            style={[styles.title, styles.taskCardTitle, styles.taskCardTitleEllipsis]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            #{index + 1} {task.company}
          </Text>
          <View style={styles.taskAccordionHeaderRight}>
            {/*
            <Pressable onPress={confirmDelete} style={{ marginRight: 8 }}>
              <Text style={[styles.taskListAction, { color: "#ef4444" }]}>
                Löschen
              </Text>
            </Pressable>
          */}
          {isExpanded && (
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
              Status: {statusLabel}
            </Text>
          )}
          <Text style={styles.taskAccordionChevron}>
            {isExpanded ? "^" : "v"}
          </Text>
        </View>
        </Pressable>
        {isExpanded && (
          <View style={styles.taskAccordionBody}>
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/tasks/[id]",
                  params: { id: task.id },
                })
              }
              style={styles.taskAccordionDetails}
            >
              <Text style={styles.taskAccordionDetailsText}>Details</Text>
            </Pressable>

            <Text style={styles.taskCardLocation}>{task.location}</Text>
            <Text style={styles.taskCardMeta}>
              {formatDate(task.start)} | {formatTimeRange(task.start, task.end)}
            </Text>
            <Text style={[styles.taskCardMeta, styles.taskCardMetaSpacer]}>
              Bedarf: {task.requiredEmployees} | Zugewiesen: {active.length} |
              Offen: {openSlots} | Pending: {pendingCount}
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
          </View>
        )}
      </View>
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

        <View style={styles.taskFilterRow}>
          <View style={[styles.taskFilterSection, styles.taskFilterColumn]}>
            <Text style={styles.taskFilterTitle}>Status</Text>
            <FilterDropdown
              value={statusFilter}
              options={statusOptions}
              open={statusDropdownOpen}
              onToggle={() => {
                setStatusDropdownOpen((prev) => !prev);
                setUserDropdownOpen(false);
              }}
              onSelect={(value) => {
                setStatusFilter(value as StatusFilter);
                setStatusDropdownOpen(false);
              }}
              styles={styles}
            />
          </View>

          <View style={[styles.taskFilterSection, styles.taskFilterColumn]}>
            <Text style={styles.taskFilterTitle}>Mitarbeiter</Text>
            <FilterDropdown
              value={userFilter}
              options={userOptions}
              open={userDropdownOpen}
              onToggle={() => {
                setUserDropdownOpen((prev) => !prev);
                setStatusDropdownOpen(false);
              }}
              onSelect={(value) => {
                setUserFilter(value);
                setUserDropdownOpen(false);
              }}
              styles={styles}
            />
          </View>
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
          <View style={styles.taskLegendRow}>
            {[
              { label: "Offen", style: styles.taskStatusDotOpen },
              { label: "Laufend", style: styles.taskStatusDotRunning },
              { label: "Fertig", style: styles.taskStatusDotDone },
              { label: "Abgelehnt", style: styles.taskStatusDotDeclined },
            ].map((item) => (
              <View key={item.label} style={styles.taskLegendItem}>
                <View style={[styles.taskLegendDot, item.style]} />
                <Text style={styles.taskLegendLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
          {tasksLoading && filteredTasks.length === 0 ? (
            <Text style={styles.taskListEmptyText}>
              Tasks werden geladen...
            </Text>
          ) : filteredTasks.length === 0 ? (
            <Text style={styles.taskListEmptyText}>
              Keine Tasks fuer diesen Filter.
            </Text>
          ) : (
            filteredTasks.map((t, idx) => renderTaskCard(t, idx))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

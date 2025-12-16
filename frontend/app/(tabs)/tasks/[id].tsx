import { useAppSelector } from "@/src/hooks/useRedux";
import {
  assignEmployeeToTask,
  fetchAssignmentsForTask,
  fetchTaskById,
  listEmployeesUnderManager,
  updateAssignmentStatusApi,
  updateTaskApi,
} from "@/src/services/api";
import { useThemeMode } from "@/src/theme/ThemeProvider";
import { DarkColors, LightColors } from "@/src/theme/colors";
import { makeStyles } from "@/src/theme/styles";
import {
  AssignmentStatus,
  Employee,
  Task,
  TaskAssignment,
  UserRole,
} from "@/src/types/resources";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type AssignmentMap = Record<string, TaskAssignment>;

export default function TaskDetailsScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const token = useAppSelector((s) => s.auth.token?.token);
  const role = useAppSelector((s) => s.auth.user?.role);
  const managerId = useAppSelector((s) => s.auth.user?.id);

  const { isDark } = useThemeMode();
  const styles = makeStyles(isDark);
  const palette = isDark ? DarkColors : LightColors;
  const router = useRouter();

  const [task, setTask] = useState<Task | null>(null);
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [requiredEmployees, setRequiredEmployees] = useState("1");
  const [assignments, setAssignments] = useState<AssignmentMap>({});
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [capacityWarning, setCapacityWarning] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);

  const syncFormWithTask = (t: Task) => {
    setCompany(t.company);
    setLocation(t.location);
    setRequiredEmployees(String(t.requiredEmployees));
  };

  const isManager = role === UserRole.MANAGER;

  const assignedIds = useMemo(
    () =>
      Object.values(assignments)
        .filter((a) => a.status !== AssignmentStatus.DECLINED)
        .map((a) => a.employeeId),
    [assignments]
  );

  const acceptedCount = useMemo(
    () =>
      Object.values(assignments).filter(
        (a) => a.status === AssignmentStatus.ACCEPTED
      ).length,
    [assignments]
  );

  const currentCapacity = Math.max(1, Number(requiredEmployees) || 1);

  const status: "OPEN" | "RUNNING" | "DONE" = useMemo(() => {
    if (!task) return "OPEN";
    const now = Date.now();
    const start = new Date(task.start).getTime();
    const end = new Date(task.end).getTime();
    if (end < now) return "DONE";
    if (start <= now && now <= end) return "RUNNING";
    return "OPEN";
  }, [task]);

  const canEdit = status === "OPEN";

  useEffect(() => {
    if (task) {
      syncFormWithTask(task);
    }
  }, [task]);

  const loadData = async () => {
    if (!token || !managerId || !id) return;
    try {
      setLoading(true);
      const [t, emps, assigns] = await Promise.all([
        fetchTaskById(id, token),
        listEmployeesUnderManager(managerId, token),
        fetchAssignmentsForTask(id, token),
      ]);
      setTask(t);
      setCompany(t.company);
      setLocation(t.location);
      setRequiredEmployees(String(t.requiredEmployees));
      const map: AssignmentMap = {};
      assigns.forEach((a) => {
        map[a.employeeId] = a;
      });
      setAssignments(map);
      setEmployees(emps);
      setEditMode(false);
    } catch (err: any) {
      Alert.alert("Fehler", err?.message || "Task konnte nicht geladen werden.");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, managerId, id]);

  const refreshAssignments = async () => {
    if (!token || !id) return;
    const fresh = await fetchAssignmentsForTask(id, token);
    const map: AssignmentMap = {};
    fresh.forEach((a) => (map[a.employeeId] = a));
    setAssignments(map);
    return fresh;
  };

  if (!isManager) {
    return (
      <SafeAreaView style={styles.taskHubSafeArea}>
        <ScrollView contentContainerStyle={styles.taskCreateContent}>
          <Text style={styles.title}>Task</Text>
          <Text style={{ color: palette.secondary }}>
            Nur Manager können Tasks bearbeiten.
          </Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (!task || loading) {
    return (
      <SafeAreaView style={styles.taskHubSafeArea}>
        <View style={styles.centerWrapper}>
          <Text style={{ color: palette.text, opacity: 0.8 }}>
            {loading ? "Lade Task..." : "Task nicht gefunden."}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleSave = async () => {
    if (!token || !id) return;
    if (!canEdit || !editMode) {
      Alert.alert("Nicht möglich", "Nur offene Tasks können bearbeitet werden.");
      return;
    }
    if (!company.trim() || !location.trim()) {
      Alert.alert("Fehlende Felder", "Firma und Standort dürfen nicht leer sein.");
      return;
    }
    const required = Math.max(1, Number(requiredEmployees) || 1);
    try {
      setSaving(true);
      const payload: Partial<Task> = {
        id: task.id,
        managerId: task.managerId || managerId || "",
        company: company.trim(),
        location: location.trim(),
        requiredEmployees: required,
        start: task.start,
        end: task.end,
        responseDeadline: task.responseDeadline || null,
      };
      const updated = await updateTaskApi(id, payload, token);
      setTask(updated);
      setCapacityWarning(null);

      // Nach dem Speichern: Pending Requests auf Kapazität reduzieren
      const fresh = await fetchAssignmentsForTask(id, token);
      const accepted = fresh.filter((a) => a.status === AssignmentStatus.ACCEPTED);
      const pending = fresh.filter((a) => a.status === AssignmentStatus.PENDING);
      const slots = Math.max(required - accepted.length, 0);
      if (pending.length > slots) {
        const toDecline = pending.slice(slots); // überzählige Pending ablehnen
        if (toDecline.length > 0) {
          await Promise.all(
            toDecline.map((a) =>
              updateAssignmentStatusApi(a.id, AssignmentStatus.DECLINED, token)
            )
          );
          setCapacityWarning(
            "Überzählige offene Anfragen wurden abgelehnt, um die Kapazität einzuhalten."
          );
        }
      }
      const map: AssignmentMap = {};
      (await fetchAssignmentsForTask(id, token)).forEach((a) => (map[a.employeeId] = a));
      setAssignments(map);
      setEditMode(false);

      Alert.alert("Gespeichert", "Task wurde aktualisiert.");
    } catch (err: any) {
      Alert.alert("Fehler", err?.message || "Task konnte nicht aktualisiert werden.");
    } finally {
      setSaving(false);
    }
  };

  const assignEmployee = async (employeeId: string) => {
    if (!token || !id) return;
    if (!canEdit || !editMode) {
      Alert.alert("Nicht möglich", "Nur offene Tasks können bearbeitet werden.");
      return;
    }
    if (assignedIds.length >= currentCapacity) {
      Alert.alert("Kapazität erreicht", "Alle Plätze sind bereits vergeben.");
      return;
    }
    try {
      await assignEmployeeToTask(
        { taskId: id, employeeId, status: AssignmentStatus.PENDING },
        token
      );
      await refreshAssignments();
    } catch (err: any) {
      Alert.alert("Fehler", err?.message || "Mitarbeiter konnte nicht zugewiesen werden.");
    }
  };

  const handleToggleEdit = () => {
    if (!canEdit) {
      Alert.alert("Nicht möglich", "Nur offene Tasks können bearbeitet werden.");
      return;
    }
    if (editMode) {
      if (task) syncFormWithTask(task);
      setCapacityWarning(null);
      setEditMode(false);
      return;
    }
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    if (task) syncFormWithTask(task);
    setCapacityWarning(null);
    setEditMode(false);
  };

  const removeAssignment = async (employeeId: string) => {
    if (!token || !id) return;
    if (!canEdit || !editMode) {
      Alert.alert("Nicht möglich", "Nur offene Tasks können bearbeitet werden.");
      return;
    }
    const assignment = assignments[employeeId];
    if (!assignment) return;
    try {
      await updateAssignmentStatusApi(assignment.id, AssignmentStatus.DECLINED, token);
      await refreshAssignments();
    } catch (err: any) {
      Alert.alert("Fehler", err?.message || "Mitarbeiter konnte nicht entfernt werden.");
    }
  };

  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString(undefined, {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <SafeAreaView style={styles.taskHubSafeArea}>
      <ScrollView contentContainerStyle={styles.taskCreateContent}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={styles.title}>Task Details</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Text style={{ color: palette.secondary, fontWeight: "600" }}>
              Status: {status === "OPEN" ? "Offen" : status === "RUNNING" ? "Laufend" : "Fertig"}
            </Text>
            <TouchableOpacity
              onPress={handleToggleEdit}
              disabled={!canEdit}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={{ padding: 6, opacity: canEdit ? 1 : 0.4 }}
            >
              <MaterialCommunityIcons
                name={editMode ? "close" : "pencil"}
                size={20}
                color={palette.primary}
              />
            </TouchableOpacity>
          </View>
        </View>
        {capacityWarning && (
          <Text style={[styles.error, { marginBottom: 8 }]}>{capacityWarning}</Text>
        )}

        <View style={styles.cardWrapper}>
          {editMode ? (
            <>
              <Text style={styles.label}>Firma</Text>
              <TextInput
                style={styles.input}
                value={company}
                onChangeText={setCompany}
                placeholder="Firma"
                placeholderTextColor={palette.secondary}
                editable={canEdit}
              />

              <Text style={styles.label}>Standort</Text>
              <TextInput
                style={styles.input}
                value={location}
                onChangeText={setLocation}
                placeholder="Standort"
                placeholderTextColor={palette.secondary}
                editable={canEdit}
              />

              <Text style={styles.label}>Benötigte Mitarbeiter</Text>
              <TextInput
                style={styles.input}
                value={requiredEmployees}
                onChangeText={setRequiredEmployees}
                keyboardType="numeric"
                placeholder="Anzahl"
                placeholderTextColor={palette.secondary}
                editable={canEdit}
              />

              <Text style={styles.label}>Zeitfenster</Text>
              <Text style={styles.taskCardMeta}>
                {formatDateTime(task.start)} - {formatDateTime(task.end)}
              </Text>

              <View style={[styles.profileButtonRow, { marginTop: 6 }]}>
                <TouchableOpacity
                  style={[styles.button, styles.profileActionButton]}
                  onPress={handleSave}
                  disabled={saving || !canEdit}
                >
                  <Text style={styles.buttonText}>
                    {saving ? "Speichern..." : "Änderungen speichern"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.profileActionButton,
                    styles.profileCancelButton,
                  ]}
                  onPress={handleCancelEdit}
                  disabled={saving}
                >
                  <Text
                    style={[styles.buttonText, styles.profileCancelButtonText]}
                  >
                    Abbrechen
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <View>
                <Text style={styles.textMuted}>Firma</Text>
                <Text style={styles.text}>{task.company || "-"}</Text>
              </View>
              <View>
                <Text style={styles.textMuted}>Standort</Text>
                <Text style={styles.text}>{task.location || "-"}</Text>
              </View>
              <View>
                <Text style={styles.textMuted}>Benötigte Mitarbeiter</Text>
                <Text style={styles.text}>{task.requiredEmployees}</Text>
              </View>
              <View>
                <Text style={styles.textMuted}>Zeitfenster</Text>
                <Text style={styles.taskCardMeta}>
                  {formatDateTime(task.start)} - {formatDateTime(task.end)}
                </Text>
              </View>
            </>
          )}
        </View>

        <View style={[styles.cardWrapper, { marginTop: 12 }]}>
          <Text style={styles.label}>Zugewiesene Mitarbeiter</Text>
          {assignedIds.length === 0 ? (
            <Text style={styles.taskAssignBusy}>Keine Zuweisungen</Text>
          ) : (
            assignedIds.map((empId) => {
              const emp = employees.find((e) => e.id === empId);
              const assignment = assignments[empId];
              return (
                <View
                  key={empId}
                  style={[
                    styles.doneAssignmentRow,
                    {
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    },
                  ]}
                >
                  <View>
                    <Text style={styles.doneAssignmentName}>
                      {emp ? `${emp.firstName} ${emp.lastName}` : empId}
                    </Text>
                    <Text style={styles.doneAssignmentStatus}>
                      Status: {assignment?.status || "PENDING"}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => removeAssignment(empId)}
                    disabled={!canEdit || !editMode}
                  >
                    <Text
                      style={[
                        styles.taskListAction,
                        { color: !canEdit || !editMode ? palette.secondary : "#ef4444" },
                      ]}
                    >
                      Entfernen
                    </Text>
                  </Pressable>
                </View>
              );
            })
          )}
        </View>

        <View style={[styles.cardWrapper, { marginTop: 12 }]}>
          <Text style={styles.label}>Mitarbeiter hinzufügen</Text>
          {employees.map((emp) => {
            const assigned = assignedIds.includes(emp.id);
            const assignment = assignments[emp.id];
            const disableAdd = assigned || assignedIds.length >= currentCapacity || !canEdit || !editMode;
            return (
              <View
                key={emp.id}
                style={[
                  styles.doneAssignmentRow,
                  {
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  },
                ]}
              >
                <View>
                  <Text style={styles.doneAssignmentName}>
                    {emp.firstName} {emp.lastName}
                  </Text>
                  {assignment && (
                    <Text style={styles.doneAssignmentStatus}>
                      Status: {assignment.status}
                    </Text>
                  )}
                </View>
                {assigned ? (
                  <Text style={[styles.taskAssignBusy, { marginRight: 8 }]}>
                    Bereits zugewiesen
                  </Text>
                ) : (
                  <Pressable onPress={() => assignEmployee(emp.id)} disabled={disableAdd}>
                    <Text
                      style={[
                        styles.taskListAction,
                        { color: disableAdd ? palette.secondary : palette.primary },
                      ]}
                    >
                      Hinzufügen
                    </Text>
                  </Pressable>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

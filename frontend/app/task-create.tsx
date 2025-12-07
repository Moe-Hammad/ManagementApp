import { useAppSelector } from "@/src/hooks/useRedux";
import {
  assignEmployeeToTask,
  createTaskApi,
  fetchManagerCalendarEvents,
  listEmployeesUnderManager,
} from "@/src/services/api";
import { useThemeMode } from "@/src/theme/ThemeProvider";
import { DarkColors, LightColors } from "@/src/theme/colors";
import { makeStyles } from "@/src/theme/styles";
import {
  AssignmentStatus,
  CalendarEvent,
  Employee,
  UserRole,
} from "@/src/types/resources";
import TaskCreateForm from "@/src/screens/Tasks/TaskCreateForm";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TaskCreateScreen() {
  const token = useAppSelector((s) => s.auth.token?.token);
  const role = useAppSelector((s) => s.auth.user?.role);
  const managerId = useAppSelector((s) => s.auth.user?.id);

  const { isDark } = useThemeMode();
  const styles = makeStyles(isDark);
  const palette = isDark ? DarkColors : LightColors;
  const router = useRouter();

  const [company, setCompany] = useState("");
  const [street, setStreet] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [requiredEmployees, setRequiredEmployees] = useState("1");
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("17:00");
  const [responseDeadline, setResponseDeadline] = useState("");
  const [responseDeadlineTime, setResponseDeadlineTime] = useState("17:00");
  const [submitting, setSubmitting] = useState(false);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [createSelectedEmployees, setCreateSelectedEmployees] = useState<
    string[]
  >([]);

  const combineDateTime = (date: Date, timeStr: string) => {
    return new Date(`${date.toISOString().slice(0, 10)}T${timeStr}:00`);
  };

  const startDateTime = combineDateTime(selectedDate, startTime);
  const endDateTime = combineDateTime(selectedDate, endTime);

  const busyEventFor = useCallback(
    (employeeId: string, startIso: string, endIso: string) => {
      const s = new Date(startIso).getTime();
      const e = new Date(endIso).getTime();
      return events.find((ev) => {
        if (ev.employeeId !== employeeId) return false;
        const es = new Date(ev.start).getTime();
        const ee = new Date(ev.end).getTime();
        return s < ee && e > es;
      });
    },
    [events]
  );

  const availableEmployeesForNewTask = useMemo(() => {
    return employees.map((emp, idx) => {
      const busy = busyEventFor(
        emp.id,
        startDateTime.toISOString(),
        endDateTime.toISOString()
      );
      return { emp, busy, colorIndex: idx };
    });
  }, [employees, startDateTime, endDateTime, busyEventFor]);

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
        // ignore load errors here; form validates on submit
      }
    })();
  }, [token, managerId]);

  const handleCreateTask = async () => {
    if (!token) return;
    if (!company || !street || !houseNumber || !postalCode) {
      Alert.alert(
        "Fehlende Felder",
        "Bitte Firma, Straße, Hausnummer und PLZ ausfüllen."
      );
      return;
    }
    if (endDateTime <= startDateTime) {
      Alert.alert("Zeitfenster ungültig", "Ende muss nach Start liegen.");
      return;
    }
    try {
      setSubmitting(true);
      const location = `${street.trim()} ${houseNumber.trim()}, ${postalCode.trim()}`;
      const payload = {
        company,
        location,
        requiredEmployees: Number(requiredEmployees) || 1,
        start: startDateTime.toISOString(),
        end: endDateTime.toISOString(),
        responseDeadline: responseDeadline || null,
      };
      const task = await createTaskApi(payload, token);

      const limit = Math.max(1, Number(requiredEmployees) || 1);
      const assignees = createSelectedEmployees.slice(0, limit);
      if (assignees.length > 0) {
        await Promise.all(
          assignees.map((empId) =>
            assignEmployeeToTask(
              {
                taskId: task.id,
                employeeId: empId,
                status: AssignmentStatus.PENDING,
              },
              token
            )
          )
        );
      }

      Alert.alert(
        "Erfolg",
        assignees.length > 0
          ? "Task wurde erstellt und Anfragen wurden gesendet."
          : "Task wurde erstellt.",
        [{ text: "OK", onPress: () => router.back() }]
      );
      setCompany("");
      setStreet("");
      setHouseNumber("");
      setPostalCode("");
      setRequiredEmployees("1");
      setResponseDeadline("");
      setCreateSelectedEmployees([]);
    } catch (err: any) {
      Alert.alert("Fehler", err.message || "Task konnte nicht erstellt werden.");
    } finally {
      setSubmitting(false);
    }
  };

  if (role !== UserRole.MANAGER) {
    return (
      <SafeAreaView style={[styles.screen, { paddingHorizontal: 16 }]}>
        <Text style={styles.title}>Task erstellen</Text>
        <Text style={{ color: palette.secondary }}>
          Nur Manager können Tasks anlegen.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.screen, { paddingHorizontal: 16 }]}>
      <ScrollView>
        <View style={styles.breadcrumbsContainer}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.breadcrumbsLink}>Zurück</Text>
          </Pressable>
          <Text style={styles.breadcrumbsSeparator}>/</Text>
          <Text style={styles.breadcrumbsCurrent}>Task erstellen</Text>
        </View>

        <TaskCreateForm
          company={company}
          street={street}
          houseNumber={houseNumber}
          postalCode={postalCode}
          requiredEmployees={requiredEmployees}
          selectedDate={selectedDate}
          startTime={startTime}
          endTime={endTime}
          responseDeadline={responseDeadline}
          responseDeadlineTime={responseDeadlineTime}
          palette={palette}
          styles={styles}
          submitting={submitting}
          availableEmployeesForNewTask={availableEmployeesForNewTask}
          createSelectedEmployees={createSelectedEmployees}
          setCompany={setCompany}
          setStreet={setStreet}
          setHouseNumber={setHouseNumber}
          setPostalCode={setPostalCode}
          setRequiredEmployees={setRequiredEmployees}
          setSelectedDate={setSelectedDate}
          setStartTime={setStartTime}
          setEndTime={setEndTime}
          setResponseDeadline={setResponseDeadline}
          setResponseDeadlineTime={setResponseDeadlineTime}
          setCreateSelectedEmployees={setCreateSelectedEmployees}
          onSubmit={handleCreateTask}
          combineDateTime={combineDateTime}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

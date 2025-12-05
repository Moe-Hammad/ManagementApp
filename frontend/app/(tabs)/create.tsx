import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppSelector } from "@/src/hooks/useRedux";
import { useThemeMode } from "@/src/theme/ThemeProvider";
import { makeStyles } from "@/src/theme/styles";
import { DarkColors, LightColors } from "@/src/theme/colors";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  createTaskApi,
  assignEmployeeToTask,
  fetchManagerCalendarEvents,
  listEmployeesUnderManager,
} from "@/src/services/api";
import {
  Task,
  AssignmentStatus,
  UserRole,
  Employee,
  CalendarEvent,
} from "@/src/types/resources";

export default function Create() {
  const token = useAppSelector((s) => s.auth.token?.token);
  const role = useAppSelector((s) => s.auth.user?.role);
  const managerId = useAppSelector((s) => s.auth.user?.id);

  const { isDark } = useThemeMode();
  const styles = makeStyles(isDark);
  const palette = isDark ? DarkColors : LightColors;

  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [requiredEmployees, setRequiredEmployees] = useState("1");
  const [dateAnchor, setDateAnchor] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("17:00");
  const [responseDeadline, setResponseDeadline] = useState("");
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const [createdTask, setCreatedTask] = useState<Task | null>(null);
  const [employeeId, setEmployeeId] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const monthLabel = dateAnchor.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const monthDays = useMemo(() => {
    const start = new Date(dateAnchor.getFullYear(), dateAnchor.getMonth(), 1);
    const end = new Date(dateAnchor.getFullYear(), dateAnchor.getMonth() + 1, 0);
    const daysInMonth = end.getDate();
    const startWeekday = (start.getDay() + 6) % 7;
    const cells: (Date | null)[] = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(new Date(dateAnchor.getFullYear(), dateAnchor.getMonth(), d));
    }
    return cells;
  }, [dateAnchor]);

  const combineDateTime = (date: Date, timeStr: string) => {
    return new Date(`${date.toISOString().slice(0, 10)}T${timeStr}:00`);
  };

  const startDateTime = combineDateTime(selectedDate, startTime);
  const endDateTime = combineDateTime(selectedDate, endTime);

  const availableEmployees = useMemo(() => {
    if (!startDateTime || !endDateTime || endDateTime <= startDateTime) {
      return employees;
    }
    return employees.filter((emp) => {
      const busy = events.some((ev) => {
        if (ev.employeeId !== emp.id) return false;
        const evStart = new Date(ev.start).getTime();
        const evEnd = new Date(ev.end).getTime();
        return evStart < endDateTime.getTime() && evEnd > startDateTime.getTime();
      });
      return !busy;
    });
  }, [employees, events, startDateTime, endDateTime]);

  if (role !== UserRole.MANAGER) {
    return (
      <SafeAreaView style={[styles.screen, { paddingHorizontal: 16 }]}>
        <Text style={styles.title}>Create Task</Text>
        <Text style={{ color: palette.secondary }}>
          Nur Manager k&ouml;nnen Tasks anlegen.
        </Text>
      </SafeAreaView>
    );
  }

  // Load employees and manager events for availability filtering
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
        // silently ignore; handled when form submits
      }
    })();
  }, [token, managerId]);

  const handleCreateTask = async () => {
    if (!token) return;
    if (!company || !location) {
      Alert.alert("Fehlende Felder", "Bitte alle Pflichtfelder ausfuellen.");
      return;
    }
    if (endDateTime <= startDateTime) {
      Alert.alert("Zeitfenster ungueltig", "Ende muss nach Start liegen.");
      return;
    }
    try {
      setSubmitting(true);
      const payload = {
        company,
        location,
        requiredEmployees: Number(requiredEmployees) || 1,
        start: startDateTime.toISOString(),
        end: endDateTime.toISOString(),
        responseDeadline: responseDeadline || null,
      };
      const task = await createTaskApi(payload, token);
      setCreatedTask(task);
      Alert.alert("Erfolg", "Task wurde erstellt.");
    } catch (err: any) {
      Alert.alert("Fehler", err.message || "Task konnte nicht erstellt werden.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssign = async () => {
    if (!token || !createdTask) return;
    if (!employeeId) {
      Alert.alert("Fehlende Felder", "Bitte einen Mitarbeiter waehlen.");
      return;
    }
    try {
      setAssigning(true);
      await assignEmployeeToTask(
        {
          taskId: createdTask.id,
          employeeId,
          status: AssignmentStatus.PENDING,
        },
        token
      );
      Alert.alert(
        "Anfrage gesendet",
        "Der Mitarbeiter erh&auml;lt eine Anfrage und kann annehmen."
      );
      setEmployeeId("");
    } catch (err: any) {
      Alert.alert(
        "Fehler",
        err.message || "Employee konnte nicht zugewiesen werden."
      );
    } finally {
      setAssigning(false);
    }
  };

  return (
    <SafeAreaView style={[styles.screen, { paddingHorizontal: 16 }]}>
      <ScrollView>
        <Text style={[styles.title, { marginBottom: 12 }]}>Task anlegen</Text>

        <TextInput
          style={styles.input}
          placeholder="Firma"
          placeholderTextColor={palette.secondary}
          value={company}
          onChangeText={setCompany}
        />
        <TextInput
          style={styles.input}
          placeholder="Ort"
          placeholderTextColor={palette.secondary}
          value={location}
          onChangeText={setLocation}
        />
        <TextInput
          style={styles.input}
          placeholder="Benoetigte Mitarbeiter (Zahl)"
          placeholderTextColor={palette.secondary}
          value={requiredEmployees}
          onChangeText={setRequiredEmployees}
          keyboardType="numeric"
        />

        <Pressable
          style={[
            styles.input,
            { justifyContent: "center", backgroundColor: palette.surface },
          ]}
          onPress={() => setShowDatePicker((v) => !v)}
        >
          <Text style={{ color: palette.text }}>
            Datum: {selectedDate.toLocaleDateString()}
          </Text>
        </Pressable>
        {showDatePicker && (
          <View style={[styles.card, { marginBottom: 8 }]}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Pressable
                onPress={() =>
                  setDateAnchor(
                    new Date(dateAnchor.getFullYear(), dateAnchor.getMonth() - 1, 1)
                  )
                }
              >
                <Text style={{ color: palette.primary }}>{"<"}</Text>
              </Pressable>
              <Text style={{ color: palette.text, fontWeight: "700" }}>
                {monthLabel}
              </Text>
              <Pressable
                onPress={() =>
                  setDateAnchor(
                    new Date(dateAnchor.getFullYear(), dateAnchor.getMonth() + 1, 1)
                  )
                }
              >
                <Text style={{ color: palette.primary }}>{">"}</Text>
              </Pressable>
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {monthDays.map((d, idx) =>
                d ? (
                  <Pressable
                    key={idx}
                    style={{
                      width: "14.28%",
                      padding: 6,
                      alignItems: "center",
                    }}
                    onPress={() => {
                      setSelectedDate(d);
                      setShowDatePicker(false);
                    }}
                  >
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor:
                          d.toDateString() === selectedDate.toDateString()
                            ? palette.primary
                            : "transparent",
                      }}
                    >
                      <Text
                        style={{
                          color:
                            d.toDateString() === selectedDate.toDateString()
                              ? "#fff"
                              : palette.text,
                        }}
                      >
                        {d.getDate()}
                      </Text>
                    </View>
                  </Pressable>
                ) : (
                  <View key={idx} style={{ width: "14.28%", padding: 6 }} />
                )
              )}
            </View>
          </View>
        )}

        <View style={{ flexDirection: "row", gap: 16, marginBottom: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: palette.text, marginBottom: 6 }}>Startzeit</Text>
            <Pressable
              style={[
                styles.input,
                { justifyContent: "center", backgroundColor: palette.surface },
              ]}
              onPress={() => setShowStartTimePicker(true)}
            >
              <Text style={{ color: palette.text }}>{startTime}</Text>
            </Pressable>
            {showStartTimePicker && (
              <DateTimePicker
                mode="time"
                display="spinner"
                value={combineDateTime(selectedDate, startTime)}
                onChange={(event, date) => {
                  setShowStartTimePicker(false);
                  if (date) {
                    const hh = String(date.getHours()).padStart(2, "0");
                    const mm = String(date.getMinutes()).padStart(2, "0");
                    setStartTime(`${hh}:${mm}`);
                  }
                }}
              />
            )}
          </View>

          <View style={{ flex: 1 }}>
            <Text style={{ color: palette.text, marginBottom: 6 }}>Endzeit</Text>
            <Pressable
              style={[
                styles.input,
                { justifyContent: "center", backgroundColor: palette.surface },
              ]}
              onPress={() => setShowEndTimePicker(true)}
            >
              <Text style={{ color: palette.text }}>{endTime}</Text>
            </Pressable>
            {showEndTimePicker && (
              <DateTimePicker
                mode="time"
                display="spinner"
                value={combineDateTime(selectedDate, endTime)}
                onChange={(event, date) => {
                  setShowEndTimePicker(false);
                  if (date) {
                    const hh = String(date.getHours()).padStart(2, "0");
                    const mm = String(date.getMinutes()).padStart(2, "0");
                    setEndTime(`${hh}:${mm}`);
                  }
                }}
              />
            )}
          </View>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Antwort-Deadline (optional, ISO)"
          placeholderTextColor={palette.secondary}
          value={responseDeadline}
          onChangeText={setResponseDeadline}
        />

        <Pressable
          style={[styles.button, { marginTop: 8, opacity: submitting ? 0.7 : 1 }]}
          onPress={handleCreateTask}
          disabled={submitting}
        >
          <Text style={styles.buttonText}>
            {submitting ? "Wird erstellt..." : "Task erstellen"}
          </Text>
        </Pressable>

        {createdTask && (
          <View style={[styles.card, { marginTop: 20 }]}>
            <Text style={[styles.title, { fontSize: 20 }]}>Mitarbeiter zuweisen</Text>
            <Text style={{ color: palette.secondary, marginBottom: 10 }}>
              Task: {createdTask.company} - {createdTask.location}
            </Text>
            <Text style={{ color: palette.text, marginBottom: 6 }}>
              Verfuegbare Arbeiter:
            </Text>
            <ScrollView style={{ maxHeight: 180, marginBottom: 8 }}>
              {availableEmployees.length === 0 ? (
                <Text style={{ color: palette.secondary }}>
                  Keine verfuegbaren Mitarbeiter im gewaehlten Zeitraum.
                </Text>
              ) : (
                availableEmployees.map((emp, idx) => {
                  const colors = ["#4C8BFF", "#8e44ad", "#16a085", "#e67e22", "#e74c3c"];
                  const color = colors[idx % colors.length];
                  return (
                    <Pressable
                      key={emp.id}
                      onPress={() => setEmployeeId(emp.id)}
                      style={{
                        paddingVertical: 10,
                        borderBottomWidth: 1,
                        borderColor: palette.border,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10,
                        backgroundColor:
                          employeeId === emp.id ? `${palette.primary}11` : "transparent",
                      }}
                    >
                      <View
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: 2,
                          backgroundColor: color,
                        }}
                      />
                      <Text style={{ color: palette.text }}>
                        {emp.firstName} {emp.lastName}
                      </Text>
                    </Pressable>
                  );
                })
              )}
            </ScrollView>
            <Pressable
              style={[
                styles.button,
                { marginTop: 8, opacity: assigning ? 0.7 : 1 },
              ]}
              onPress={handleAssign}
              disabled={assigning || !employeeId}
            >
              <Text style={styles.buttonText}>
                {assigning ? "Sende Anfrage..." : "Employee anfragen"}
              </Text>
            </Pressable>
            <Text style={{ color: palette.secondary, marginTop: 8 }}>
              Der Employee erhaelt eine Anfrage ueber Websocket/Backend. Bei
              Annahme wird der Kalender aktualisiert.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

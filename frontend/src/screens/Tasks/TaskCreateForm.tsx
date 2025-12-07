import { useState } from "react";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import UnifiedPicker from "@/src/components/ui/UnifiedPicker";
import {
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

export type TaskCreateFormProps = {
  company: string;
  street: string;
  houseNumber: string;
  postalCode: string;
  requiredEmployees: string;
  selectedDate: Date;
  startTime: string;
  endTime: string;
  responseDeadline: string;
  responseDeadlineTime: string;
  palette: any;
  styles: any;
  submitting: boolean;
  availableEmployeesForNewTask: {
    emp: { id: string; firstName: string; lastName: string };
    busy?: any;
    colorIndex: number;
  }[];
  createSelectedEmployees: string[];
  setCompany: (v: string) => void;
  setStreet: (v: string) => void;
  setHouseNumber: (v: string) => void;
  setPostalCode: (v: string) => void;
  setRequiredEmployees: (v: string) => void;
  setSelectedDate: (d: Date) => void;
  setStartTime: (v: string) => void;
  setEndTime: (v: string) => void;
  setResponseDeadline: (v: string) => void;
  setResponseDeadlineTime: (v: string) => void;
  setCreateSelectedEmployees: (fn: (prev: string[]) => string[]) => void;
  onSubmit: () => void;
  combineDateTime: (date: Date, time: string) => Date;
};

export default function TaskCreateForm({
  company,
  street,
  houseNumber,
  postalCode,
  requiredEmployees,
  selectedDate,
  startTime,
  endTime,
  responseDeadline,
  responseDeadlineTime,
  palette,
  styles,
  submitting,
  availableEmployeesForNewTask,
  createSelectedEmployees,
  setCompany,
  setStreet,
  setHouseNumber,
  setPostalCode,
  setRequiredEmployees,
  setSelectedDate,
  setStartTime,
  setEndTime,
  setResponseDeadline,
  setResponseDeadlineTime,
  setCreateSelectedEmployees,
  onSubmit,
  combineDateTime,
}: TaskCreateFormProps) {
  const limit = Math.max(1, Number(requiredEmployees) || 1);
  const [activeTimeField, setActiveTimeField] = useState<"start" | "end" | null>(
    null
  );

  const startDateObj = combineDateTime(selectedDate, startTime);
  const endDateObj = combineDateTime(selectedDate, endTime);
  const deadlineDateObj = combineDateTime(
    responseDeadline ? new Date(responseDeadline) : selectedDate,
    responseDeadlineTime || endTime
  );
  const isAndroid = Platform.OS === "android";
  const timePickerValue =
    activeTimeField === "start" ? startDateObj : endDateObj;

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const toggleTimePicker = (field: "start" | "end") => {
    setActiveTimeField((prev) => (prev === field ? null : field));
  };

  const handleTimeChange = (
    _event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    if (selectedDate && activeTimeField) {
      const hh = String(selectedDate.getHours()).padStart(2, "0");
      const mm = String(selectedDate.getMinutes()).padStart(2, "0");
      if (activeTimeField === "start") setStartTime(`${hh}:${mm}`);
      if (activeTimeField === "end") setEndTime(`${hh}:${mm}`);
    }
    if (isAndroid) {
      setActiveTimeField(null);
    }
  };

  return (
    <View
      style={[styles.card, { marginBottom: 16, borderColor: palette.border }]}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <Text style={[styles.title, styles.createHeader]}>Task erstellen</Text>
      </View>

      {/* INPUT FELDER */}
      <TextInput
        style={styles.input}
        placeholder="Firma"
        placeholderTextColor={palette.secondary}
        value={company}
        onChangeText={setCompany}
      />
      <TextInput
        style={styles.input}
        placeholder="Strasse"
        placeholderTextColor={palette.secondary}
        value={street}
        onChangeText={setStreet}
      />

      <View style={{ flexDirection: "row", gap: 12 }}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Hausnummer"
          placeholderTextColor={palette.secondary}
          value={houseNumber}
          onChangeText={setHouseNumber}
        />
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="PLZ"
          placeholderTextColor={palette.secondary}
          value={postalCode}
          onChangeText={setPostalCode}
          keyboardType="numeric"
        />
      </View>

      <TextInput
        style={styles.input}
        placeholder="Benoetigte Mitarbeiter (Zahl)"
        placeholderTextColor={palette.secondary}
        value={requiredEmployees}
        onChangeText={setRequiredEmployees}
        keyboardType="numeric"
      />

      {/* DATUM mit UnifiedPicker */}
      <UnifiedPicker
        label="Datum"
        mode="date"
        value={selectedDate}
        onChange={(date) => setSelectedDate(date)}
        palette={palette}
        styles={styles}
      />

      {/* Zeitfelder mit einem gemeinsamen Picker */}
      <View style={[styles.createPickerRow, { alignItems: "flex-start" }]}>
        <View style={styles.createPickerColumn}>
          <Text style={styles.createTimeLabel}>Startzeit</Text>
          <Pressable
            onPress={() => toggleTimePicker("start")}
            style={[
              styles.input,
              styles.createDateInput,
              {
                backgroundColor: palette.surface,
                borderColor:
                  activeTimeField === "start" ? palette.primary : palette.border,
                borderWidth: activeTimeField === "start" ? 2 : 1,
              },
            ]}
          >
            <Text style={{ color: palette.text }}>{formatTime(startDateObj)}</Text>
          </Pressable>
        </View>

        <View style={styles.createPickerColumn}>
          <Text style={styles.createTimeLabel}>Endzeit</Text>
          <Pressable
            onPress={() => toggleTimePicker("end")}
            style={[
              styles.input,
              styles.createDateInput,
              {
                backgroundColor: palette.surface,
                borderColor:
                  activeTimeField === "end" ? palette.primary : palette.border,
                borderWidth: activeTimeField === "end" ? 2 : 1,
              },
            ]}
          >
            <Text style={{ color: palette.text }}>{formatTime(endDateObj)}</Text>
          </Pressable>
        </View>
      </View>
      {activeTimeField && (
        <View style={{ marginTop: 6 }}>
          <DateTimePicker
            mode="time"
            display={isAndroid ? "default" : "spinner"}
            value={timePickerValue}
            onChange={handleTimeChange}
          />
        </View>
      )}

      {/* DEADLINE mit UnifiedPicker */}
      <View style={[styles.createSection, { marginTop: 12 }]}>
        <UnifiedPicker
          label="Antwort Deadline (Datum)"
          mode="date"
          value={deadlineDateObj}
          onChange={(d) => setResponseDeadline(d.toISOString())}
          palette={palette}
          styles={styles}
        />
        <UnifiedPicker
          label="Antwort Deadline (Zeit)"
          mode="time"
          value={deadlineDateObj}
          onChange={(d) => {
            const hh = String(d.getHours()).padStart(2, "0");
            const mm = String(d.getMinutes()).padStart(2, "0");
            setResponseDeadlineTime(`${hh}:${mm}`);
          }}
          palette={palette}
          styles={styles}
        />
      </View>

      <Text style={[styles.createTimeLabel, { marginBottom: 6 }]}>
        Arbeiter unter dem Manager
      </Text>
      <ScrollView style={{ maxHeight: 200, marginBottom: 12 }}>
        {availableEmployeesForNewTask.length === 0 ? (
          <Text style={{ color: palette.secondary }}>
            Keine Mitarbeiter gefunden.
          </Text>
        ) : (
          availableEmployeesForNewTask.map(({ emp, busy, colorIndex }) => {
            const colors = [
              "#4C8BFF",
              "#8e44ad",
              "#16a085",
              "#e67e22",
              "#e74c3c",
            ];
            const color = colors[colorIndex % colors.length];
            const selected = createSelectedEmployees.includes(emp.id);
            const limitReached =
              createSelectedEmployees.length >= limit && !selected;
            const disabled = !!busy || limitReached;

            return (
              <Pressable
                key={emp.id}
                disabled={disabled}
                onPress={() => {
                  if (selected) {
                    setCreateSelectedEmployees((prev) =>
                      prev.filter((id) => id !== emp.id)
                    );
                  } else if (!limitReached) {
                    setCreateSelectedEmployees((prev) => [...prev, emp.id]);
                  }
                }}
                style={[
                  styles.createEmployeeRow,
                  {
                    borderColor: palette.border,
                    backgroundColor: selected
                      ? `${palette.primary}11`
                      : "transparent",
                    opacity: disabled ? 0.6 : 1,
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
                      (!) Belegt:{" "}
                      {busy.company || busy.location || busy.type || "Job"}
                    </Text>
                  )}
                </View>
              </Pressable>
            );
          })
        )}
      </ScrollView>

      <Pressable
        style={[styles.button, { marginTop: 8, opacity: submitting ? 0.7 : 1 }]}
        onPress={onSubmit}
        disabled={submitting}
      >
        <Text style={styles.buttonText}>
          {submitting ? "Wird erstellt..." : "Task erstellen"}
        </Text>
      </Pressable>
    </View>
  );
}

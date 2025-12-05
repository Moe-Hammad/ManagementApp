import DateTimePicker from "@react-native-community/datetimepicker";
import { Dispatch, SetStateAction, useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

type MonthCell = Date | null;

export type TaskCreateFormProps = {
  company: string;
  street: string;
  houseNumber: string;
  postalCode: string;
  requiredEmployees: string;
  selectedDate: Date;
  monthLabel: string;
  monthDays: MonthCell[];
  startTime: string;
  endTime: string;
  responseDeadline: string;
  activeTimePicker: "start" | "end" | null;
  showDatePicker: boolean;
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
  setShowDatePicker: (v: boolean) => void;
  setActiveTimePicker: Dispatch<SetStateAction<"start" | "end" | null>>;
  setStartTime: (v: string) => void;
  setEndTime: (v: string) => void;
  setResponseDeadline: (v: string) => void;
  setCreateSelectedEmployees: (fn: (prev: string[]) => string[]) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
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
  monthLabel,
  monthDays,
  startTime,
  endTime,
  responseDeadline,
  activeTimePicker,
  showDatePicker,
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
  setShowDatePicker,
  setActiveTimePicker,
  setStartTime,
  setEndTime,
  setResponseDeadline,
  setCreateSelectedEmployees,
  onPrevMonth,
  onNextMonth,
  onSubmit,
  combineDateTime,
}: TaskCreateFormProps) {
  const limit = Math.max(1, Number(requiredEmployees) || 1);
  const [showDeadlinePicker, setShowDeadlinePicker] = useState(false);
  const deadlineDate = useMemo(
    () =>
      responseDeadline
        ? new Date(responseDeadline)
        : combineDateTime(selectedDate, endTime),
    [responseDeadline, selectedDate, endTime, combineDateTime]
  );

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
          keyboardType="default"
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

      <Pressable
        style={[
          styles.input,
          { justifyContent: "center", backgroundColor: palette.surface },
        ]}
        onPress={() => setShowDatePicker(!showDatePicker)}
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
            <Pressable onPress={onPrevMonth}>
              <Text style={{ color: palette.primary }}>{"<"}</Text>
            </Pressable>
            <Text style={{ color: palette.text, fontWeight: "700" }}>
              {monthLabel}
            </Text>
            <Pressable onPress={onNextMonth}>
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

      <View style={[styles.createPickerRow, { alignItems: "flex-start" }]}>
        <View style={styles.createPickerColumn}>
          <Text style={styles.createTimeLabel}>Startzeit</Text>
          <Pressable
            style={[
              styles.input,
              styles.createDateInput,
              { backgroundColor: palette.surface },
            ]}
            onPress={() =>
              setActiveTimePicker((prev) => (prev === "start" ? null : "start"))
            }
          >
            <Text style={{ color: palette.text }}>{startTime}</Text>
          </Pressable>
        </View>

        <View style={styles.createPickerColumn}>
          <Text style={styles.createTimeLabel}>Endzeit</Text>
          <Pressable
            style={[
              styles.input,
              styles.createDateInput,
              { backgroundColor: palette.surface },
            ]}
            onPress={() =>
              setActiveTimePicker((prev) => (prev === "end" ? null : "end"))
            }
          >
            <Text style={{ color: palette.text }}>{endTime}</Text>
          </Pressable>
        </View>

      </View>

      {activeTimePicker && (
        <DateTimePicker
          mode="time"
          display="spinner"
          value={combineDateTime(
            selectedDate,
            activeTimePicker === "start" ? startTime : endTime
          )}
          onChange={(event, date) => {
            if (event.type === "dismissed") {
              setActiveTimePicker(null);
              return;
            }
            if (date) {
              const hh = String(date.getHours()).padStart(2, "0");
              const mm = String(date.getMinutes()).padStart(2, "0");
              if (activeTimePicker === "start") {
                setStartTime(`${hh}:${mm}`);
              } else {
                setEndTime(`${hh}:${mm}`);
              }
            }
            if (Platform.OS === "android") {
              setActiveTimePicker(null);
            }
          }}
        />
      )}

      <View style={[styles.createSection, { marginTop: 12 }]}>
        <Text style={styles.createTimeLabel}>Antwort-Deadline</Text>
        <Pressable
          style={[
            styles.input,
            styles.createDateInput,
            { backgroundColor: palette.surface },
          ]}
          onPress={() => setShowDeadlinePicker((v) => !v)}
        >
          <Text style={{ color: palette.text }}>
            {deadlineDate.toLocaleString()}
          </Text>
        </Pressable>
        {showDeadlinePicker && (
          <DateTimePicker
            mode="datetime"
            display="spinner"
            value={deadlineDate}
            onChange={(event, date) => {
              if (event?.type === "dismissed") return;
              if (date) {
                setResponseDeadline(date.toISOString());
                if (Platform.OS === "android") {
                  setShowDeadlinePicker(false);
                }
              }
            }}
          />
        )}
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

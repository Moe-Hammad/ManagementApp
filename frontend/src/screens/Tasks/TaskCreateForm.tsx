import UnifiedPicker from "@/src/components/ui/UnifiedPicker";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

/* ---------------------------------------------
   Section Wrapper (pure UI, no logic)
---------------------------------------------- */
function FormSection({
  title,
  children,
  subtle = false,
  styles,
}: {
  title: string;
  children: React.ReactNode;
  subtle?: boolean;
  styles: any;
}) {
  return (
    <View style={[styles.widgetSpacingMd, subtle ? { opacity: 0.9 } : null]}>
      <Text style={styles.widgetTitle}>{title}</Text>
      <View style={styles.widgetSpacingSm}>{children}</View>
    </View>
  );
}

/* ---------------------------------------------
   Types
---------------------------------------------- */
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

/* ---------------------------------------------
   Component
---------------------------------------------- */
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
  /* ---------------------------------------------
     Derived values (unchanged)
  ---------------------------------------------- */
  const limit = Math.max(1, Number(requiredEmployees) || 1);
  const [activeTimeField, setActiveTimeField] = useState<
    "start" | "end" | null
  >(null);

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
    if (isAndroid) setActiveTimeField(null);
  };

  /* ---------------------------------------------
     Render
  ---------------------------------------------- */
  return (
    <View>
      {/* Einsatzort */}
      <FormSection title="Einsatzort" styles={styles}>
        <TextInput
          style={styles.input}
          placeholder="Firma"
          placeholderTextColor={palette.secondary}
          value={company}
          onChangeText={setCompany}
        />
        <TextInput
          style={styles.input}
          placeholder="Straße"
          placeholderTextColor={palette.secondary}
          value={street}
          onChangeText={setStreet}
        />

        <View style={[styles.createPickerRow, { marginBottom: 0 }]}>
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
      </FormSection>

      {/* Einsatzdetails */}
      <FormSection title="Einsatzdetails" styles={styles}>
        <UnifiedPicker
          label="Datum"
          mode="date"
          value={selectedDate}
          onChange={setSelectedDate}
          palette={palette}
          styles={styles}
        />

        <View style={styles.createPickerRow}>
          <View style={styles.createPickerColumn}>
            <Text style={styles.createTimeLabel}>Startzeit</Text>
            <Pressable
              onPress={() => toggleTimePicker("start")}
              style={[
                styles.input,
                styles.createDateInput,
                {
                  borderColor:
                    activeTimeField === "start"
                      ? palette.primary
                      : palette.border,
                  borderWidth: activeTimeField === "start" ? 2 : 1,
                },
              ]}
            >
              <Text style={{ color: palette.text }}>
                {formatTime(startDateObj)}
              </Text>
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
                  borderColor:
                    activeTimeField === "end"
                      ? palette.primary
                      : palette.border,
                  borderWidth: activeTimeField === "end" ? 2 : 1,
                },
              ]}
            >
              <Text style={{ color: palette.text }}>
                {formatTime(endDateObj)}
              </Text>
            </Pressable>
          </View>
        </View>

        {activeTimeField && (
          <DateTimePicker
            mode="time"
            display={isAndroid ? "default" : "spinner"}
            value={timePickerValue}
            onChange={handleTimeChange}
          />
        )}

        <TextInput
          style={styles.input}
          placeholder="Benötigte Mitarbeiter (Zahl)"
          placeholderTextColor={palette.secondary}
          value={requiredEmployees}
          onChangeText={setRequiredEmployees}
          keyboardType="numeric"
        />
      </FormSection>

      {/* Antwortfrist */}
      <FormSection title="Antwortfrist (optional)" subtle styles={styles}>
        <UnifiedPicker
          label="Datum"
          mode="date"
          value={deadlineDateObj}
          onChange={(d) => setResponseDeadline(d.toISOString())}
          palette={palette}
          styles={styles}
        />
        <UnifiedPicker
          label="Zeit"
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
      </FormSection>

      {/* Mitarbeiter */}
      <FormSection title="Mitarbeiter auswählen" styles={styles}>
        <Text style={[styles.text, { color: palette.secondary, marginBottom: 8 }]}>
          Wähle bis zu {limit} Mitarbeiter
        </Text>

        <ScrollView style={styles.employeePickerList}>
          {availableEmployeesForNewTask.map(({ emp, busy, colorIndex }) => {
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
                      backgroundColor: selected ? color : "transparent",
                    },
                  ]}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.text}>
                    {emp.firstName} {emp.lastName}
                  </Text>
                  {busy && (
                    <Text style={{ color: "#e67e22", fontSize: 12 }}>
                      Belegt
                    </Text>
                  )}
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      </FormSection>

      {/* Submit */}
      <View style={{ marginTop: 32 }}>
        <Pressable
          style={[styles.button, { opacity: submitting ? 0.7 : 1 }]}
          onPress={onSubmit}
          disabled={submitting}
        >
          <Text style={styles.buttonText}>
            {submitting ? "Wird erstellt..." : "Task erstellen"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

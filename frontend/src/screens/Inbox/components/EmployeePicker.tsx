import { Pressable, ScrollView, Text, View } from "react-native";

/**
 * EmployeePicker
 * ---------------------------------------------------------
 * Popup für Manager zur Auswahl eines Mitarbeiters,
 * mit dem ein neuer Direktchat erstellt werden soll.
 *
 * Verantwortlichkeiten:
 * - Halbtransparenten Overlay anzeigen
 * - Popup zentriert anzeigen
 * - Liste der Mitarbeiter rendern
 * - Auswählen eines Mitarbeiters → pick()
 * - Abbrechen → close()
 *
 * Warum existiert diese Komponente?
 * - Entkoppelt UI vollständig von der Logik (useEmployeePicker)
 * - Saubere Wiederverwendbarkeit
 * - Verhindert große UI-Blöcke im Screen
 *
 * @param employees  Liste der auswählbaren Mitarbeiter
 * @param onPick     Callback, wenn ein Mitarbeiter ausgewählt wird
 * @param onClose    Schließt das Popup
 * @param styles     Globales StyleSheet aus makeStyles()
 * @param palette    Farbpalette für den aktuellen Modus
 */

export default function EmployeePicker({
  employees,
  onPick,
  onClose,
  styles,
  palette,
}: {
  employees: any[];
  onPick: (id: string) => void;
  onClose: () => void;
  styles: any;
  palette: any;
}) {
  return (
    <View style={styles.employeePickerOverlay}>
      {/* Card in der Mitte */}
      <View style={styles.employeePickerCard}>
        <Text style={styles.widgetTitle}>Mitarbeiter auswählen</Text>

        {/* Scrollbarer Bereich */}
        <ScrollView style={styles.employeePickerList}>
          {employees.length === 0 ? (
            <Text style={[styles.text, styles.requestsNote]}>
              Keine Mitarbeiter gefunden.
            </Text>
          ) : (
            employees.map((emp) => (
              <Pressable
                key={emp.id}
                onPress={() => onPick(emp.id)}
                style={styles.employeePickerItem}
              >
                <Text style={styles.text}>
                  {emp.firstName} {emp.lastName}
                </Text>
                <Text style={[styles.text, styles.requestsNote]}>
                  {emp.email}
                </Text>
              </Pressable>
            ))
          )}
        </ScrollView>

        {/* Cancel Button */}
        <Pressable style={styles.employeePickerCancel} onPress={onClose}>
          <Text style={styles.requestsActionText}>Abbrechen</Text>
        </Pressable>
      </View>
    </View>
  );
}

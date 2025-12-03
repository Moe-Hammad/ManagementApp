import { useOpenDirectChat } from "@/src/hooks/useOpenDirectChat";
import { Employee } from "@/src/types/resources";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

/**
 * EmployeePicker
 * ----------------------------------------------------
 * Popup zum Auswählen eines Mitarbeiters.
 * Beim Klicken wird:
 *  - Step 1.5 genutzt (DirectChat Prevention)
 *  - existierender Chat geöffnet ODER neuer erstellt
 *  - Popup geschlossen
 *  - Navigation zum ChatScreen ausgeführt
 */

export default function EmployeePicker({
  visible,
  onClose,
  employees,
  styles,
  palette,
}: {
  visible: boolean;
  onClose: () => void;
  employees: Employee[];
  styles: any;
  palette: any;
}) {
  const router = useRouter();
  const openDirectChat = useOpenDirectChat();

  if (!visible) return null;

  /**
   * Employee auswählen → DirectChat öffnen
   */
  const handlePick = async (employeeId: string) => {
    const room = await openDirectChat(employeeId);
    if (!room) return;

    onClose(); // Popup schließen

    // Zum Chat navigieren
    router.push(`./Inbox/chat/${room.id}`);
  };

  return (
    <View style={styles.employeePickerOverlay}>
      <View style={styles.employeePickerCard}>
        {/* HEADER */}
        <Text style={styles.widgetTitle}>Mitarbeiter auswählen</Text>

        {/* LISTE */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.employeePickerList}
        >
          {employees.length === 0 ? (
            <Text style={[styles.text, styles.requestsNote]}>
              Keine Mitarbeiter gefunden.
            </Text>
          ) : (
            employees.map((emp) => (
              <Pressable
                key={emp.id}
                style={styles.employeePickerItem}
                onPress={() => handlePick(emp.id)}
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

        {/* CANCEL BUTTON */}
        <Pressable style={styles.employeePickerCancel} onPress={onClose}>
          <Text style={styles.requestsActionText}>Abbrechen</Text>
        </Pressable>
      </View>
    </View>
  );
}

import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

/**
 * SearchTab
 * ---------------------------------------------------------
 * Suchfunktion für Manager, um nicht-zugewiesene Mitarbeiter
 * ("unassigned employees") zu finden und ihnen eine Request
 * zu schicken.
 *
 * Verantwortlichkeiten:
 * - Suchfeld für Employees
 * - Liste der Suchergebnisse rendern
 * - Button zum Senden einer Request
 *
 * Warum existiert diese Komponente?
 * - Entkoppelt UI von der Logik in useRequests()
 * - Bessere Übersichtlichkeit
 * - Einheitliche UI über das gesamte Projekt
 *
 * @param styles           globale Styles (makeStyles)
 * @param palette          Farbpalette für Dark/Light
 * @param isManager        bool – darf der Nutzer Suchaktionen ausführen?
 * @param employeeSearch   aktueller Wert im Suchfeld
 * @param setEmployeeSearch Funktion zum Setzen des Suchbegriffs
 * @param unassigned       Liste der gefundenen Employees
 * @param pendingRequests  Requests, die noch offen/ausstehend sind
 * @param onRequest        Request-Funktion (Manager → Employee)
 */

export default function SearchTab({
  styles,
  palette,
  isManager,
  employeeSearch,
  setEmployeeSearch,
  unassigned,
  pendingRequests,
  onRequest,
}: {
  styles: any;
  palette: any;
  isManager: boolean;
  employeeSearch: string;
  setEmployeeSearch: (v: string) => void;
  unassigned: any[];
  pendingRequests: any[];
  onRequest: (employeeId: string) => void;
}) {
  const pendingIds = new Set(pendingRequests.map((req) => req.employeeId));

  return (
    <View style={[styles.widget, styles.requestsBodyCard]}>
      {/* Title */}
      <Text style={styles.widgetTitle}>Mitarbeiter suchen</Text>

      {/* Search Input */}
      <TextInput
        style={[styles.input, { marginBottom: 12 }]}
        placeholder="Mitarbeiter suchen..."
        placeholderTextColor={palette.secondary}
        value={employeeSearch}
        onChangeText={setEmployeeSearch}
      />

      {/* Search Results */}
      <ScrollView
        style={styles.searchResultsContainer}
        showsVerticalScrollIndicator={false}
      >
        {unassigned.length === 0 ? (
          <Text style={[styles.text, styles.requestsNote]}>
            Keine Ergebnisse gefunden.
          </Text>
        ) : (
          unassigned.map((emp) => {
            const isPending = pendingIds.has(emp.id);

            return (
              <View key={emp.id} style={styles.searchResultRow}>
                {/* Employee Info */}
                <View>
                  <Text style={styles.text}>
                    {emp.firstName} {emp.lastName}
                  </Text>
                  <Text style={[styles.text, styles.requestsNote]}>
                    {emp.email}
                  </Text>
                </View>

                {/* Request Button */}
                <Pressable
                  onPress={() => !isPending && onRequest(emp.id)}
                  disabled={isPending}
                  style={[
                    styles.searchActionButton,
                    isPending && { opacity: 0.5 },
                  ]}
                >
                  <Text style={styles.requestsActionText}>
                    {isPending ? "Gesendet" : "Anfragen"}
                  </Text>
                </Pressable>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

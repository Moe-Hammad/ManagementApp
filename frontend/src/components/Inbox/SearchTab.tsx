import { DarkColors, LightColors } from "@/src/theme/colors";
import { makeStyles } from "@/src/theme/styles";
import { Employee } from "@/src/types/resources";
import { Dispatch, SetStateAction } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

type Props = {
  styles: ReturnType<typeof makeStyles>;
  palette: typeof DarkColors | typeof LightColors;
  isManager: boolean;
  employeeSearch: string;
  setEmployeeSearch: Dispatch<SetStateAction<string>>;
  unassigned: Employee[];
  onRequest: (employeeId: string) => void;
};

export function SearchTab({
  styles,
  palette,
  isManager,
  employeeSearch,
  setEmployeeSearch,
  unassigned,
  onRequest,
}: Props) {
  return (
    <View style={[styles.widget, styles.requestsBodyCard, { gap: 12 }]}>
      <Text style={styles.widgetTitle}>Suche</Text>
      <TextInput
        style={styles.input}
        placeholder="Unassigned Employees suchen (Name oder E-Mail)"
        value={employeeSearch}
        onChangeText={setEmployeeSearch}
        placeholderTextColor={palette.secondary}
        autoCapitalize="none"
      />
      <ScrollView
        style={styles.searchResultsContainer}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {!isManager ? (
          <Text style={[styles.text, styles.requestsNote]}>
            Suche ist nur für Manager verfügbar.
          </Text>
        ) : unassigned.length === 0 ? (
          <Text style={[styles.text, styles.requestsNote]}>
            Keine unassigned Employees gefunden.
          </Text>
        ) : (
          unassigned.map((emp) => (
            <View key={emp.id} style={styles.searchResultRow}>
              <Text style={styles.text}>
                {emp.firstName} {emp.lastName} ({emp.email})
              </Text>
              <Pressable
                style={styles.searchActionButton}
                onPress={() => onRequest(emp.id)}
              >
                <Text style={styles.requestsActionText}>Anfragen</Text>
              </Pressable>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

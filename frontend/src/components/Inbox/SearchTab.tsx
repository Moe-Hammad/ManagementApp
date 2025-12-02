import { Dispatch, SetStateAction } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";
import { DarkColors, LightColors } from "@/src/theme/colors";
import { makeStyles } from "@/src/theme/styles";
import { Employee, UserRole } from "@/src/types/resources";

type Props = {
  styles: ReturnType<typeof makeStyles>;
  palette: typeof DarkColors | typeof LightColors;
  isManager: boolean;
  employeeSearch: string;
  setEmployeeSearch: Dispatch<SetStateAction<string>>;
  unassigned: Employee[];
};

export function SearchTab({
  styles,
  palette,
  isManager,
  employeeSearch,
  setEmployeeSearch,
  unassigned,
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
      {!isManager ? (
        <Text style={[styles.text, styles.requestsNote]}>
          Suche ist nur für Manager verfügbar.
        </Text>
      ) : unassigned.length === 0 ? (
        <Text style={[styles.text, styles.requestsNote]}>
          Keine unassigned Employees gefunden.
        </Text>
      ) : (
        <ScrollView style={{ maxHeight: 320 }}>
          {unassigned.map((emp) => (
            <View key={emp.id} style={styles.requestsRoomItem}>
              <Text style={styles.text}>
                {emp.firstName} {emp.lastName} ({emp.email})
              </Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

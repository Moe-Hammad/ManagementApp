import { Pressable, Text, View } from "react-native";

/**
 * Tabs
 * ---------------------------------------------------------
 * Eine generische Tab-Leiste für die Inbox,
 * die zwischen "Chats", "Requests" und ggf. "Search"
 * wechseln kann.
 *
 * Verantwortlichkeiten:
 * - Anzeige aller Tabs (übergeben durch props)
 * - Visuelles Hervorheben des aktiven Tabs
 * - Wechsel des Tabs per onChange()
 *
 * Warum existiert diese Komponente?
 * - Saubere Trennung zwischen UI (Tabs) und Logik (useInboxTabs)
 * - Wiederverwendbar & gut testbar
 *
 * @param activeTab   Der aktuell ausgewählte Tab-Key
 * @param tabs        Array aus { key, label } Objekten
 * @param onChange    Wird aufgerufen, wenn ein Tab angeklickt wird
 */

export function Tabs({
  activeTab,
  tabs,
  onChange,
}: {
  activeTab: string;
  tabs: { key: string; label: string }[];
  onChange: (key: string) => void;
}) {
  return (
    <View style={{ flexDirection: "row", gap: 8, marginVertical: 12 }}>
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;

        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 8,
              backgroundColor: isActive ? "#4b7bec" : "#d1d8e0",
            }}
          >
            <Text
              style={{
                color: isActive ? "white" : "#333",
                fontWeight: isActive ? "bold" : "500",
              }}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default Tabs;

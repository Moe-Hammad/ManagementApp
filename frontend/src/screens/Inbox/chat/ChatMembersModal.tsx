import { Modal, Pressable, Text, View } from "react-native";

type Member = { id: string; firstName: string; lastName: string; role?: string };

export default function ChatMembersModal({
  visible,
  onClose,
  title,
  members,
  styles,
  palette,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  members: Member[];
  styles: any;
  palette: any;
}) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <Pressable
        style={styles.modalBackdrop}
        onPress={onClose}
        accessibilityRole="button"
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={[styles.modalCard, { gap: 6 }]}
        >
          <Text style={styles.modalTitle}>{title}</Text>
          {members.length === 0 ? (
            <Text style={{ color: palette.secondary }}>Keine Mitglieder geladen.</Text>
          ) : (
            members.map((m) => (
              <View key={m.id} style={{ paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: palette.border }}>
                <Text style={{ color: palette.text, fontWeight: "600" }}>
                  {m.firstName} {m.lastName}
                </Text>
                {m.role && (
                  <Text style={{ color: palette.secondary, fontSize: 12 }}>
                    {m.role === "MANAGER" ? "Manager" : "Employee"}
                  </Text>
                )}
              </View>
            ))
          )}

        </Pressable>
      </Pressable>
    </Modal>
  );
}

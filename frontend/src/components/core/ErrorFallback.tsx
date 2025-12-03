import { useThemeMode } from "@/src/theme/ThemeProvider";
import { makeStyles } from "@/src/theme/styles";
import { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

type Props = {
  title?: string;
  message?: string;
  onRetry?: () => void;
  actionLabel?: string;
  children?: ReactNode;
};

export default function ErrorFallback({
  title = "Etwas ist schiefgelaufen",
  message = "Bitte versuche es erneut.",
  onRetry,
  actionLabel = "Noch einmal versuchen",
  children,
}: Props) {
  const { isDark } = useThemeMode();
  const styles = makeStyles(isDark);

  return (
    <View style={[styles.card, { alignItems: "center" }]}>
      <Text style={styles.title}>{title}</Text>
      <Text style={[styles.text, { marginTop: 8, textAlign: "center" }]}>
        {message}
      </Text>
      {children}
      {onRetry && (
        <Pressable style={[styles.button, { marginTop: 16 }]} onPress={onRetry}>
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

import { makeStyles } from "@/src/theme/styles";
import { useThemeMode } from "@/src/theme/ThemeProvider";
import { Text, View } from "react-native";

function FormSection({
  title,
  children,
  subtle = false,
}: {
  title: string;
  children: React.ReactNode;
  subtle?: boolean;
}) {
  const { isDark } = useThemeMode();
  const styles = makeStyles(isDark);

  return (
    <View style={{ marginBottom: 24, opacity: subtle ? 0.85 : 1 }}>
      <Text style={styles.createSection}>{title}</Text>
      <View style={{ marginTop: 12 }}>{children}</View>
    </View>
  );
}

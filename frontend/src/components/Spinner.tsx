import { ActivityIndicator, View } from "react-native";
import { makeStyles } from "../theme/styles";
import { useThemeMode } from "../theme/ThemeProvider";

export default function Spinner() {
  const { isDark } = useThemeMode();
  const styles = makeStyles(isDark);

  return (
    <View style={{ padding: 10 }}>
      <ActivityIndicator size="small" style={styles.card} />
    </View>
  );
}

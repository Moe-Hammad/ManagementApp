import AuthGate from "@/src/components/core/AuthGate";
import { store } from "@/src/redux/store";
import { makeStyles } from "@/src/theme/styles";
import { ThemeProvider, useThemeMode } from "@/src/theme/ThemeProvider";
import { Slot } from "expo-router";
import { KeyboardProvider } from "react-native-keyboard-controller";

import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";

function RootWrapper() {
  const { isDark } = useThemeMode();
  const styles = makeStyles(isDark);

  return (
    <KeyboardProvider>
      <SafeAreaProvider>
        <AuthGate>
          <Slot />
        </AuthGate>
      </SafeAreaProvider>
    </KeyboardProvider>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <RootWrapper />
      </ThemeProvider>
    </Provider>
  );
}

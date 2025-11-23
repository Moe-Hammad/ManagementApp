import AuthGate from "@/src/services/AuthGate";
import { Slot } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { store } from "../src/redux/store";
import { ThemeProvider } from "../src/theme/ThemeProvider";

export default function RootLayout() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        {/* AuthGate steuert, ob Login oder App sichtbar ist */}
        <SafeAreaView style={{ flex: 1 }}>
          <AuthGate>
            {/* Kein <Stack screenOptions={{ headerShown: false }} />, da wir FileBased routing haben */}
            <Slot screenOptions={{ headerShown: false }} />
          </AuthGate>
        </SafeAreaView>
      </ThemeProvider>
    </Provider>
  );
}

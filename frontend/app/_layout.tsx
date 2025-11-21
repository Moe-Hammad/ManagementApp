import AuthGate from "@/src/services/AuthGate";
import { Slot } from "expo-router";
import { Provider } from "react-redux";
import { store } from "../src/redux/store";
import { ThemeProvider } from "../src/theme/ThemeProvider";

export default function RootLayout() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        {/* AuthGate steuert, ob Login oder App sichtbar ist */}
        <AuthGate>
          {/* Kein <Stack screenOptions={{ headerShown: false }} />, da wir FileBased routing haben */}
          <Slot screenOptions={{ headerShown: false }} />
        </AuthGate>
      </ThemeProvider>
    </Provider>
  );
}

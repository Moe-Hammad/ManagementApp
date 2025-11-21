import { Redirect, useSegments } from "expo-router";
import { ReactNode } from "react";
import { useAppSelector } from "../hooks/useRedux";

export default function AuthGate({ children }: { children: ReactNode }) {
  const token = useAppSelector((state) => state.auth.token);
  const segments = useSegments();

  const inAuthGroup = segments[0] === "(auth)";

  // Router noch nicht bereit → einfach rendern
  const ready = segments.length > 0;

  if (!ready) {
    return <>{children}</>;
  }

  // Case 1: kein Token → redirect zum Login
  if (!token && !inAuthGroup) {
    return <Redirect href="/(auth)/login" />;
  }

  // Case 2: Token vorhanden → NICHT auth zeigen
  if (token && inAuthGroup) {
    return <Redirect href="/(tabs)" />;
  }

  // Case 3: alles normal
  return <>{children}</>;
}

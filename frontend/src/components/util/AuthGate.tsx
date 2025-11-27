import { fetchCurrentUser } from "@/src/services/thunks/fetchCurrentUser";
import { Redirect, useRootNavigationState, useSegments } from "expo-router";
import { ReactNode, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import Spinner from "./Spinner";

export default function AuthGate({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();

  const tokenObj = useAppSelector((state) => state.auth.token);
  const user = useAppSelector((state) => state.auth.user);

  const token = tokenObj?.token ?? null;

  const segments = useSegments();
  const inAuthGroup = segments[0] === "(auth)";

  const navigationState = useRootNavigationState();
  const ready = navigationState?.key != null;

  // -----------------------------
  //   1. Wenn Token existiert → /me laden
  // -----------------------------
  useEffect(() => {
    if (token && !user) {
      dispatch(fetchCurrentUser(token));
    }
  }, [token]);
  // -----------------------------
  //   2. Kein Token → redirect login
  // -----------------------------
  if (!token && !inAuthGroup) {
    return <Redirect href="/(auth)/login" />;
  }

  // Wenn Token existiert aber User noch nicht geladen ist → warten
  if (token && !user) {
    return <Spinner />; // Loading-Phase
  }

  // -----------------------------
  //   3. Bereits eingeloggt → nicht mehr Login anzeigen
  // -----------------------------
  if (token && user && inAuthGroup) {
    // Weiterleitung Rolle-basiert -> Später
    if (user.role === "MANAGER") {
      return <Redirect href="/" />;
    } else {
      return <Redirect href="/" />;
    }
  }

  // Router noch nicht geladen → einfach nichts machen
  if (!ready) {
    return null;
  }
  // -----------------------------
  //   4. Alles normal anzeigen
  // -----------------------------
  return <>{children}</>;
}

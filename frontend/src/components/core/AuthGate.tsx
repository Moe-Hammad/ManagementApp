import { clearToken, setCredentials } from "@/src/redux/authSlice";
import { fetchCurrentUser } from "@/src/redux/fetchCurrentUser";
import { refreshTokens } from "@/src/services/api";
import {
  clearTokens,
  loadStoredRefreshToken,
  setTokenListener,
} from "@/src/services/authSession";
import { Redirect, useRootNavigationState, useSegments } from "expo-router";
import { ReactNode, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import Spinner from "./Spinner";

export default function AuthGate({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();

  const tokenObj = useAppSelector((state) => state.auth.token);
  const user = useAppSelector((state) => state.auth.user);

  const token = tokenObj?.accessToken ?? null;

  const segments = useSegments();
  const inAuthGroup = segments[0] === "(auth)";

  const navigationState = useRootNavigationState();
  const ready = navigationState?.key != null;
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    setTokenListener((tokens) => {
      if (tokens) {
        dispatch(setCredentials(tokens));
      } else {
        dispatch(clearToken());
      }
    });
    return () => setTokenListener(null);
  }, [dispatch]);

  useEffect(() => {
    let active = true;
    (async () => {
      if (token) {
        if (active) setBootstrapped(true);
        return;
      }

      const stored = await loadStoredRefreshToken();
      if (!stored) {
        if (active) setBootstrapped(true);
        return;
      }

      try {
        await refreshTokens();
      } catch {
        await clearTokens();
      } finally {
        if (active) setBootstrapped(true);
      }
    })();

    return () => {
      active = false;
    };
  }, [token, dispatch]);

  // -----------------------------
  //   1. Wenn Token existiert → /me laden
  // -----------------------------
  useEffect(() => {
    if (token && !user) {
      dispatch(fetchCurrentUser(token));
    }
  }, [token, user, dispatch]);


  if (!ready) {
    return null;
  }

  if (!bootstrapped) {
    return <Spinner />;
  }
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
  // -----------------------------
  //   4. Alles normal anzeigen
  // -----------------------------
  return <>{children}</>;
}

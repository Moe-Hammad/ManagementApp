import Spinner from "@/src/components/Spinner";
import { register as apiRegister } from "@/src/services/api"; // ← Anpassen falls nötig
import { makeStyles } from "@/src/theme/styles";
import { useThemeMode } from "@/src/theme/ThemeProvider";
import { router } from "expo-router";
import { useState } from "react";
import {
  Keyboard,
  Pressable,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";

export default function Register() {
  const { isDark } = useThemeMode();
  const styles = makeStyles(isDark);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRegister() {
    setError(null);

    if (!name || !email || !password || !confirm) {
      return setError("Bitte fülle alle Felder aus.");
    }

    if (password !== confirm) {
      return setError("Die Passwörter stimmen nicht überein.");
    }

    setLoading(true);

    try {
      const response = await apiRegister({ name, email, password });
      // Success → redirect
      router.replace("/(auth)/login");
    } catch (e: any) {
      setError(e.message || "Registrierung fehlgeschlagen.");
    } finally {
      setLoading(false);
    }
  }

  function rerouteLogin() {
    router.push("/(auth)/login");
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.centerWrapper}>
        <View style={styles.cardWrapper}>
          <Text style={styles.title}>Registrieren</Text>

          {/* Name */}
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Max Mustermann"
            autoCapitalize="words"
          />

          {/* Email */}
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="email@mail.com"
            autoCapitalize="none"
          />

          {/* Passwort */}
          <Text style={styles.label}>Passwort</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
          />

          {/* Passwort bestätigen */}
          <Text style={styles.label}>Passwort bestätigen</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            value={confirm}
            onChangeText={setConfirm}
            placeholder="••••••••"
          />

          {error && <Text style={styles.error}>{error}</Text>}

          {loading ? (
            <Spinner />
          ) : (
            <Pressable style={styles.button} onPress={handleRegister}>
              <Text style={styles.buttonText}>Account erstellen</Text>
            </Pressable>
          )}

          <Pressable onPress={rerouteLogin} style={{ marginTop: 14 }}>
            <Text style={styles.link}>Schon ein Konto? Jetzt einloggen</Text>
          </Pressable>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

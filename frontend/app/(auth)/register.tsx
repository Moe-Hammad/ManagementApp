import Spinner from "@/src/components/Spinner";
import { register as apiRegister } from "@/src/services/api"; // ← Anpassen falls nötig
import { makeStyles } from "@/src/theme/styles";
import { useThemeMode } from "@/src/theme/ThemeProvider";
import { UserRole } from "@/src/types/resources";
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

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [role, setRole] = useState<UserRole>(UserRole.EMPLOYEE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState({
    firstName: false,
    lastName: false,
    email: false,
    password: false,
    confirm: false,
  });

  async function handleRegister() {
    setError(null);

    const newErrors = {
      firstName: !firstName,
      lastName: !lastName,
      email: !email || !email.includes("@"),
      password: !password,
      confirm: !confirm || password !== confirm,
    };

    setErrors(newErrors);

    // Wenn Fehler: abbrechen
    if (Object.values(newErrors).includes(true)) {
      return;
    }

    setLoading(true);

    try {
      await apiRegister({
        firstName,
        lastName,
        email,
        password,
        role,
      });
      // Erfolgreich → AuthGate übernimmt
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
          {/* Email */}
          <Text style={styles.label}>
            Vorname<Text style={{ color: "red" }}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.firstName && styles.errorInput]}
            value={firstName}
            onChangeText={(text) => {
              setFirstName(text);
              setErrors({ ...errors, firstName: false });
            }}
            placeholder="Max"
            autoCapitalize="words"
          />

          <Text style={styles.label}>
            Name<Text style={{ color: "red" }}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.lastName && styles.errorInput]}
            value={lastName}
            onChangeText={(text) => {
              setLastName(text);
              setErrors({ ...errors, lastName: false });
            }}
            placeholder="Mustermann"
            autoCapitalize="words"
          />

          {/* Email */}
          <Text style={styles.label}>
            Email<Text style={{ color: "red" }}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.email && styles.errorInput]}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setErrors({ ...errors, email: false });
            }}
            placeholder="email@mail.com"
            autoCapitalize="none"
          />
          {errors.email && (
            <Text style={styles.errorUnderText}>
              Bitte gib eine gültige Email ein.
            </Text>
          )}

          <Text style={styles.label}>
            Password<Text style={{ color: "red" }}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.password && styles.errorInput]}
            secureTextEntry
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setErrors({ ...errors, password: false });
            }}
            placeholder="*******"
          />

          {/* Passwort bestätigen */}
          <Text style={styles.label}>
            Password bestätigen<Text style={{ color: "red" }}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.confirm && styles.errorInput]}
            secureTextEntry
            value={confirm}
            onChangeText={(text) => {
              setConfirm(text);
              setErrors({ ...errors, confirm: false });
            }}
            placeholder="*******"
          />

          {errors.confirm && (
            <Text style={styles.errorUnderText}>
              Die Passwörter stimmen nicht überein.
            </Text>
          )}

          {/* Role */}
          <Text style={styles.label}>Welche Rolle</Text>

          <View style={styles.viewButtonRow}>
            <Pressable
              style={[
                styles.roleButton,
                role === UserRole.EMPLOYEE
                  ? styles.roleButtonActive
                  : styles.roleButtonInactive,
              ]}
              onPress={() => setRole(UserRole.EMPLOYEE)}
            >
              <Text
                style={
                  role === UserRole.EMPLOYEE
                    ? styles.roleButtonTextActive
                    : styles.roleButtonTextInactive
                }
              >
                Arbeiter
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.roleButton,
                role === UserRole.MANAGER
                  ? styles.roleButtonActive
                  : styles.roleButtonInactive,
              ]}
              onPress={() => setRole(UserRole.MANAGER)}
            >
              <Text
                style={
                  role === UserRole.MANAGER
                    ? styles.roleButtonTextActive
                    : styles.roleButtonTextInactive
                }
              >
                Manager
              </Text>
            </Pressable>
          </View>

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

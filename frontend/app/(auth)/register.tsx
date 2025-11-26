import ScreenController from "@/src/components/util/ScreenController";
import Spinner from "@/src/components/util/Spinner";
import { useAppDispatch } from "@/src/hooks/useRedux";
import { setCredentials } from "@/src/redux/authSlice";
import { login as apiLogin, register as apiRegister } from "@/src/services/api";
import { fetchCurrentUser } from "@/src/services/thunks/fetchCurrentUser";
import { makeStyles } from "@/src/theme/styles";
import { useThemeMode } from "@/src/theme/ThemeProvider";
import { UserRole } from "@/src/types/resources";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

export default function Register() {
  const { isDark } = useThemeMode();
  const styles = makeStyles(isDark);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [role, setRole] = useState<UserRole>(UserRole.EMPLOYEE);
  const [hourlyRate, setHourlyRate] = useState("");
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const [errors, setErrors] = useState({
    firstName: false,
    lastName: false,
    email: false,
    password: false,
    confirm: false,
    hourlyRate: false,
  });

  // Validate all fields
  function validateFields() {
    const newErrors = {
      firstName: firstName.trim().length === 0,
      lastName: lastName.trim().length === 0,
      email: !email.trim().includes("@"),
      password: password.trim().length === 0,
      confirm: confirm.trim().length === 0 || password !== confirm,
      hourlyRate:
        role === UserRole.EMPLOYEE &&
        (hourlyRate.trim().length === 0 || isNaN(Number(hourlyRate))),
    };

    setErrors(newErrors);

    // If any error → return false
    return !Object.values(newErrors).includes(true);
  }

  async function handleRegister() {
    setServerError(null);

    if (!validateFields()) return;

    setLoading(true);

    try {
      const res = await apiRegister({
        firstName,
        lastName,
        email,
        password,
        role,
        hourlyRate:
          role === UserRole.EMPLOYEE && hourlyRate.trim().length > 0
            ? Number(hourlyRate)
            : undefined,
      });

      const loginRes = res?.token ? res : await apiLogin(email, password);

      dispatch(setCredentials(loginRes));
      await dispatch(fetchCurrentUser(loginRes.token));
      router.replace("/");
    } catch (e: any) {
      setServerError(e.message || "Registrierung fehlgeschlagen.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenController scroll>
      <View style={styles.centerWrapper}>
        <View style={styles.cardWrapper}>
          <Text style={styles.title}>Registrieren</Text>

          {/* SERVER ERROR */}
          {serverError && (
            <Text style={[styles.errorUnderText, { marginBottom: 10 }]}>
              {serverError}
            </Text>
          )}
          {/* First Name */}
          <Text style={styles.label}>
            Vorname<Text style={{ color: "red" }}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.firstName && styles.errorInput]}
            value={firstName}
            onChangeText={(text) => {
              setFirstName(text);
              setErrors((prev) => ({ ...prev, firstName: false }));
            }}
            placeholder="Max"
            autoCapitalize="words"
          />

          {/* Last Name */}
          <Text style={styles.label}>
            Nachname<Text style={{ color: "red" }}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.lastName && styles.errorInput]}
            value={lastName}
            onChangeText={(text) => {
              setLastName(text);
              setErrors((prev) => ({ ...prev, lastName: false }));
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
              setErrors((prev) => ({ ...prev, email: false }));
            }}
            placeholder="email@mail.com"
            autoCapitalize="none"
          />
          {errors.email && (
            <Text style={styles.errorUnderText}>
              Bitte gib eine gültige Email ein.
            </Text>
          )}

          {/* Password */}
          <Text style={styles.label}>
            Passwort<Text style={{ color: "red" }}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.password && styles.errorInput]}
            secureTextEntry
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setErrors((prev) => ({ ...prev, password: false }));
            }}
            placeholder="*******"
          />

          {/* Confirm Password */}
          <Text style={styles.label}>
            Passwort bestätigen<Text style={{ color: "red" }}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.confirm && styles.errorInput]}
            secureTextEntry
            value={confirm}
            onChangeText={(text) => {
              setConfirm(text);
              setErrors((prev) => ({ ...prev, confirm: false }));
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

          {/* Hourly Rate only for employees */}
          {role === UserRole.EMPLOYEE && (
            <>
              <Text style={styles.label}>
                Stundenlohn<Text style={{ color: "red" }}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.hourlyRate && styles.errorInput]}
                value={hourlyRate}
                onChangeText={(text) => {
                  setHourlyRate(text);
                  setErrors((prev) => ({ ...prev, hourlyRate: false }));
                }}
                placeholder="15"
                keyboardType="numeric"
              />
              {errors.hourlyRate && (
                <Text style={styles.errorUnderText}>
                  Bitte gib einen g&uuml;ltigen Stundenlohn ein.
                </Text>
              )}
            </>
          )}

          {/* Submit */}
          {loading ? (
            <Spinner />
          ) : (
            <Pressable style={styles.button} onPress={handleRegister}>
              <Text style={styles.buttonText}>Account erstellen</Text>
            </Pressable>
          )}

          {/* Link */}
          <Pressable
            onPress={() => router.push("/(auth)/login")}
            style={{ marginTop: 14 }}
          >
            <Text style={styles.link}>Schon ein Konto? Jetzt einloggen</Text>
          </Pressable>
        </View>
      </View>
    </ScreenController>
  );
}

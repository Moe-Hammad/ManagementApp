import ScreenController from "@/src/components/core/ScreenController";
import { useAppDispatch, useAppSelector } from "@/src/hooks/useRedux";
import { clearToken, setUser } from "@/src/redux/authSlice";
import { deleteUserAccount, updateUserProfile } from "@/src/services/api";
import { useThemeMode } from "@/src/theme/ThemeProvider";
import { makeStyles } from "@/src/theme/styles";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function AccountScreen() {
  const { isDark } = useThemeMode();
  const styles = makeStyles(isDark);
  const router = useRouter();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  const user = useAppSelector((s) => s.auth.user);
  const token = useAppSelector((s) => s.auth.token?.token);

  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [isEditing, setIsEditing] = useState(false);
  const [profileStatus, setProfileStatus] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setEmail(user.email);
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!token || !user) {
      setProfileStatus("Kein Token verfügbar.");
      return;
    }
    setProfileLoading(true);
    setProfileStatus(null);
    try {
      const updated = await updateUserProfile(
        user,
        { firstName, lastName, email },
        token
      );
      dispatch(setUser(updated));
      setProfileStatus("Profil aktualisiert.");
      setIsEditing(false);
    } catch (err: any) {
      setProfileStatus(
        err?.message || "Profil konnte nicht aktualisiert werden."
      );
    } finally {
      setProfileLoading(false);
    }
  };

  const handleCancelEdit = useCallback(() => {
    if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setEmail(user.email);
    }
    setProfileStatus(null);
    setIsEditing(false);
  }, [user]);

  useEffect(() => {
    const sub = navigation.addListener("beforeRemove", (e) => {
      if (!isEditing) return;
      e.preventDefault();

      Alert.alert(
        "Änderungen verwerfen?",
        "Ungespeicherte Änderungen gehen verloren.",
        [
          { text: "Bleiben", style: "cancel" },
          {
            text: "Verwerfen",
            style: "destructive",
            onPress: () => {
              handleCancelEdit();
              navigation.dispatch(e.data.action);
            },
          },
        ]
      );
    });

    return sub;
  }, [navigation, isEditing, handleCancelEdit]);

  const handleDeleteAccount = () => {
    if (!token || !user) return;
    Alert.alert(
      "Account löschen",
      "Bist du sicher? Dieser Schritt kann nicht rückgängig gemacht werden?",
      [
        { text: "Abbrechen", style: "cancel" },
        {
          text: "Loeschen",
          style: "destructive",
          onPress: async () => {
            try {
              setDeleteLoading(true);
              await deleteUserAccount(user, token);
              dispatch(clearToken());
            } catch (err: any) {
              Alert.alert(
                "Fehler",
                err?.message || "Account konnte nicht gelöscht werden."
              );
            } finally {
              setDeleteLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScreenController>
      <View style={styles.screen}>
        <Text style={styles.titles}>Konto</Text>

        <View style={[styles.widget, styles.widgetSpacingSm, styles.widgetGap]}>
          <View style={styles.profileHeaderRow}>
            <Text style={styles.widgetTitle}>Profil</Text>
            <TouchableOpacity
              onPress={() => setIsEditing((prev) => !prev)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MaterialCommunityIcons
                name={isEditing ? "close" : "pencil"}
                size={20}
                color={isDark ? "#fff" : "#111827"}
              />
            </TouchableOpacity>
          </View>

          {isEditing ? (
            <>
              <TextInput
                style={styles.input}
                placeholder="Vorname"
                placeholderTextColor="#888"
                value={firstName}
                onChangeText={setFirstName}
              />
              <TextInput
                style={styles.input}
                placeholder="Nachname"
                placeholderTextColor="#888"
                value={lastName}
                onChangeText={setLastName}
              />
              <TextInput
                style={styles.input}
                placeholder="E-Mail"
                placeholderTextColor="#888"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
              {profileStatus ? (
                <Text style={styles.textMuted}>{profileStatus}</Text>
              ) : null}
              <View style={styles.profileButtonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.profileActionButton]}
                  onPress={handleSaveProfile}
                  disabled={profileLoading}
                >
                  <Text style={styles.buttonText}>
                    {profileLoading ? "Speichere..." : "Speichern"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.profileActionButton,
                    styles.profileCancelButton,
                  ]}
                  onPress={handleCancelEdit}
                  disabled={profileLoading}
                >
                  <Text
                    style={[styles.buttonText, styles.profileCancelButtonText]}
                  >
                    Abbrechen
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <View>
                <Text style={styles.textMuted}>Vorname</Text>
                <Text style={styles.text}>{firstName || "-"}</Text>
              </View>
              <View>
                <Text style={styles.textMuted}>Nachname</Text>
                <Text style={styles.text}>{lastName || "-"}</Text>
              </View>
              <View>
                <Text style={styles.textMuted}>E-Mail</Text>
                <Text style={styles.text}>{email || "-"}</Text>
              </View>
              {profileStatus ? (
                <Text style={styles.textMuted}>{profileStatus}</Text>
              ) : null}
            </>
          )}
        </View>

        <View style={[styles.widget, styles.widgetSpacingSm, styles.widgetGap]}>
          <Text style={styles.widgetTitle}>Passwort</Text>
          <Text style={styles.textMuted}>
            Passwortänderung ist aktuell nicht verfügbar.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.widget, styles.widgetSpacingMd, styles.dangerWidget]}
          onPress={handleDeleteAccount}
          disabled={deleteLoading}
        >
          <Text style={[styles.widgetTitle, styles.dangerWidgetTitle]}>
            Account löschen
          </Text>
          <Text style={styles.dangerWidgetText}>
            Dieser Schritt ist endgültig.
          </Text>
        </TouchableOpacity>
      </View>
    </ScreenController>
  );
}

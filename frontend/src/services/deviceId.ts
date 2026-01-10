import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const DEVICE_ID_KEY = "device.id";

export async function getDeviceId(): Promise<string> {
  const cached = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (cached) return cached;

  const constants = Constants as unknown as {
    installationId?: string;
    deviceId?: string;
  };
  const expoId = constants.installationId || constants.deviceId;
  const generated =
    expoId || `device-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  await AsyncStorage.setItem(DEVICE_ID_KEY, generated);
  return generated;
}

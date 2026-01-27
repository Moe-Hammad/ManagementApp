import AsyncStorage from "@react-native-async-storage/async-storage";
import { LoginResponse } from "../types/resources";

const REFRESH_TOKEN_KEY = "auth.refreshToken";

let accessToken: string | null = null;
let refreshToken: string | null = null;
let tokenListener: ((tokens: LoginResponse | null) => void) | null = null;

export function setTokenListener(
  listener: ((tokens: LoginResponse | null) => void) | null
) {
  tokenListener = listener;
}

export function getAccessToken() {
  return accessToken;
}

export function getRefreshToken() {
  return refreshToken;
}

export async function loadStoredRefreshToken() {
  refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
  return refreshToken;
}

export async function setTokens(tokens: LoginResponse) {
  accessToken = tokens.accessToken;
  refreshToken = tokens.refreshToken;
  tokenListener?.(tokens);
  await AsyncStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
}

export async function clearTokens() {
  accessToken = null;
  refreshToken = null;
  tokenListener?.(null);
  await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
}

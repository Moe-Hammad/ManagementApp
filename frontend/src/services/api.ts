import { Buffer } from "buffer";
import { LoginResponse, RegisterRequest } from "../types/resources";

const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export async function login(email: string, password: string) {
  const credentials = Buffer.from(`${email}:${password}`).toString("base64");
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${credentials}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      `E-Mail oder Password stimmen nicht. Code ${response.status}`
    );
  }

  return await response.json();
}

export async function register(
  registrationData: RegisterRequest
): Promise<LoginResponse> {
  if (!registrationData.firstName) throw new Error("First Name not defined");
  if (!registrationData.lastName) throw new Error("Last Name not defined");
  if (!registrationData.email) throw new Error("Email not defined");
  if (!registrationData.password) throw new Error("Password not defined");
  if (!registrationData.role) throw new Error("Role not defined");

  const payload: RegisterRequest = {
    firstName: registrationData.firstName,
    lastName: registrationData.lastName,
    email: registrationData.email,
    password: registrationData.password,
    role: registrationData.role,
    hourlyRate: registrationData.hourlyRate,
  };

  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.json();
    throw new Error(
      errorBody.error || "Server Fehler, versuchen Sie es später nochmal."
    );
  }
  return await response.json();
}

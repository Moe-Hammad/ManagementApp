import { Buffer } from "buffer";
import { LoginResponse, RegisterRequest } from "../types/resources";

export async function login(email: string, password: string) {
  const credentials = Buffer.from(`${email}:${password}`).toString("base64");

  const response = await fetch("http://192.168.0.128:8080/api/auth/login", {
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

  const response = await fetch(`http://192.168.0.128:8080/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      firstName: registrationData.firstName,
      lastName: registrationData.lastName,
      email: registrationData.email,
      password: registrationData.password,
      role: registrationData.role,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json();
    throw new Error(errorBody.error || "Unbekannter Fehler");
  }
  return await response.json();
}

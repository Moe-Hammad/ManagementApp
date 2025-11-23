import { Buffer } from "buffer";
import { RegisterRequest } from "../types/resources";

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
    throw new Error(`E-Mail or Password is incorrect. Code ${response.status}`);
  }

  return response.json();
}

export async function register(
  registrationData: RegisterRequest
): Promise<void> {
  if (!registrationData.firstName) throw new Error("First Name not defined");
  if (!registrationData.email) throw new Error("email not defined");
  if (!registrationData.password) throw new Error("Password not defined");

  const response = await fetch(`http://192.168.0.128:8080/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: registrationData.username,
      email: registrationData.email,
      password: registrationData.password1,
    }),
  });
  response.json();
}

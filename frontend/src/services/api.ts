import { Buffer } from "buffer";

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
    const text = await response.text();
    throw new Error(text || `HTTP ${response.status}`);
  }

  return response.json();
}

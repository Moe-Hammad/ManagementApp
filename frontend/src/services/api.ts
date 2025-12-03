import { Buffer } from "buffer";
import {
  ChatMessage,
  ChatRoom,
  LoginResponse,
  RegisterRequest,
  RequestItem,
  RequestStatus,
} from "../types/resources";

const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

const authHeader = (token?: string): Record<string, string> =>
  token ? { Authorization: `Bearer ${token}` } : {};

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

  const authHeaderValue =
    response.headers.get("Authorization") ||
    response.headers.get("authorization");
  const body = await response.json();
  const token =
    (authHeaderValue && authHeaderValue.replace(/Bearer\s+/i, "")) ||
    (body as any)?.token;

  return { ...(body as any), token };
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
      (errorBody as any).error || "Server Fehler, versuchen Sie es spaeter nochmal."
    );
  }

  const authHeaderValue =
    response.headers.get("Authorization") ||
    response.headers.get("authorization");
  const body = await response.json();
  const token =
    (authHeaderValue && authHeaderValue.replace(/Bearer\s+/i, "")) ||
    (body as any)?.token;

  return { ...(body as any), token };
}

// ============================
// Requests / Matching
// ============================

export async function fetchUnassignedEmployees(query: string, token: string) {
  const url = new URL(`${API_BASE_URL}/api/employees/unassigned`);
  if (query) url.searchParams.append("query", query);

  const response = await fetch(url.toString(), {
    headers: {
      "Content-Type": "application/json",
      ...authHeader(token),
    },
  });

  if (!response.ok) {
    throw new Error(`Unassigned employees failed (${response.status})`);
  }

  return response.json();
}

export async function listRequestsForManager(
  managerId: string,
  token: string
): Promise<RequestItem[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/requests/manager/${managerId}`,
    {
      headers: {
        "Content-Type": "application/json",
        ...authHeader(token),
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Requests fetch failed (${response.status})`);
  }
  return response.json();
}

export async function listRequestsForEmployee(
  employeeId: string,
  token: string
): Promise<RequestItem[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/requests/employee/${employeeId}`,
    {
      headers: {
        "Content-Type": "application/json",
        ...authHeader(token),
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Requests fetch failed (${response.status})`);
  }
  return response.json();
}

export async function createRequestApi(
  payload: { employeeId: string; managerId: string; message?: string },
  token: string
): Promise<RequestItem> {
  const response = await fetch(`${API_BASE_URL}/api/requests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(token),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Request create failed (${response.status}) - ${errorBody || ""}`.trim()
    );
  }

  return response.json();
}

export async function updateRequestStatusApi(
  requestId: string,
  status: RequestStatus,
  token: string
): Promise<RequestItem> {
  const response = await fetch(
    `${API_BASE_URL}/api/requests/${requestId}?status=${status}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...authHeader(token),
      },
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Request update failed (${response.status}) - ${errorBody || ""}`.trim()
    );
  }

  return response.json();
}

// ============================
// Chats
// ============================

export async function listChats(token: string): Promise<ChatRoom[]> {
  const response = await fetch(`${API_BASE_URL}/api/chats`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeader(token),
    },
  });

  if (!response.ok) {
    throw new Error(`Chats fetch failed (${response.status})`);
  }

  return response.json();
}

export async function listMessages(
  chatId: string,
  token: string
): Promise<ChatMessage[]> {
  const response = await fetch(`${API_BASE_URL}/api/chats/${chatId}/messages`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeader(token),
    },
  });

  if (!response.ok) {
    throw new Error(`Messages fetch failed (${response.status})`);
  }

  return response.json();
}

export async function createDirectChatApi(
  managerId: string,
  employeeId: string,
  token: string
): Promise<ChatRoom> {
  const response = await fetch(`${API_BASE_URL}/api/chats/direct`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(token),
    },
    body: JSON.stringify({ managerId, employeeId }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Direct chat create failed (${response.status}) - ${errorBody || ""}`.trim()
    );
  }

  return response.json();
}

export async function sendChatMessageApi(
  chatId: string,
  text: string,
  token: string
): Promise<ChatMessage> {
  const response = await fetch(`${API_BASE_URL}/api/chats/${chatId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain",
      ...authHeader(token),
    },
    body: text,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Message send failed (${response.status}) - ${errorBody || ""}`.trim()
    );
  }

  return response.json();
}

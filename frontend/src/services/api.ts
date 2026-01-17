import { Buffer } from "buffer";
import {
  ChatMessage,
  ChatRoom,
  CalendarEvent,
  LoginResponse,
  RegisterRequest,
  RequestItem,
  RequestStatus,
  Task,
  TaskAssignment,
  AssignmentStatus,
  Employee,
  UserRole,
  User,
  Manager,
} from "../types/resources";
import { clearTokens, getRefreshToken, loadStoredRefreshToken, setTokens } from "./authSession";
import { getDeviceId } from "./deviceId";

const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

let refreshPromise: Promise<LoginResponse> | null = null;

const authHeader = (token?: string): Record<string, string> =>
  token ? { Authorization: `Bearer ${token}` } : {};

const extractAccessToken = (response: Response, body: any) => {
  const authHeaderValue =
    response.headers.get("Authorization") ||
    response.headers.get("authorization");
  const headerToken = authHeaderValue
    ? authHeaderValue.replace(/Bearer\s+/i, "")
    : null;
  return headerToken || body?.accessToken || body?.token;
};

const buildAuthInit = (init: RequestInit, accessToken: string) => {
  const headers =
    init.headers instanceof Headers
      ? Object.fromEntries(init.headers.entries())
      : Array.isArray(init.headers)
      ? Object.fromEntries(init.headers)
      : { ...(init.headers || {}) };

  return {
    ...init,
    headers: {
      ...headers,
      Authorization: `Bearer ${accessToken}`,
    },
  };
};

async function fetchWithAuth(
  input: RequestInfo | URL,
  init: RequestInit,
  accessToken?: string
) {
  const response = await fetch(input, init);
  if (response.status !== 401 || !accessToken) {
    return response;
  }

  const refreshed = await refreshTokens().catch(() => null);
  if (!refreshed?.accessToken) {
    return response;
  }

  const retryInit = buildAuthInit(init, refreshed.accessToken);
  return fetch(input, retryInit);
}

export async function login(email: string, password: string) {
  const credentials = Buffer.from(`${email}:${password}`).toString("base64");
  const deviceId = await getDeviceId();
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${credentials}`,
      "X-Device-Id": deviceId,
    },
  });

  if (!response.ok) {
    throw new Error(
      `E-Mail oder Password stimmen nicht. Code ${response.status}`
    );
  }

  const body = await response.json();
  const accessToken = extractAccessToken(response, body);
  const refreshToken = (body as any)?.refreshToken;

  if (!accessToken || !refreshToken) {
    throw new Error("Login response missing tokens");
  }

  const payload = {
    ...(body as any),
    accessToken,
    refreshToken,
  } as LoginResponse;

  await setTokens(payload);
  return payload;
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

  const deviceId = await getDeviceId();
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Device-Id": deviceId,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.json();
    throw new Error(
      (errorBody as any).error ||
        "Server Fehler, versuchen Sie es später nochmal."
    );
  }

  const body = await response.json();
  const accessToken = extractAccessToken(response, body);
  const refreshToken = (body as any)?.refreshToken;

  if (!accessToken || !refreshToken) {
    throw new Error("Register response missing tokens");
  }

  const payloadResponse = {
    ...(body as any),
    accessToken,
    refreshToken,
  } as LoginResponse;

  await setTokens(payloadResponse);
  return payloadResponse;
}

export async function refreshTokens() {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const stored =
        getRefreshToken() || (await loadStoredRefreshToken());
      if (!stored) {
        throw new Error("No refresh token");
      }

      const deviceId = await getDeviceId();
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Device-Id": deviceId,
        },
        body: JSON.stringify({ refreshToken: stored }),
      });

      if (!response.ok) {
        await clearTokens();
        throw new Error("Refresh failed");
      }

      const body = await response.json();
      const accessToken = extractAccessToken(response, body);
      const refreshToken = (body as any)?.refreshToken || stored;

      if (!accessToken) {
        await clearTokens();
        throw new Error("Refresh response missing access token");
      }

      const payload = {
        ...(body as any),
        accessToken,
        refreshToken,
      } as LoginResponse;

      await setTokens(payload);
      return payload;
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

export async function logout() {
  const stored = getRefreshToken() || (await loadStoredRefreshToken());
  if (!stored) {
    await clearTokens();
    return;
  }

  await fetch(`${API_BASE_URL}/api/auth/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken: stored }),
  }).catch(() => {});

  await clearTokens();
}

// ============================
// Requests / Matching
// ============================

export async function fetchUnassignedEmployees(query: string, token: string) {
  const url = new URL(`${API_BASE_URL}/api/employees/unassigned`);
  if (query) url.searchParams.append("query", query);

  const response = await fetchWithAuth(
    url.toString(),
    {
      headers: {
        "Content-Type": "application/json",
        ...authHeader(token),
      },
    },
    token
  );

  if (!response.ok) {
    throw new Error(`Unassigned employees failed (${response.status})`);
  }

  return response.json();
}

export async function listRequestsForManager(
  managerId: string,
  token: string
): Promise<RequestItem[]> {
  const response = await fetchWithAuth(
    `${API_BASE_URL}/api/requests/manager/${managerId}`,
    {
      headers: {
        "Content-Type": "application/json",
        ...authHeader(token),
      },
    },
    token
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
  const response = await fetchWithAuth(
    `${API_BASE_URL}/api/requests/employee/${employeeId}`,
    {
      headers: {
        "Content-Type": "application/json",
        ...authHeader(token),
      },
    },
    token
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
  const response = await fetchWithAuth(
    `${API_BASE_URL}/api/requests`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeader(token),
      },
      body: JSON.stringify(payload),
    },
    token
  );

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
  const response = await fetchWithAuth(
    `${API_BASE_URL}/api/requests/${requestId}?status=${status}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...authHeader(token),
      },
    },
    token
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
  const response = await fetchWithAuth(
    `${API_BASE_URL}/api/chats`,
    {
      headers: {
        "Content-Type": "application/json",
        ...authHeader(token),
      },
    },
    token
  );

  if (!response.ok) {
    throw new Error(`Chats fetch failed (${response.status})`);
  }

  return response.json();
}

export async function listMessages(
  chatId: string,
  token: string
): Promise<ChatMessage[]> {
  const response = await fetchWithAuth(
    `${API_BASE_URL}/api/chats/${chatId}/messages`,
    {
      headers: {
        "Content-Type": "application/json",
        ...authHeader(token),
      },
    },
    token
  );

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
  const response = await fetchWithAuth(
    `${API_BASE_URL}/api/chats/direct`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeader(token),
      },
      body: JSON.stringify({ managerId, employeeId }),
    },
    token
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Direct chat create failed (${response.status}) - ${
        errorBody || ""
      }`.trim()
    );
  }

  return response.json();
}

export async function sendChatMessageApi(
  chatId: string,
  text: string,
  token: string
): Promise<ChatMessage> {
  const response = await fetchWithAuth(
    `${API_BASE_URL}/api/chats/${chatId}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
        ...authHeader(token),
      },
      body: text,
    },
    token
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Message send failed (${response.status}) - ${errorBody || ""}`.trim()
    );
  }

  return response.json();
}

// ============================
// Calendar
// ============================

export async function fetchMyCalendarEvents(
  token: string
): Promise<CalendarEvent[]> {
  const response = await fetchWithAuth(
    `${API_BASE_URL}/api/calendar/me`,
    {
      headers: {
        "Content-Type": "application/json",
        ...authHeader(token),
      },
    },
    token
  );

  if (!response.ok) {
    throw new Error(`Calendar fetch failed (${response.status})`);
  }

  return response.json();
}

export async function fetchManagerCalendarEvents(
  token: string
): Promise<CalendarEvent[]> {
  const response = await fetchWithAuth(
    `${API_BASE_URL}/api/calendar/manager`,
    {
      headers: {
        "Content-Type": "application/json",
        ...authHeader(token),
      },
    },
    token
  );

  if (!response.ok) {
    throw new Error(`Calendar fetch failed (${response.status})`);
  }

  return response.json();
}

// ============================
// Tasks & Assignments
// ============================

export async function createTaskApi(
  payload: Omit<Task, "id" | "managerId">,
  token: string
): Promise<Task> {
  const response = await fetchWithAuth(
    `${API_BASE_URL}/api/tasks`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeader(token),
      },
      body: JSON.stringify(payload),
    },
    token
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Task create failed (${response.status}) - ${errorBody || ""}`.trim()
    );
  }

  return response.json();
}

export async function fetchTasksForManager(
  managerId: string,
  token: string
): Promise<Task[]> {
  const response = await fetchWithAuth(
    `${API_BASE_URL}/api/tasks/manager/${managerId}`,
    {
      headers: {
        "Content-Type": "application/json",
        ...authHeader(token),
      },
    },
    token
  );

  if (!response.ok) {
    throw new Error(`Tasks fetch failed (${response.status})`);
  }

  return response.json();
}

export async function deleteTaskApi(taskId: string, token: string): Promise<void> {
  const response = await fetchWithAuth(
    `${API_BASE_URL}/api/tasks/${taskId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...authHeader(token),
      },
    },
    token
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Task delete failed (${response.status}) ${body || ""}`.trim()
    );
  }
}

export async function assignEmployeeToTask(
  payload: { taskId: string; employeeId: string; status?: AssignmentStatus },
  token: string
): Promise<TaskAssignment> {
  const response = await fetchWithAuth(
    `${API_BASE_URL}/api/task-assignments`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeader(token),
      },
      body: JSON.stringify(payload),
    },
    token
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Assignment create failed (${response.status}) - ${
        errorBody || ""
      }`.trim()
    );
  }

  return response.json();
}

export async function fetchAssignmentsForTask(
  taskId: string,
  token: string
): Promise<TaskAssignment[]> {
  const response = await fetchWithAuth(
    `${API_BASE_URL}/api/task-assignments/task/${taskId}`,
    {
      headers: {
        "Content-Type": "application/json",
        ...authHeader(token),
      },
    },
    token
  );

  if (!response.ok) {
    throw new Error(`Assignments fetch failed (${response.status})`);
  }

  return response.json();
}

export async function fetchAssignmentsForEmployee(
  employeeId: string,
  token: string
): Promise<TaskAssignment[]> {
  const response = await fetchWithAuth(
    `${API_BASE_URL}/api/task-assignments/employee/${employeeId}`,
    {
      headers: {
        "Content-Type": "application/json",
        ...authHeader(token),
      },
    },
    token
  );

  if (!response.ok) {
    throw new Error(`Assignments fetch failed (${response.status})`);
  }

  return response.json();
}

export async function fetchTaskById(taskId: string, token: string): Promise<Task> {
  const response = await fetchWithAuth(
    `${API_BASE_URL}/api/tasks/${taskId}`,
    {
      headers: {
        "Content-Type": "application/json",
        ...authHeader(token),
      },
    },
    token
  );
  if (!response.ok) {
    throw new Error(`Task fetch failed (${response.status})`);
  }
  return response.json();
}

export async function updateTaskApi(taskId: string, payload: Partial<Task>, token: string): Promise<Task> {
  const response = await fetchWithAuth(
    `${API_BASE_URL}/api/tasks/${taskId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...authHeader(token),
      },
      body: JSON.stringify(payload),
    },
    token
  );
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Task update failed (${response.status}) ${body || ""}`.trim());
  }
  return response.json();
}

export async function updateAssignmentStatusApi(
  assignmentId: string,
  status: AssignmentStatus,
  token: string
): Promise<TaskAssignment> {
  const response = await fetchWithAuth(
    `${API_BASE_URL}/api/task-assignments/${assignmentId}/status?status=${status}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...authHeader(token),
      },
    },
    token
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Assignment update failed (${response.status}) - ${
        errorBody || ""
      }`.trim()
    );
  }

  return response.json();
}

// ============================
// Employees
// ============================

export async function listEmployeesUnderManager(
  managerId: string,
  token: string
): Promise<Employee[]> {
  const response = await fetchWithAuth(
    `${API_BASE_URL}/api/managers/${managerId}/employees`,
    {
      headers: {
        "Content-Type": "application/json",
        ...authHeader(token),
      },
    },
    token
  );

  if (!response.ok) {
    throw new Error(`Employees fetch failed (${response.status})`);
  }

  return response.json();
}

export async function removeEmployeeFromManager(
  managerId: string,
  employeeId: string,
  token: string
): Promise<void> {
  const response = await fetchWithAuth(
    `${API_BASE_URL}/api/managers/${managerId}/employees/${employeeId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...authHeader(token),
      },
    },
    token
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Employee remove failed (${response.status}) ${errorBody || ""}`.trim()
    );
  }
}

// ============================
// Account / Profile
// ============================

export async function updateUserProfile(
  user: User,
  payload: Pick<User, "firstName" | "lastName" | "email">,
  token: string
): Promise<User> {
  const endpoint =
    user.role === UserRole.MANAGER
      ? `/api/managers/${user.id}`
      : `/api/employees/${user.id}`;

  const body =
    user.role === UserRole.MANAGER
      ? { ...(user as Manager), ...payload }
      : { ...(user as Employee), ...payload };

  const response = await fetchWithAuth(
    `${API_BASE_URL}${endpoint}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...authHeader(token),
      },
      body: JSON.stringify(body),
    },
    token
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Profile update failed (${response.status}) ${errorBody || ""}`.trim()
    );
  }

  return response.json();
}

export async function deleteUserAccount(user: User, token: string): Promise<void> {
  const endpoint =
    user.role === UserRole.MANAGER
      ? `/api/managers/${user.id}`
      : `/api/employees/${user.id}`;

  const response = await fetchWithAuth(
    `${API_BASE_URL}${endpoint}`,
    {
      method: "DELETE",
      headers: {
        ...authHeader(token),
      },
    },
    token
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Account delete failed (${response.status}) ${errorBody || ""}`.trim()
    );
  }
}

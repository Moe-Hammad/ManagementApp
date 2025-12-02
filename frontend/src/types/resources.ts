export enum UserRole {
  EMPLOYEE = "EMPLOYEE",
  MANAGER = "MANAGER",
}

export type BaseUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
};

export type Employee = BaseUser & {
  role: UserRole.EMPLOYEE;
  hourlyRate: number;
  availability: boolean;
  managerId: string;
};

export type Manager = BaseUser & {
  role: UserRole.MANAGER;
  employees: Employee[];
};

export type User = Employee | Manager;

export type LoginResponse = {
  token: string;
  id: string;
  userType: UserRole;
};

export type RegisterRequest = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  hourlyRate?: number;
};

export enum RequestStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export type RequestItem = {
  id: string;
  managerId: string;
  employeeId: string;
  status: RequestStatus;
  message?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ChatRoom = {
  id: string;
  managerId: string;
  employeeId: string;
  title: string; // Anzeigename des Gegenübers
  unread?: number;
  lastMessagePreview?: string;
  updatedAt?: string;
};

export type ChatMessage = {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  createdAt: string;
};

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

export enum AssignmentStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  DECLINED = "DECLINED",
  EXPIRED = "EXPIRED",
}

export enum CalendarEntryType {
  TASK = "TASK",
  VACATION = "VACATION",
  SICK = "SICK",
  BLOCKED = "BLOCKED",
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

export enum ChatType {
  DIRECT = "DIRECT",
  GROUP = "GROUP",
}

export type ChatRoom = {
  id: string;
  name: string;
  type: ChatType;
  managerId: string;
  taskId?: string | null;
  memberIds: string[];
  createdAt: string;
  lastMessagePreview?: string;
  updatedAt?: string;
};

export type ChatMessage = {
  id: string;
  chatId: string;
  senderId: string;
  senderRole?: string;
  text: string;
  createdAt: string;
};

export type Task = {
  id: string;
  managerId: string;
  location: string;
  company: string;
  requiredEmployees: number;
  start: string;
  end: string;
  responseDeadline?: string | null;
};

export type TaskAssignment = {
  id: string;
  taskId: string;
  employeeId: string;
  managerId: string;
  status: AssignmentStatus;
  respondedAt?: string | null;
};

export type CalendarEvent = {
  id: string;
  taskId?: string | null;
  employeeId: string;
  employeeName?: string | null;
  type: CalendarEntryType;
  start: string;
  end: string;
  location?: string | null;
  company?: string | null;
  assignmentStatus?: AssignmentStatus | null;
};

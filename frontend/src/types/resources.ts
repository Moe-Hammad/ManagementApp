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

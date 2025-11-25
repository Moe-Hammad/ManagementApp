import { useMemo } from "react";
import { useAppSelector } from "./useRedux";
import { Employee, Manager, User, UserRole } from "../types/resources";

export const isManagerUser = (user?: User | null): user is Manager =>
  user?.role === UserRole.MANAGER;

export function useUserStats() {
  const user = useAppSelector((s) => s.auth.user);

  return useMemo(() => {
    const manager = isManagerUser(user) ? user : null;
    const employee =
      user && user.role === UserRole.EMPLOYEE ? (user as Employee) : null;

    const employees: Employee[] = manager ? manager.employees ?? [] : [];
    const totalEmployees = employees.length;
    const availableEmployees = employees.filter((e) => e.availability).length;

    return {
      user,
      manager,
      employee,
      isManager: Boolean(manager),
      employees,
      totalEmployees,
      availableEmployees,
    };
  }, [user]);
}

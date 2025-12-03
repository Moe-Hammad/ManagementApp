import EmployeeDashboard from "@/src/screens/Inbox/components/EmployeeDashboard";
import ManagerDashboard from "@/src/screens/Inbox/components/ManagerDashboard";
import { useUserStats } from "@/src/hooks/useUserStats";

export default function Dashboard() {
  const { manager, employee, isManager, totalEmployees, availableEmployees } =
    useUserStats();

  if (isManager && manager) {
    return (
      <ManagerDashboard
        manager={manager}
        totalEmployees={totalEmployees}
        availableEmployees={availableEmployees}
      />
    );
  }

  if (employee) {
    return <EmployeeDashboard employee={employee} />;
  }

  return null;
}

import { CalendarViewBase, CalendarViewProps } from "./CalendarViewBase";

export function EmployeeCalendarView(props: Omit<CalendarViewProps, "roleLabel">) {
  return <CalendarViewBase roleLabel="Mitarbeiter-Ansicht" {...props} />;
}

export default EmployeeCalendarView;

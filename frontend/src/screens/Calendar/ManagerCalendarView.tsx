import { CalendarViewBase, CalendarViewProps } from "./CalendarViewBase";

export function ManagerCalendarView(props: Omit<CalendarViewProps, "roleLabel">) {
  return <CalendarViewBase roleLabel="Manager-Ansicht" {...props} />;
}

export default ManagerCalendarView;

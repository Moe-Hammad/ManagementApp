import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppSelector } from "@/src/hooks/useRedux";
import { CalendarEvent, UserRole } from "@/src/types/resources";
import {
  fetchManagerCalendarEvents,
  fetchMyCalendarEvents,
} from "@/src/services/api";
import { useThemeMode } from "@/src/theme/ThemeProvider";
import { makeStyles } from "@/src/theme/styles";
import { DarkColors, LightColors } from "@/src/theme/colors";
import ManagerCalendarView from "@/src/screens/Calendar/ManagerCalendarView";
import EmployeeCalendarView from "@/src/screens/Calendar/EmployeeCalendarView";

export default function Calendar() {
  const token = useAppSelector((s) => s.auth.token?.token);
  const role = useAppSelector((s) => s.auth.user?.role);

  const { isDark } = useThemeMode();
  const styles = makeStyles(isDark);
  const palette = isDark ? DarkColors : LightColors;

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [monthAnchor, setMonthAnchor] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  useEffect(() => {
    if (!token || !role) return;
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data =
          role === UserRole.MANAGER
            ? await fetchManagerCalendarEvents(token)
            : await fetchMyCalendarEvents(token);
        if (active) setEvents(data);
      } catch (err: any) {
        if (active) setError(err.message || "Kalender konnte nicht geladen werden.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [token, role]);

  const onPrevMonth = () =>
    setMonthAnchor(
      new Date(monthAnchor.getFullYear(), monthAnchor.getMonth() - 1, 1)
    );
  const onNextMonth = () =>
    setMonthAnchor(
      new Date(monthAnchor.getFullYear(), monthAnchor.getMonth() + 1, 1)
    );

  const sharedProps = {
    events,
    loading,
    error,
    monthAnchor,
    selectedDate,
    onSelectDate: setSelectedDate,
    onPrevMonth,
    onNextMonth,
    palette,
    styles,
  };

  const ViewComponent =
    role === UserRole.MANAGER ? ManagerCalendarView : EmployeeCalendarView;

  return (
    <SafeAreaView style={[styles.screen, styles.calendarWrapper]}>
      <ViewComponent {...sharedProps} />
    </SafeAreaView>
  );
}

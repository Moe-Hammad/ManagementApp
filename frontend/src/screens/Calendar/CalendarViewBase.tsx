import { useMemo } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import moment from "moment";
import { DarkColors, LightColors } from "@/src/theme/colors";
import { CalendarEvent, AssignmentStatus, CalendarEntryType } from "@/src/types/resources";

const weekdays = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

export type CalendarViewProps = {
  roleLabel: string;
  events: CalendarEvent[];
  loading: boolean;
  error: string | null;
  monthAnchor: Date;
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  palette: typeof LightColors | typeof DarkColors;
  styles: ReturnType<typeof import("@/src/theme/styles").makeStyles>;
};

const eventColor = (
  ev: CalendarEvent,
  palette: typeof LightColors | typeof DarkColors
) => {
  if (ev.assignmentStatus === AssignmentStatus.DECLINED) return "#ef4444"; // red
  if (ev.assignmentStatus === AssignmentStatus.PENDING) return "#f59e0b"; // amber
  if (ev.assignmentStatus === AssignmentStatus.ACCEPTED) return "#22c55e"; // green
  if (ev.type === CalendarEntryType.VACATION) return "#9b59b6";
  if (ev.type === CalendarEntryType.SICK) return "#e67e22";
  return palette.primary;
};

const statusColor = (status?: AssignmentStatus | null) => {
  if (status === AssignmentStatus.ACCEPTED) return "#22c55e";
  if (status === AssignmentStatus.DECLINED) return "#ef4444";
  if (status === AssignmentStatus.PENDING) return "#f59e0b";
  return "#94a3b8"; // muted
};

const formatTime = (d: Date) =>
  d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const dayKey = (date: Date | string | number) =>
  moment(date).startOf("day").format("YYYY-MM-DD");

export function CalendarViewBase({
  roleLabel,
  events,
  loading,
  error,
  monthAnchor,
  selectedDate,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
  palette,
  styles,
}: CalendarViewProps) {
  const monthDays = useMemo(() => {
    const start = new Date(monthAnchor.getFullYear(), monthAnchor.getMonth(), 1);
    const end = new Date(monthAnchor.getFullYear(), monthAnchor.getMonth() + 1, 0);
    const daysInMonth = end.getDate();
    const startWeekday = (start.getDay() + 6) % 7;
    const cells: (Date | null)[] = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(new Date(monthAnchor.getFullYear(), monthAnchor.getMonth(), d));
    }
    return cells;
  }, [monthAnchor]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    events.forEach((ev) => {
      const dateKey = dayKey(ev.start);
      if (!map.has(dateKey)) map.set(dateKey, []);
      map.get(dateKey)!.push(ev);
    });
    return map;
  }, [events]);

  const selectedKey = dayKey(selectedDate);
  const dayEventsRaw = eventsByDay.get(selectedKey) || [];

  const dayEvents = useMemo(() => {
    const mapped = dayEventsRaw
      .map((ev) => ({
        ...ev,
        startDate: new Date(ev.start),
        endDate: new Date(ev.end),
      }))
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

    const columns: Date[] = [];
    let maxCols = 1;
    const withCols = mapped.map((ev) => {
      let colIndex = columns.findIndex((end) => end.getTime() <= ev.startDate.getTime());
      if (colIndex === -1) {
        colIndex = columns.length;
        columns.push(ev.endDate);
      } else {
        columns[colIndex] = ev.endDate;
      }
      maxCols = Math.max(maxCols, columns.length);
      return { ...ev, colIndex, maxColsSnapshot: maxCols };
    });
    const finalMax = Math.max(...withCols.map((e) => e.maxColsSnapshot), 1);
    return withCols.map((ev) => ({ ...ev, maxCols: finalMax }));
  }, [dayEventsRaw]);

  const groupedEvents = useMemo(() => {
    type Group = {
      base: (typeof dayEvents)[number];
      people: { name?: string | null; status?: AssignmentStatus | null }[];
    };
    const map = new Map<string, Group>();
    dayEvents.forEach((ev) => {
      const key = ev.taskId || ev.id;
      const person = { name: ev.employeeName, status: ev.assignmentStatus };
      if (map.has(key)) {
        map.get(key)!.people.push(person);
      } else {
        map.set(key, { base: ev, people: [person] });
      }
    });
    return Array.from(map.values()).sort(
      (a, b) => a.base.startDate.getTime() - b.base.startDate.getTime()
    );
  }, [dayEvents]);

  const monthLabel = monthAnchor.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const dayTitle = selectedDate.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <View style={styles.calendarWrapper}>
      <Text style={[styles.title, { marginBottom: 4 }]}>Kalender</Text>
      <Text style={[styles.calendarRoleLabel, { color: palette.secondary }]}>
        {roleLabel}
      </Text>

      <View style={styles.calendarCard}>
        <View style={styles.calendarMonthHeader}>
          <Pressable onPress={onPrevMonth} style={{ padding: 6 }}>
            <Text style={{ color: palette.primary }}>{"<"}</Text>
          </Pressable>
          <Text style={{ color: palette.text, fontWeight: "700" }}>{monthLabel}</Text>
          <Pressable onPress={onNextMonth} style={{ padding: 6 }}>
            <Text style={{ color: palette.primary }}>{">"}</Text>
          </Pressable>
        </View>

        <View style={styles.calendarWeekRow}>
          {weekdays.map((w) => (
            <Text
              key={w}
              style={{ flex: 1, textAlign: "center", color: palette.secondary }}
            >
              {w}
            </Text>
          ))}
        </View>

        <View style={styles.calendarDayGrid}>
          {monthDays.map((day, idx) => {
            if (!day) {
              return <View key={idx} style={styles.calendarDayCell} />;
            }
            const isSelected = dayKey(day) === selectedKey;
            const hasEvents = eventsByDay.get(dayKey(day))?.length > 0;
            return (
              <Pressable
                key={idx}
                onPress={() => onSelectDate(day)}
                style={styles.calendarDayCell}
              >
                <View
                  style={[
                    styles.calendarDayNumber,
                    {
                      backgroundColor: isSelected ? palette.primary : "transparent",
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: isSelected ? "#fff" : palette.text,
                      fontWeight: isSelected ? "700" : "500",
                    }}
                  >
                    {day.getDate()}
                  </Text>
                </View>
                {hasEvents && (
                  <View
                    style={[
                      styles.calendarDot,
                      { backgroundColor: palette.primary },
                    ]}
                  />
                )}
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={{ marginTop: 16, flex: 1 }}>
        <Text style={[styles.label, { marginBottom: 6 }]}>{dayTitle}</Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            marginBottom: 8,
          }}
        >
          {[
            { label: "Angenommen", color: statusColor(AssignmentStatus.ACCEPTED) },
            { label: "Ausstehend", color: statusColor(AssignmentStatus.PENDING) },
            { label: "Abgelehnt", color: statusColor(AssignmentStatus.DECLINED) },
          ].map((item) => (
            <View
              key={item.label}
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: item.color,
                }}
              />
              <Text style={{ color: palette.text, fontSize: 12 }}>{item.label}</Text>
            </View>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator color={palette.primary} />
        ) : error ? (
          <Text style={styles.calendarErrorText}>{error}</Text>
        ) : groupedEvents.length === 0 ? (
          <Text style={[styles.calendarEmptyText, { color: palette.secondary }]}>
            Keine Eintr„ge.
          </Text>
        ) : (
          <ScrollView
            style={[
              styles.calendarTimeline,
              { borderColor: palette.border, backgroundColor: palette.card },
            ]}
          >
            {groupedEvents.map((group) => {
              const ev = group.base;
              const color = eventColor(ev, palette);
              return (
                <View key={ev.id} style={[styles.calendarEventRow, { flexDirection: "column" }]}>
                  <View
                    style={[
                      styles.calendarEventCard,
                      {
                        borderColor: color,
                        backgroundColor: `${color}22`,
                        width: "100%",
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: palette.text,
                        fontWeight: "700",
                        marginBottom: 4,
                      }}
                    >
                      {ev.company || ev.location || "Task"}
                    </Text>
                    <Text style={{ color: palette.text }}>
                      {formatTime(ev.startDate)} - {formatTime(ev.endDate)}
                    </Text>
                    {group.people.map((p, idx) => (
                      <View
                        key={idx}
                        style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 }}
                      >
                        <View
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: statusColor(p.status),
                          }}
                        />
                        <Text style={{ color: palette.secondary }}>
                          {p.name || "Unbekannt"}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

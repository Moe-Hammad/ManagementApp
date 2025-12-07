import React, { useState } from "react";
import { Platform, Pressable, View, Text } from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

export type UnifiedPickerProps = {
  label?: string;
  mode: "date" | "time" | "datetime";
  value: Date;
  onChange: (newValue: Date) => void;
  palette: any;
  styles: any;
};

export default function UnifiedPicker({
  label,
  mode,
  value,
  onChange,
  palette,
  styles,
}: UnifiedPickerProps) {
  const [open, setOpen] = useState(false);
  const isAndroid = Platform.OS === "android";

  const displayValue = () => {
    if (mode === "time") {
      return value.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    if (mode === "date") return value.toLocaleDateString();
    return value.toLocaleString();
  };

  const handleToggle = () => {
    setOpen((prev) => !prev);
  };

  const handleChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (selectedDate) {
      onChange(selectedDate);
    }
    if (isAndroid) {
      setOpen(false);
    }
  };

  return (
    <View style={{ marginBottom: 14 }}>
      {label && <Text style={styles.createTimeLabel}>{label}</Text>}

      <Pressable
        onPress={handleToggle}
        style={[
          styles.input,
          styles.createDateInput,
          { backgroundColor: palette.surface },
        ]}
      >
        <Text style={{ color: palette.text }}>{displayValue()}</Text>
      </Pressable>

      {open && (
        <DateTimePicker
          mode={mode}
          display={isAndroid ? "default" : "spinner"}
          value={value}
          onChange={handleChange}
        />
      )}
    </View>
  );
}

import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../config";

const formatDate = (date) => {
  if (!date) return null;
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
};

export default function DatePicker({ label, value, onChange }) {
  const [show, setShow] = useState(false);
  // internal temp date while picker is open on Android
  const [tempDate, setTempDate] = useState(null);

  const handleChange = (event, selectedDate) => {
    if (Platform.OS === "android") {
      setShow(false);
      // event.type: 'set' = confirmed, 'dismissed' = cancelled
      if (event.type === "set" && selectedDate) {
        onChange(selectedDate, formatDate(selectedDate));
      }
      // if dismissed, do nothing — keep existing value
    } else {
      // iOS: picker stays open, update live
      if (selectedDate) {
        setTempDate(selectedDate);
        onChange(selectedDate, formatDate(selectedDate));
      }
    }
  };

  const displayDate = value ? formatDate(value) : null;

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity
        style={[styles.input, displayDate ? styles.inputFilled : null]}
        onPress={() => setShow(true)}
        activeOpacity={0.8}
      >
        <Text style={displayDate ? styles.valueText : styles.placeholder}>
          {displayDate || "Select your birthday"}
        </Text>
        <Text style={styles.icon}>📅</Text>
      </TouchableOpacity>

      {show && (
        <DateTimePicker
          value={value || new Date(2002, 0, 1)}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          maximumDate={new Date()}
          minimumDate={new Date(1950, 0, 1)}
          onChange={handleChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 14 },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 5,
  },
  input: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: COLORS.lightGray,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#F9FAFE",
  },
  inputFilled: { borderColor: COLORS.blue },
  valueText: { fontSize: 15, color: COLORS.black },
  placeholder: { fontSize: 15, color: COLORS.gray },
  icon: { fontSize: 18 },
});

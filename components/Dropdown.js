import { useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../config";

export default function Dropdown({
  label,
  placeholder,
  options,
  value,
  onChange,
  disabled,
}) {
  const [open, setOpen] = useState(false);

  const selected = options.find((o) => o.value === value);

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity
        style={[styles.input, disabled && styles.disabled]}
        onPress={() => {
          if (!disabled) setOpen(true);
        }}
        activeOpacity={0.8}
      >
        <Text
          style={selected ? styles.valueText : styles.placeholder}
          numberOfLines={1}
        >
          {selected ? selected.label : placeholder || "Select..."}
        </Text>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.modalContainer}>
          {/* Backdrop — tap to close */}
          <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />

          {/* Sheet */}
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{label}</Text>
              <TouchableOpacity
                onPress={() => setOpen(false)}
                style={styles.closeBtn}
              >
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={options}
              keyExtractor={(item) => String(item.value)}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              renderItem={({ item }) => {
                const isSelected = item.value === value;
                return (
                  <Pressable
                    style={({ pressed }) => [
                      styles.option,
                      isSelected && styles.optionSelected,
                      pressed && styles.optionPressed,
                    ]}
                    onPress={() => {
                      onChange(item.value, item.label);
                      setOpen(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && styles.optionTextSelected,
                      ]}
                    >
                      {item.label}
                    </Text>
                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                  </Pressable>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: "600", color: "#1a1a1a", marginBottom: 5 },
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
  disabled: { opacity: 0.5 },
  valueText: { fontSize: 15, color: "#1a1a1a", flex: 1 },
  placeholder: { fontSize: 15, color: COLORS.gray, flex: 1 },
  arrow: { color: COLORS.gray, fontSize: 12, marginLeft: 8 },

  // Modal layout
  modalContainer: { flex: 1, justifyContent: "flex-end" },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
    maxHeight: "65%",
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  sheetTitle: { fontSize: 16, fontWeight: "700", color: "#1a1a1a" },
  closeBtn: { padding: 4 },
  closeBtnText: { fontSize: 18, color: COLORS.gray },

  // Options
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  optionSelected: { backgroundColor: "#EEF0FF" },
  optionPressed: { backgroundColor: "#F0F0F0" },
  optionText: { fontSize: 15, color: "#1a1a1a", flex: 1 },
  optionTextSelected: { color: COLORS.blue, fontWeight: "700" },
  checkmark: { color: COLORS.blue, fontWeight: "700", fontSize: 16 },
  separator: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginHorizontal: 20,
  },
});

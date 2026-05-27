import { useRef, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { COLORS } from "../config";

const ChevronDown = ({ open }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d={open ? "M18 15l-6-6-6 6" : "M6 9l6 6 6-6"}
      stroke={COLORS.gray}
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default function Dropdown({
  label,
  placeholder,
  options = [],
  value,
  onChange,
  disabled,
}) {
  const [open, setOpen] = useState(false);
  const [layout, setLayout] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    pageY: 0,
  });
  const triggerRef = useRef(null);

  const selected = options.find((o) => o.value === value);

  const measureTrigger = () => {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setLayout({ x, y, width, height, pageY: y });
      setOpen(true);
    });
  };

  return (
    <View style={s.wrapper}>
      {label && <Text style={s.label}>{label}</Text>}

      {/* Trigger */}
      <TouchableOpacity
        ref={triggerRef}
        style={[s.trigger, open && s.triggerOpen, disabled && s.disabled]}
        onPress={() => {
          if (!disabled) {
            open ? setOpen(false) : measureTrigger();
          }
        }}
        activeOpacity={0.8}
      >
        <Text style={selected ? s.valueText : s.placeholder} numberOfLines={1}>
          {selected ? selected.label : placeholder || "Select..."}
        </Text>
        <ChevronDown open={open} />
      </TouchableOpacity>

      {/* Pull-down list in Modal */}
      <Modal
        visible={open}
        transparent
        animationType="none"
        onRequestClose={() => setOpen(false)}
      >
        {/* Backdrop */}
        <Pressable style={s.backdrop} onPress={() => setOpen(false)} />

        {/* Dropdown list positioned below the trigger */}
        <View
          style={[
            s.list,
            {
              position: "absolute",
              top: layout.pageY + layout.height + 4,
              left: layout.x,
              width: layout.width,
            },
          ]}
        >
          <FlatList
            data={options}
            keyExtractor={(item) => String(item.value)}
            keyboardShouldPersistTaps="handled"
            ItemSeparatorComponent={() => <View style={s.sep} />}
            renderItem={({ item }) => {
              const isSelected = item.value === value;
              return (
                <Pressable
                  style={({ pressed }) => [
                    s.option,
                    isSelected && s.optionActive,
                    pressed && s.optionPressed,
                  ]}
                  onPress={() => {
                    onChange(item.value, item.label);
                    setOpen(false);
                  }}
                >
                  <Text
                    style={[s.optionText, isSelected && s.optionTextActive]}
                    numberOfLines={1}
                  >
                    {item.label}
                  </Text>
                  {isSelected && (
                    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M5 13l4 4L19 7"
                        stroke={COLORS.blue}
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                  )}
                </Pressable>
              );
            }}
          />
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  wrapper: { marginBottom: 8 },
  label: { fontSize: 13, fontWeight: "600", color: "#1a1a1a", marginBottom: 5 },
  trigger: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E8EEFF",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    backgroundColor: "#F4F7FF",
  },
  triggerOpen: { borderColor: COLORS.blue, backgroundColor: "#EFF5FF" },
  disabled: { opacity: 0.5 },
  valueText: { fontSize: 15, color: "#1a3a5c", flex: 1, fontWeight: "500" },
  placeholder: { fontSize: 15, color: "#BBC", flex: 1 },
  backdrop: { ...StyleSheet.absoluteFillObject },
  list: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8EEFF",
    maxHeight: 220,
    elevation: 16,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    overflow: "hidden",
  },
  sep: { height: 1, backgroundColor: "#F0F4FF", marginHorizontal: 12 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  optionActive: { backgroundColor: "#EFF5FF" },
  optionPressed: { backgroundColor: "#F5F8FF" },
  optionText: { fontSize: 14, color: "#333", flex: 1 },
  optionTextActive: { color: COLORS.blue, fontWeight: "700" },
});
